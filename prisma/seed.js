// Create a sample NIR
console.log("Creating sample NIR...");
if (products.length > 5) {
  await prisma.nIR.create({
    data: {
      supplierId: suppliers[0].id,
      number: "NIR-001",
      items: {
        create: [
          { productId: products[0].id, departmentId: departments[0].id, quantity: 20, price: products[0].price },
          { productId: products[1].id, departmentId: departments[0].id, quantity: 10, price: products[1].price },
        ],
      },
    },
  });
  console.log("✓ Created sample NIR\n");
}
