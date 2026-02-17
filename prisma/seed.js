const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const prisma = new PrismaClient();

// Load extracted DBF data
const extractedDataPath = path.join(__dirname, "extracted-dbf-data.json");
const extractedConfigPath = path.join(__dirname, "extracted-config.json");

let extractedData = null;
let extractedConfig = null;

try {
  extractedData = JSON.parse(fs.readFileSync(extractedDataPath, "utf-8"));
  extractedConfig = JSON.parse(fs.readFileSync(extractedConfigPath, "utf-8"));
  console.log("✓ Loaded extracted DBF data");
} catch (err) {
  console.log("⚠ Could not load extracted DBF data, using demo data only");
}

async function main() {
  console.log("Starting database seeding...\n");

  // Clear existing data in dependency order
  console.log("Clearing existing data...");
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
  console.log("✓ Cleared existing data\n");

  // Create users with PINs
  console.log("Creating users...");
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
  console.log(`✓ Created ${waiterNames.length + 1} users\n`);

  // Create suppliers
  console.log("Creating suppliers...");
  const supplierNames = extractedConfig 
    ? ["Metro Cash & Carry", "Selgros", "Mega Image", "Furnizor Local", "LANDI RENZO IT"]
    : ["Metro Cash & Carry", "Selgros", "Mega Image", "Furnizor Local"];
  
  const suppliers = await Promise.all(
    supplierNames.map((name) => prisma.supplier.create({ data: { name } }))
  );
  console.log(`✓ Created ${suppliers.length} suppliers\n`);

  // Create departments
  console.log("Creating departments...");
  const departmentNames = extractedConfig 
    ? extractedConfig.departments 
    : ["BUCATARIE", "BAR", "BUFET", "DIVERSE"];
  
  const departments = await Promise.all(
    departmentNames.map((name) => prisma.department.create({ data: { name } }))
  );
  console.log(`✓ Created ${departments.length} departments\n`);

  // Create categories
  console.log("Creating categories...");
  const categoryNames = extractedConfig 
    ? extractedConfig.categories 
    : ["Bucatarie", "Bar", "Alcoolice", "Materiale auxiliare"];
  
  const categories = await Promise.all(
    categoryNames.map((name) => prisma.category.create({ data: { name } }))
  );
  console.log(`✓ Created ${categories.length} categories\n`);

  // Create products from DBF data
  console.log("Creating products...");
  let products = [];
  let productCodeMap = {}; // Map DBF product codes to created product IDs
  
  if (extractedData && extractedData.products.length > 0) {
    // Map department IDs (DBF uses 1-based, adjust to our departments)
    const depMap = { 0: 0, 1: 1, 2: 0, 3: 2, 4: 3 }; // Map DBF deps to our deps
    const grupMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4 }; // Map groups to categories
    
    for (const prod of extractedData.products) {
      // Skip invalid products
      if (!prod.DEN_PROD || prod.DEN_PROD.length === 0) continue;
      if (prod.PRET1 <= 0) continue;
      
      const depId = Math.min(prod.DEP || 0, departments.length - 1);
      const catId = Math.min(prod.GRUP || 0, categories.length - 1);
      
      try {
        const product = await prisma.product.create({
          data: {
            name: prod.DEN_PROD.trim(),
            price: prod.PRET1 || 0,
            unit: prod.UM || "buc",
            departmentId: departments[depId].id,
            categoryId: categories[catId].id,
          },
        });
        products.push(product);
        productCodeMap[prod.COD_PROD] = product.id;
      } catch (err) {
        console.error(`Error creating product ${prod.DEN_PROD}:`, err.message);
      }
    }
    console.log(`✓ Created ${products.length} finished products from DBF data\n`);
  } else {
    // Fallback: create demo products
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
    ];

    for (const p of productData) {
      products.push(await prisma.product.create({ data: p }));
    }
    console.log(`✓ Created ${products.length} demo products\n`);
  }

  // Create raw materials/ingredients
  console.log("Creating raw materials...");
  let rawMaterialsCreated = 0;
  let rawMaterialCodeMap = {}; // Map DBF material codes to created product IDs
  
  if (extractedData && extractedData.rawMaterials.length > 0) {
    // Create raw materials as products with material category
    const materialCategoryId = categories[categories.length - 1].id; // Last category
    
    for (const mat of extractedData.rawMaterials) {
      if (!mat.DENUMIRE || mat.DENUMIRE.length === 0) continue;
      
      try {
        const product = await prisma.product.create({
          data: {
            name: mat.DENUMIRE.trim(),
            price: mat.PRET || 0,
            unit: mat.UM || "buc",
            departmentId: departments[0].id, // Kitchen by default
            categoryId: materialCategoryId,
          },
        });
        products.push(product);
        rawMaterialCodeMap[mat.COD] = product.id;
        rawMaterialsCreated++;
      } catch (err) {
        console.error(`Error creating raw material ${mat.DENUMIRE}:`, err.message);
      }
    }
    console.log(`✓ Created ${rawMaterialsCreated} raw materials from DBF data\n`);
  } else {
    // Create demo raw materials
    const rawMaterialData = [
      { name: "FAINA", price: 3, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
      { name: "MOZZARELLA", price: 25, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
      { name: "SOS ROSII", price: 8, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
      { name: "SPAGHETTI", price: 6, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
      { name: "BACON", price: 30, unit: "kg", departmentId: departments[0].id, categoryId: categories[3].id },
      { name: "SMANTANA", price: 10, unit: "l", departmentId: departments[0].id, categoryId: categories[3].id },
    ];

    for (const p of rawMaterialData) {
      products.push(await prisma.product.create({ data: p }));
      rawMaterialsCreated++;
    }
    console.log(`✓ Created ${rawMaterialsCreated} demo raw materials\n`);
  }

  // Create initial stock for all products
  console.log("Creating initial stock...");
  for (const product of products) {
    await prisma.stock.create({
      data: {
        productId: product.id,
        departmentId: product.departmentId,
        quantity: 50,
      },
    });
  }
  console.log(`✓ Created stock entries for all products\n`);

  // Create sample recipes
  console.log("Creating recipes...");
  let recipesCreated = 0;
  let recipesSkipped = 0;
  let recipesSkippedNoProduct = 0;
  let recipesSkippedNoIngredients = 0;
  
  if (extractedData && extractedData.recipes.length > 0) {
    // Process all recipes from DBF
    for (const recipe of extractedData.recipes) {
      const prodCode = recipe.product_code;
      const items = recipe.items;
      
      // Find the main product by its DBF code
      const mainProductId = productCodeMap[prodCode];
      if (!mainProductId) {
        recipesSkippedNoProduct++;
        continue; // Skip if product not found
      }
      
      // Create recipe items by matching ingredient codes
      const recipeItems = [];
      for (const item of items) {
        const ingredientId = rawMaterialCodeMap[item.COD_MAT];
        
        if (ingredientId && item.CANT > 0) {
          recipeItems.push({
            productId: ingredientId,
            quantity: item.CANT,
          });
        }
      }
      
      // Create recipe if it has at least one valid ingredient
      if (recipeItems.length > 0) {
        try {
          await prisma.recipe.create({
            data: {
              productId: mainProductId,
              items: {
                create: recipeItems,
              },
            },
          });
          recipesCreated++;
        } catch (err) {
          // Skip duplicate recipes or errors
          recipesSkipped++;
        }
      } else {
        recipesSkippedNoIngredients++;
      }
    }
    console.log(`✓ Created ${recipesCreated} recipes from DBF data`);
    if (recipesSkippedNoProduct > 0) {
      console.log(`  ℹ Skipped ${recipesSkippedNoProduct} recipes (product not found)`);
    }
    if (recipesSkippedNoIngredients > 0) {
      console.log(`  ℹ Skipped ${recipesSkippedNoIngredients} recipes (no valid ingredients)`);
    }
    if (recipesSkipped > 0) {
      console.log(`  ℹ Skipped ${recipesSkipped} recipes (errors/duplicates)`);
    }
    console.log();
  }
  
  // Always create a few demo recipes
  if (products.length > 10) {
    // Find products by name pattern for demo recipes
    const pizza = products.find(p => p.name.includes("PIZZA"));
    const pasta = products.find(p => p.name.includes("PASTE") || p.name.includes("CARBONARA"));
    const faina = products.find(p => p.name.includes("FAINA"));
    const mozzarella = products.find(p => p.name.includes("MOZZARELLA"));
    const sos = products.find(p => p.name.includes("SOS"));
    const spaghetti = products.find(p => p.name.includes("SPAGHETTI"));
    const bacon = products.find(p => p.name.includes("BACON"));
    const smantana = products.find(p => p.name.includes("SMANTANA"));
    
    if (pizza && faina && mozzarella && sos) {
      try {
        await prisma.recipe.create({
          data: {
            productId: pizza.id,
            items: {
              create: [
                { productId: faina.id, quantity: 0.3 },
                { productId: mozzarella.id, quantity: 0.15 },
                { productId: sos.id, quantity: 0.1 },
              ],
            },
          },
        });
        recipesCreated++;
      } catch (err) {}
    }
    
    if (pasta && spaghetti && bacon && smantana) {
      try {
        await prisma.recipe.create({
          data: {
            productId: pasta.id,
            items: {
              create: [
                { productId: spaghetti.id, quantity: 0.2 },
                { productId: bacon.id, quantity: 0.1 },
                { productId: smantana.id, quantity: 0.05 },
              ],
            },
          },
        });
        recipesCreated++;
      } catch (err) {}
    }
  }
  
  console.log(`✓ Total recipes created: ${recipesCreated}\n`);

  // Create a sample NIR
  console.log("Creating sample NIR...");
  if (products.length > 5) {
    await prisma.nIR.create({
      data: {
        supplierId: suppliers[0].id,
        number: "NIR-001",
        items: {
          create: [
            { productId: products[0].id, departmentId: products[0].departmentId, quantity: 20, price: products[0].price },
            { productId: products[1].id, departmentId: products[1].departmentId, quantity: 10, price: products[1].price },
          ],
        },
      },
    });
    console.log("✓ Created sample NIR\n");
  }

  // Summary
  console.log("\n" + "= ".repeat(50));
  console.log("DATABASE SEEDING COMPLETE");
  console.log("= ".repeat(50));
  console.log(`✓ ${waiterNames.length + 1} users (1 admin + ${waiterNames.length} waiters)`);
  console.log(`✓ ${suppliers.length} suppliers`);
  console.log(`✓ ${departments.length} departments`);
  console.log(`✓ ${categories.length} categories`);
  console.log(`✓ ${products.length} products (incl. raw materials)`);
  console.log(`✓ ${recipesCreated} recipes`);
  console.log(`✓ Initial stock of 50 units per product`);
  console.log(`✓ 1 sample NIR`);
  
  if (extractedData) {
    console.log("\n📊 Original DBF Data Statistics:");
    console.log(`   - Finished products in DBF: ${extractedData.products.length}`);
    console.log(`   - Raw materials in DBF: ${extractedData.rawMaterials.length}`);
    console.log(`   - Recipes in DBF: ${extractedData.recipes.length}`);
    console.log(`   - Total recipe items: ${extractedData.recipes.reduce((sum, r) => sum + r.items.length, 0)}`);
    console.log(`   - Migrated: ${products.length} total products (${extractedData.products.length} finished + ${rawMaterialsCreated} materials), ${recipesCreated} recipes`);
  }
  console.log("\n");
}

main()
  .catch((e) => {
    console.error("\n❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });