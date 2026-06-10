import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkInStr = searchParams.get('checkIn');
    const checkOutStr = searchParams.get('checkOut');

    if (!checkInStr || !checkOutStr) {
      return NextResponse.json(
        { error: 'checkIn and checkOut date parameters are required' },
        { status: 400 }
      );
    }

    const checkIn = new Date(checkInStr);
    const checkOut = new Date(checkOutStr);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { error: 'Invalid checkIn or checkOut date format' },
        { status: 400 }
      );
    }

    if (checkIn >= checkOut) {
      return NextResponse.json(
        { error: 'checkIn date must be before checkOut date' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Self-cleaning step: delete expired temporary blocks
    await prisma.booking.deleteMany({
      where: {
        status: 'blocked',
        expiresAt: {
          lt: now,
        },
      },
    });

    // Fetch the catalog to know prices and capacities
    const catalog = await prisma.catalog.findMany();

    if (catalog.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron elementos en el catálogo.' },
        { status: 500 }
      );
    }

    // Fetch all active bookings (confirmed, or blocked in the future) that overlap with the range
    const activeBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['blocked', 'confirmed'] },
        AND: [
          { checkIn: { lt: checkOut } },
          { checkOut: { gt: checkIn } },
        ],
      },
    });

    // Calculate maximum simultaneous occupancy per night in the date range
    const nights: Date[] = [];
    const current = new Date(checkIn);
    while (current < checkOut) {
      nights.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const products: { [key: string]: any } = {};

    for (const item of catalog) {
      let maxBooked = 0;

      for (const night of nights) {
        const nightStart = new Date(night);
        nightStart.setHours(0, 0, 0, 0);
        const nightEnd = new Date(night);
        nightEnd.setHours(23, 59, 59, 999);

        // Filter bookings that cover this night for this accommodation item
        const bookingsOnNight = activeBookings.filter((b) => {
          if (b.accommodationId !== item.id) return false;
          const bIn = new Date(b.checkIn);
          const bOut = new Date(b.checkOut);
          return bIn < nightEnd && bOut > nightStart;
        });

        if (bookingsOnNight.length > maxBooked) {
          maxBooked = bookingsOnNight.length;
        }
      }

      products[item.id] = {
        id: item.id,
        name: item.name,
        basePrice: item.basePrice,
        capacity: item.capacity,
        available: Math.max(0, item.capacity - maxBooked),
        description: item.description,
      };
    }

    return NextResponse.json({
      products,
      numberOfNights: nights.length,
    });
  } catch (error: any) {
    console.error('Error in availability API:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}
