const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning database...');
  // Delete bookings first because they have foreign key references to Catalog
  await prisma.booking.deleteMany({});
  await prisma.catalog.deleteMany({});

  console.log('Seeding updated catalog...');

  // 1. Capsule Pods
  const capsule = await prisma.catalog.create({
    data: {
      id: 'capsule',
      name: 'Cápsula Individual (Pod)',
      basePrice: 700.0,
      capacity: 40,
      description: 'Cabina individual y futurista climatizada con iluminación LED personalizable, conexión Wi-Fi de alta velocidad, puertos de carga y colchón ergonómico de alta densidad.',
    }
  });

  // 2. Room with Private Bath
  const roomWithBath = await prisma.catalog.create({
    data: {
      id: 'private_room_bath',
      name: 'Cuarto con Baño Privado',
      basePrice: 2300.0,
      capacity: 1,
      description: 'Habitación privada premium con cama matrimonial, baño privado en suite, escritorio de trabajo, climatización inteligente, TV 4K y diseño de iluminación ciberespacial. Capacidad para 2 personas.',
    }
  });

  // 3. Room without Private Bath
  const roomNoBath = await prisma.catalog.create({
    data: {
      id: 'private_room_no_bath',
      name: 'Cuarto sin Baño Privado',
      basePrice: 1500.0,
      capacity: 1,
      description: 'Habitación privada con cama matrimonial, baño compartido de alta gama, climatización inteligente, TV 4K, Wi-Fi de alta velocidad y diseño futurista. Capacidad para 2 personas.',
    }
  });

  console.log('Catalog seeded successfully:', { capsule, roomWithBath, roomNoBath });
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
