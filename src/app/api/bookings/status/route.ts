import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        accommodation: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error('Error fetching booking status:', error);
    return NextResponse.json(
      { error: 'Error al obtener estado de reserva: ' + error.message },
      { status: 500 }
    );
  }
}
