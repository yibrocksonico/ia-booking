import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendConfirmationEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check event type
    if (body.type !== 'order.paid') {
      // Return 200 so Conekta knows we received it but we don't need to process it
      return NextResponse.json({ received: true, reason: 'unhandled event type' });
    }

    const orderObj = body.data?.object;
    if (!orderObj || !orderObj.id) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Call Conekta API directly to verify the order was indeed paid (prevents webhook spoofing/frauds)
    const conektaApiKey = process.env.CONEKTA_PRIVATE_KEY?.replace(/['"]/g, '');
    if (!conektaApiKey) {
      console.error('[CONEKTA WEBHOOK ERROR] Private key is missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const conektaRes = await fetch(`https://api.conekta.io/orders/${orderObj.id}`, {
      headers: {
        'accept': 'application/vnd.conekta-v2.2.0+json',
        'Authorization': `Bearer ${conektaApiKey}`,
      },
    });

    if (!conektaRes.ok) {
      console.error(`[CONEKTA WEBHOOK ERROR] Failed to fetch order ${orderObj.id} from Conekta`);
      return NextResponse.json({ error: 'Failed to verify order with Conekta' }, { status: 400 });
    }

    const conektaOrder = await conektaRes.json();
    
    // Check verification status
    if (conektaOrder.payment_status !== 'paid') {
      console.error(`[CONEKTA WEBHOOK ERROR] Order ${orderObj.id} status is not paid: ${conektaOrder.payment_status}`);
      return NextResponse.json({ error: 'Order is not paid' }, { status: 400 });
    }

    // Get metadata
    const metadata = conektaOrder.metadata || {};
    const bookingId = metadata.booking_id;

    if (!bookingId) {
      console.error(`[CONEKTA WEBHOOK ERROR] Order ${orderObj.id} is missing booking_id in metadata`);
      return NextResponse.json({ error: 'Missing booking_id metadata' }, { status: 400 });
    }

    // Look for existing booking in the database
    let booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { accommodation: true },
    });

    let catalogName = '';

    if (booking) {
      catalogName = booking.accommodation.name;

      if (booking.status !== 'confirmed') {
        // Update booking to confirmed status
        booking = await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'confirmed',
            paymentStatus: 'completed',
            expiresAt: null, // Cancel any expirations
          },
          include: { accommodation: true },
        });

        console.log(`[CONEKTA WEBHOOK] Updated booking ${bookingId} to confirmed status`);
        
        // Send email
        try {
          await sendConfirmationEmail(booking, catalogName);
        } catch (emailErr) {
          console.error('[CONEKTA WEBHOOK EMAIL ERROR] Failed to send email:', emailErr);
        }
      } else {
        console.log(`[CONEKTA WEBHOOK] Booking ${bookingId} was already confirmed`);
      }
    } else {
      // Recreate booking from metadata since it expired and got deleted
      console.log(`[CONEKTA WEBHOOK] Booking ${bookingId} was deleted/expired. Recreating booking from Conekta metadata.`);

      const accommodationId = metadata.accommodation_id;
      const checkInStr = metadata.check_in;
      const checkOutStr = metadata.check_out;
      const basePrice = parseFloat(metadata.base_price || '0');
      const totalPrice = parseFloat(metadata.total_price || '0');

      if (!accommodationId || !checkInStr || !checkOutStr) {
        console.error(`[CONEKTA WEBHOOK ERROR] Incomplete metadata in order ${orderObj.id} to recreate booking`);
        return NextResponse.json({ error: 'Incomplete metadata for recreation' }, { status: 400 });
      }

      // Check if catalog exists
      const catalogItem = await prisma.catalog.findUnique({
        where: { id: accommodationId },
      });

      if (!catalogItem) {
        console.error(`[CONEKTA WEBHOOK ERROR] Catalog item ${accommodationId} not found in database`);
        return NextResponse.json({ error: 'Catalog item not found' }, { status: 404 });
      }

      catalogName = catalogItem.name;

      // Extract customer details from Conekta Order
      const customerName = conektaOrder.customer_info?.name || 'Cliente Conekta';
      const customerEmail = conektaOrder.customer_info?.email || 'conekta@example.com';
      const customerPhone = conektaOrder.customer_info?.phone || '5555555555';

      // Recreate booking
      booking = await prisma.booking.create({
        data: {
          id: bookingId,
          customerName,
          customerEmail,
          customerPhone,
          accommodationId,
          checkIn: new Date(checkInStr),
          checkOut: new Date(checkOutStr),
          basePrice,
          totalPrice,
          status: 'confirmed',
          paymentMethod: 'conekta',
          paymentStatus: 'completed',
          expiresAt: null, // Confirmed booking has no expiry
        },
        include: { accommodation: true },
      });

      console.log(`[CONEKTA WEBHOOK] Recreated booking ${bookingId} as confirmed`);

      // Send email
      try {
        await sendConfirmationEmail(booking, catalogName);
      } catch (emailErr) {
        console.error('[CONEKTA WEBHOOK EMAIL ERROR] Failed to send email for recreated booking:', emailErr);
      }
    }

    return NextResponse.json({ success: true, bookingId });
  } catch (error: any) {
    console.error('[CONEKTA WEBHOOK ERROR]', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}
