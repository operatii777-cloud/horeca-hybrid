const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  // Create users with PINs
  const admin = await prisma.user.create({
    data: { name: "Admin", pin: "0000", role: "admin" },
  });

  const waiterNames = [
    "Ospatar 1",
    "Ospatar 2",
    "Ospatar 3",
    "Ospatar 4",
    "Ospatar 5",
    "Ospatar 6",
    "Ospatar 7",
    "Ospatar 8",
    "Ospatar 9",
  ];
  for (let i = 0; i < waiterNames.length; i++) {
    await prisma.user.create({
      data: {
        name: waiterNames[i],
        pin: `${i + 1}${i + 1}${i + 1}${i + 1}`,
        role: "waiter",
      },
    });
  }

  // Create departments (from Depart.txt)
  const departments = await Promise.all(
    ["BUCATARIE", "BAR", "BUFET", "DIVERSE"].map((name) =>
      prisma.department.create({ data: { name } })
    )
  );

  // Create categories (from Grupe.txt)
  const categories = await Promise.all(
    [
      "Bucatarie",
      "Bar",
      "Alcoolice",
      "Materiale auxiliare",
    ].map((name) => prisma.category.create({ data: { name } }))
  );

  // Create sample products
  const products = [
    // Bucatarie products
    { name: "PIZZA MARGHERITA", price: 32, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "PIZZA BARON", price: 38, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "FICATEI BARON", price: 28, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "SUPA CREMA", price: 18, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "CIORBA DE BURTA", price: 22, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "GRATAR MIXT", price: 45, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "PASTE CARBONARA", price: 35, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "SALATA CAESAR", price: 25, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    // Bar products
    { name: "COCA COLA", price: 8, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "FANTA", price: 8, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "SPRITE", price: 8, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "CAPY NECTAR", price: 7, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "SANTAL", price: 7, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "APA PLATA", price: 5, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "APA MINERALA", price: 6, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "CAFEA", price: 10, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    // Alcoolice
    { name: "BERE URSUS", price: 12, unit: "buc", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "BERE HEINEKEN", price: 14, unit: "buc", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "VIN ROSU", price: 20, unit: "pahar", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "VIN ALB", price: 18, unit: "pahar", departmentId: departments[1].id, categoryId: categories[2].id },
    // Bufet
    { name: "FRESH PORTOCALE", price: 15, unit: "buc", departmentId: departments[2].id, categoryId: categories[1].id },
    { name: "LIMONADA", price: 12, unit: "buc", departmentId: departments[2].id, categoryId: categories[1].id },
    // Diverse
    { name: "SERVETELE", price: 2, unit: "buc", departmentId: departments[3].id, categoryId: categories[3].id },
    { name: "PAIE", price: 1, unit: "buc", departmentId: departments[3].id, categoryId: categories[3].id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log("Database seeded successfully!");
  console.log(`- ${waiterNames.length + 1} users (1 admin + ${waiterNames.length} waiters)`);
  console.log(`- ${departments.length} departments`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${products.length} products`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
