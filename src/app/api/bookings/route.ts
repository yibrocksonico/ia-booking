import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConfirmationEmail } from '@/lib/email';

// Helper to generate a unique booking code like CB-XXXXX
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, O, 0, 1
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CB-${code}`;
}

// GET all bookings (Admin only)
export async function GET() {
  try {
    const now = new Date();

    // Clean up expired temporary blocks before displaying
    await prisma.booking.deleteMany({
      where: {
        status: 'blocked',
        expiresAt: {
          lt: now,
        },
      },
    });

    const bookings = await prisma.booking.findMany({
      include: {
        accommodation: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// POST create a new booking / block
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      accommodationId,
      checkInStr,
      checkOutStr,
      paymentMethod,
      paymentStatus, // 'pending' or 'completed' (for PayPal immediately finished)
      receiptBase64,
      receiptMimeType,
    } = body;

    // Validate minimum data
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !accommodationId ||
      !checkInStr ||
      !checkOutStr ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios son necesarios.' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: 'Formato de fecha inválido.' },
        { status: 400 }
      );
    }

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'La fecha de check-in debe ser anterior a la de check-out.' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Self-cleaning step: delete expired blocks
    await prisma.booking.deleteMany({
      where: {
        status: 'blocked',
        expiresAt: {
          lt: now,
        },
      },
    });

    // Check catalog and price
    const catalogItem = await prisma.catalog.findUnique({
      where: { id: accommodationId },
    });

    if (!catalogItem) {
      return NextResponse.json(
        { error: 'El tipo de alojamiento seleccionado no existe en el catálogo.' },
        { status: 404 }
      );
    }

    // Verify availability for the date range
    // Overlapping active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        accommodationId,
        status: { in: ['blocked', 'confirmed'] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    // Calculate nights
    const nights: Date[] = [];
    const current = new Date(checkIn);
    while (current < checkOut) {
      nights.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    let maxBooked = 0;
    for (const night of nights) {
      const nightStart = new Date(night);
      nightStart.setHours(0, 0, 0, 0);
      const nightEnd = new Date(night);
      nightEnd.setHours(23, 59, 59, 999);

      const bookingsOnNight = activeBookings.filter((b) => {
        const bIn = new Date(b.checkIn);
        const bOut = new Date(b.checkOut);
        return bIn < nightEnd && bOut > nightStart;
      });

      if (bookingsOnNight.length > maxBooked) {
        maxBooked = bookingsOnNight.length;
      }
    }

    if (maxBooked >= catalogItem.capacity) {
      return NextResponse.json(
        { error: `Lo sentimos, ya no hay cupo disponible para ${catalogItem.name} en las fechas seleccionadas.` },
        { status: 400 }
      );
    }

    // Calculate total price
    const numberOfNights = nights.length;
    const basePrice = catalogItem.basePrice;
    const totalPrice = basePrice * numberOfNights;

    // Generate unique code and ensure uniqueness
    let bookingCode = generateBookingCode();
    let codeUnique = false;
    let attempts = 0;
    while (!codeUnique && attempts < 10) {
      const existing = await prisma.booking.findUnique({
        where: { id: bookingCode },
      });
      if (!existing) {
        codeUnique = true;
      } else {
        bookingCode = generateBookingCode();
      }
      attempts++;
    }

    // Set statuses and expirations
    let bookingStatus = 'blocked';
    let pStatus = 'pending';
    let expiresAt: Date | null = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes block

    if (paymentMethod === 'paypal' && paymentStatus === 'completed') {
      bookingStatus = 'confirmed';
      pStatus = 'completed';
      expiresAt = null; // Confirmed bookings don't expire
    } else if (paymentMethod === 'transfer' && receiptBase64) {
      // If client uploads transfer receipt, they request confirmation
      // The admin needs to verify, but the block is locked for verification (or keep 10m block?
      // Actually, for bank transfer with receipt, we keep it blocked and wait for admin approval.
      // But we change status to "blocked" but we don't expire it immediately if receipt is uploaded!
      // This is a crucial detail: if they upload a receipt, the reservation is "pending review", 
      // so it shouldn't expire in 10 minutes. The admin must manually approve or reject it.
      // So we set expiresAt = null and keep status = "blocked" (or "pending_verification" which we handle as blocked).
      // Let's use status = "blocked" and expiresAt = null to keep the block permanently until the admin verifies it!)
      bookingStatus = 'blocked';
      pStatus = 'pending';
      expiresAt = null; // Permanent block until admin reviews the receipt
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        id: bookingCode,
        customerName,
        customerEmail,
        customerPhone,
        accommodationId,
        checkIn,
        checkOut,
        basePrice,
        totalPrice,
        status: bookingStatus,
        paymentMethod,
        paymentStatus: pStatus,
        receiptBase64: receiptBase64 || null,
        receiptMimeType: receiptMimeType || null,
        expiresAt,
      },
    });

    // Send confirmation email immediately if booking is confirmed (PayPal)
    if (booking.status === 'confirmed') {
      try {
        await sendConfirmationEmail(booking, catalogItem.name);
      } catch (emailErr) {
        console.error('Error sending confirmation email in POST:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT to update booking status (Admin actions: confirm payment, check-in, cancel)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, action, assignedPod, status, paymentStatus } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    if (action === 'confirm_payment') {
      updateData.status = 'confirmed';
      updateData.paymentStatus = 'completed';
      updateData.expiresAt = null; // Ensure block is permanent
    } else if (action === 'check_in') {
      updateData.assignedPod = parseInt(assignedPod, 10);
      // Ensure it is confirmed
      updateData.status = 'confirmed';
    } else if (action === 'cancel') {
      updateData.status = 'cancelled';
      updateData.expiresAt = null;
    } else {
      // General direct update
      if (status) updateData.status = status;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      if (assignedPod !== undefined) updateData.assignedPod = assignedPod ? parseInt(assignedPod, 10) : null;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
      include: {
        accommodation: true,
      },
    });

    // Send confirmation email if payment was confirmed manually by the admin (e.g. transfer approved)
    if (action === 'confirm_payment') {
      try {
        await sendConfirmationEmail(updatedBooking, updatedBooking.accommodation.name);
      } catch (emailErr) {
        console.error('Error sending confirmation email in PUT:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: 'Error al actualizar reserva: ' + error.message },
      { status: 500 }
    );
  }
}
