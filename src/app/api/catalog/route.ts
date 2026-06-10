import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET catalog list
export async function GET() {
  try {
    const catalog = await prisma.catalog.findMany({
      orderBy: { id: 'asc' },
    });
    return NextResponse.json(catalog);
  } catch (error: any) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT/POST to update catalog item price & description
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, basePrice, name, description, capacity } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'El ID del catálogo es obligatorio.' },
        { status: 400 }
      );
    }

    const item = await prisma.catalog.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'El elemento del catálogo no existe.' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (basePrice !== undefined) updateData.basePrice = parseFloat(basePrice);
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity, 10);

    const updatedItem = await prisma.catalog.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      catalog: updatedItem,
    });
  } catch (error: any) {
    console.error('Error updating catalog:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el catálogo: ' + error.message },
      { status: 500 }
    );
  }
}
