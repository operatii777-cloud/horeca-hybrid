const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Clear existing data in dependency order
  await prisma.waiterCall.deleteMany();
  await prisma.consumptionVoucher.deleteMany();
  await prisma.wasteEntry.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.shiftHandover.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.hACCPCheck.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.returItem.deleteMany();
  await prisma.retur.deleteMany();
  await prisma.transferItem.deleteMany();
  await prisma.transfer.deleteMany();
  await prisma.nIRItem.deleteMany();
  await prisma.nIR.deleteMany();
  await prisma.recipeItem.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.stock.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.department.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // Create users with PINs
  await prisma.user.create({
    data: { name: "Admin", pin: "0000", role: "admin" },
  });

  const waiterNames = [
    "Ospatar 1", "Ospatar 2", "Ospatar 3", "Ospatar 4", "Ospatar 5",
    "Ospatar 6", "Ospatar 7", "Ospatar 8", "Ospatar 9",
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

  // Create suppliers
  const suppliers = await Promise.all(
    ["Metro Cash & Carry", "Selgros", "Mega Image", "Furnizor Local"].map(
      (name) => prisma.supplier.create({ data: { name } })
    )
  );

  // Create departments (from Depart.txt)
  const departments = await Promise.all(
    ["BUCATARIE", "BAR", "BUFET", "DIVERSE"].map((name) =>
      prisma.department.create({ data: { name } })
    )
  );

  // Create categories (from Grupe.txt)
  const categories = await Promise.all(
    ["Bucatarie", "Bar", "Alcoolice", "Materiale auxiliare"].map((name) =>
      prisma.category.create({ data: { name } })
    )
  );

  // Create sample products
  const productData = [
    { name: "PIZZA MARGHERITA", price: 32, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "PIZZA BARON", price: 38, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "FICATEI BARON", price: 28, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "SUPA CREMA", price: 18, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "CIORBA DE BURTA", price: 22, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "GRATAR MIXT", price: 45, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "PASTE CARBONARA", price: 35, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "SALATA CAESAR", price: 25, unit: "buc", departmentId: departments[0].id, categoryId: categories[0].id },
    { name: "COCA COLA", price: 8, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "FANTA", price: 8, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "SPRITE", price: 8, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "CAPY NECTAR", price: 7, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "SANTAL", price: 7, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "APA PLATA", price: 5, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "APA MINERALA", price: 6, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "CAFEA", price: 10, unit: "buc", departmentId: departments[1].id, categoryId: categories[1].id },
    { name: "BERE URSUS", price: 12, unit: "buc", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "BERE HEINEKEN", price: 14, unit: "buc", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "VIN ROSU", price: 20, unit: "pahar", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "VIN ALB", price: 18, unit: "pahar", departmentId: departments[1].id, categoryId: categories[2].id },
    { name: "FRESH PORTOCALE", price: 15, unit: "buc", departmentId: departments[2].id, categoryId: categories[1].id },
    { name: "LIMONADA", price: 12, unit: "buc", departmentId: departments[2].id, categoryId: categories[1].id },
    { name: "SERVETELE", price: 2, unit: "buc", departmentId: departments[3].id, categoryId: categories[3].id },
    { name: "PAIE", price: 1, unit: "buc", departmentId: departments[3].id, categoryId: categories[3].id },
    // Raw ingredients for recipes
    { name: "FAINA", price: 3, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
    { name: "MOZZARELLA", price: 25, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
    { name: "SOS ROSII", price: 8, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
    { name: "SPAGHETTI", price: 6, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
    { name: "BACON", price: 30, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
    { name: "SMANTANA", price: 10, unit: "l", departmentId: departments[0].id, categoryId: categories[3].id },
  ];

  const products = [];
  for (const p of productData) {
    products.push(await prisma.product.create({ data: p }));
  }

  // Create initial stock for all products
  for (const product of products) {
    await prisma.stock.create({
      data: {
        productId: product.id,
        departmentId: product.departmentId,
        quantity: 50,
      },
    });
  }

  // Create sample recipes
  // Pizza Margherita recipe
  await prisma.recipe.create({
    data: {
      productId: products[0].id, // PIZZA MARGHERITA
      items: {
        create: [
          { productId: products[24].id, quantity: 0.3 },  // FAINA 0.3kg
          { productId: products[25].id, quantity: 0.15 },  // MOZZARELLA 0.15kg
          { productId: products[26].id, quantity: 0.1 },   // SOS ROSII 0.1kg
        ],
      },
    },
  });

  // Paste Carbonara recipe
  await prisma.recipe.create({
    data: {
      productId: products[6].id, // PASTE CARBONARA
      items: {
        create: [
          { productId: products[27].id, quantity: 0.2 },  // SPAGHETTI 0.2kg
          { productId: products[28].id, quantity: 0.1 },  // BACON 0.1kg
          { productId: products[29].id, quantity: 0.05 }, // SMANTANA 0.05l
        ],
      },
    },
  });

  // Create a sample NIR
  await prisma.nIR.create({
    data: {
      supplierId: suppliers[0].id,
      number: "NIR-001",
      items: {
        create: [
          { productId: products[24].id, departmentId: departments[1].id, quantity: 20, price: 3 },
          { productId: products[25].id, departmentId: departments[1].id, quantity: 10, price: 25 },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
  console.log(`- ${waiterNames.length + 1} users (1 admin + ${waiterNames.length} waiters)`);
  console.log(`- ${suppliers.length} suppliers`);
  console.log(`- ${departments.length} departments`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${products.length} products`);
  console.log("- 2 recipes (Pizza Margherita, Paste Carbonara)");
  console.log("- Initial stock of 50 units per product");
  console.log("- 1 sample NIR");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
