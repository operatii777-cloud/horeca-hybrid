const express = require("express");
const cors = require("cors");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Helper: safe parseInt with validation
function safeId(val) {
  const n = Number(val);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null;
  return n;
}

// --- Health check ---
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Auth ---
app.post("/api/auth/login", async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) return res.status(400).json({ error: "PIN is required" });
    if (typeof pin !== "string" || pin.length !== 4 || !/^\d{4}$/.test(pin))
      return res.status(400).json({ error: "Invalid PIN format" });
    const user = await prisma.user.findUnique({ where: { pin } });
    if (!user) return res.status(401).json({ error: "Invalid PIN" });
    res.json({ id: user.id, name: user.name, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Users ---
app.get("/api/users", async (_req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
    res.json(users.map(({ pin, ...u }) => u));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/users/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const { name } = req.body;
    const user = await prisma.user.update({
      where: { id },
      data: { name },
    });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Departments ---
app.get("/api/departments", async (_req, res) => {
  try {
    const departments = await prisma.department.findMany({ orderBy: { id: "asc" } });
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/departments", async (req, res) => {
  try {
    const dept = await prisma.department.create({ data: req.body });
    res.json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/departments/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const dept = await prisma.department.update({
      where: { id },
      data: req.body,
    });
    res.json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/departments/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.department.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Categories ---
app.get("/api/categories", async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/categories", async (req, res) => {
  try {
    const cat = await prisma.category.create({ data: req.body });
    res.json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/categories/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const cat = await prisma.category.update({
      where: { id },
      data: req.body,
    });
    res.json(cat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/categories/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.category.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Suppliers ---
app.get("/api/suppliers", async (_req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({ orderBy: { id: "asc" } });
    res.json(suppliers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/suppliers", async (req, res) => {
  try {
    const supplier = await prisma.supplier.create({ data: req.body });
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/suppliers/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const supplier = await prisma.supplier.update({
      where: { id },
      data: req.body,
    });
    res.json(supplier);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/suppliers/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.supplier.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Raw Materials ---
app.get("/api/raw-materials", async (_req, res) => {
  try {
    const rawMaterials = await prisma.rawMaterial.findMany({
      include: { supplier: true },
      orderBy: { name: "asc" },
    });
    res.json(rawMaterials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/raw-materials/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const rawMaterial = await prisma.rawMaterial.findUnique({
      where: { id },
      include: { supplier: true },
    });
    if (!rawMaterial) return res.status(404).json({ error: "Raw material not found" });
    res.json(rawMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/raw-materials", async (req, res) => {
  try {
    const { code, name, unit, price, groupCategory, supplierId, stockMin, expiryDays, vatRate, processStock } = req.body;
    if (!name || !unit || price === undefined) {
      return res.status(400).json({ error: "Name, unit, and price are required" });
    }
    const data = {
      code: code || `RM${Date.now()}`,
      name,
      unit,
      price: Number(price),
      groupCategory,
      supplierId: supplierId ? Number(supplierId) : null,
      stockMin: stockMin ? Number(stockMin) : null,
      expiryDays: expiryDays ? Number(expiryDays) : null,
      vatRate: vatRate !== undefined ? Number(vatRate) : 19,
      processStock: processStock !== undefined ? Number(processStock) : 1,
    };
    const rawMaterial = await prisma.rawMaterial.create({
      data,
      include: { supplier: true },
    });
    res.json(rawMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/raw-materials/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const updateData = { ...req.body };
    // Convert numeric fields
    if (updateData.price !== undefined) updateData.price = Number(updateData.price);
    if (updateData.supplierId !== undefined) updateData.supplierId = updateData.supplierId ? Number(updateData.supplierId) : null;
    if (updateData.stockMin !== undefined) updateData.stockMin = updateData.stockMin ? Number(updateData.stockMin) : null;
    if (updateData.expiryDays !== undefined) updateData.expiryDays = updateData.expiryDays ? Number(updateData.expiryDays) : null;
    if (updateData.vatRate !== undefined) updateData.vatRate = Number(updateData.vatRate);
    if (updateData.processStock !== undefined) updateData.processStock = Number(updateData.processStock);
    const rawMaterial = await prisma.rawMaterial.update({
      where: { id },
      data: updateData,
      include: { supplier: true },
    });
    res.json(rawMaterial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/raw-materials/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.rawMaterial.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Products ---
app.get("/api/products", async (req, res) => {
  try {
    const where = {};
    if (req.query.departmentId) {
      const dId = safeId(req.query.departmentId);
      if (dId) where.departmentId = dId;
    }
    if (req.query.categoryId) {
      const cId = safeId(req.query.categoryId);
      if (cId) where.categoryId = cId;
    }
    const products = await prisma.product.findMany({
      where,
      include: { department: true, category: true, stockItems: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const { name, price, unit, departmentId, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, price, unit, departmentId, categoryId },
      include: { department: true, category: true, stockItems: true },
    });
    // Create initial stock entry (0 quantity)
    await prisma.stock.create({
      data: { productId: product.id, departmentId, quantity: 0 },
    });
    const updated = await prisma.product.findUnique({
      where: { id: product.id },
      include: { department: true, category: true, stockItems: true },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/products/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
      include: { department: true, category: true, stockItems: true },
    });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.stock.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Stock ---
app.get("/api/stock", async (req, res) => {
  try {
    const where = {};
    if (req.query.departmentId) {
      const dId = safeId(req.query.departmentId);
      if (dId) where.departmentId = dId;
    }
    const stock = await prisma.stock.findMany({
      where,
      include: { product: true, department: true },
      orderBy: { id: "asc" },
    });
    res.json(stock);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Recipes ---
app.get("/api/recipes", async (_req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: { product: true, items: { include: { product: true } } },
      orderBy: { id: "asc" },
    });
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/recipes", async (req, res) => {
  try {
    const { productId, items } = req.body;
    const recipe = await prisma.recipe.create({
      data: {
        productId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: { product: true, items: { include: { product: true } } },
    });
    res.json(recipe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/recipes/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.recipeItem.deleteMany({ where: { recipeId: id } });
    await prisma.recipe.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- NIR (Nota de Intrare Recepție) ---
app.get("/api/nir", async (_req, res) => {
  try {
    const nirs = await prisma.nIR.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    res.json(nirs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/nir", async (req, res) => {
  try {
    const { supplierId, number, items } = req.body;
    const nir = await prisma.nIR.create({
      data: {
        supplierId,
        number,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
          })),
        },
      },
      include: { supplier: true, items: { include: { product: true } } },
    });

    // Increase stock for each NIR item
    for (const item of nir.items) {
      await prisma.stock.upsert({
        where: {
          productId_departmentId: {
            productId: item.productId,
            departmentId: item.product.departmentId,
          },
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          productId: item.productId,
          departmentId: item.product.departmentId,
          quantity: item.quantity,
        },
      });
    }

    res.json(nir);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Transfer ---
app.get("/api/transfers", async (_req, res) => {
  try {
    const transfers = await prisma.transfer.findMany({
      include: {
        fromDepartment: true,
        toDepartment: true,
        items: { include: { product: true } },
      },
      orderBy: { date: "desc" },
    });
    res.json(transfers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/transfers", async (req, res) => {
  try {
    const { fromDepartmentId, toDepartmentId, items } = req.body;
    const transfer = await prisma.transfer.create({
      data: {
        fromDepartmentId,
        toDepartmentId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: {
        fromDepartment: true,
        toDepartment: true,
        items: { include: { product: true } },
      },
    });

    // Move stock: decrease from source, increase at destination
    for (const item of transfer.items) {
      await prisma.stock.upsert({
        where: {
          productId_departmentId: {
            productId: item.productId,
            departmentId: fromDepartmentId,
          },
        },
        update: { quantity: { decrement: item.quantity } },
        create: {
          productId: item.productId,
          departmentId: fromDepartmentId,
          quantity: 0,
        },
      });
      await prisma.stock.upsert({
        where: {
          productId_departmentId: {
            productId: item.productId,
            departmentId: toDepartmentId,
          },
        },
        update: { quantity: { increment: item.quantity } },
        create: {
          productId: item.productId,
          departmentId: toDepartmentId,
          quantity: item.quantity,
        },
      });
    }

    res.json(transfer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Retur ---
app.get("/api/returs", async (_req, res) => {
  try {
    const returs = await prisma.retur.findMany({
      include: { supplier: true, items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    res.json(returs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/returs", async (req, res) => {
  try {
    const { supplierId, items } = req.body;
    const retur = await prisma.retur.create({
      data: {
        supplierId,
        items: {
          create: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        },
      },
      include: { supplier: true, items: { include: { product: true } } },
    });

    // Decrease stock for each returned item
    for (const item of retur.items) {
      await prisma.stock.upsert({
        where: {
          productId_departmentId: {
            productId: item.productId,
            departmentId: item.product.departmentId,
          },
        },
        update: { quantity: { decrement: item.quantity } },
        create: {
          productId: item.productId,
          departmentId: item.product.departmentId,
          quantity: 0,
        },
      });
    }

    res.json(retur);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Inventory ---
app.get("/api/inventories", async (_req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { date: "desc" },
    });
    res.json(inventories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/inventories", async (req, res) => {
  try {
    const { name, departmentId } = req.body;

    // Get current stock for the department
    const where = {};
    if (departmentId) {
      const dId = safeId(departmentId);
      if (dId) where.departmentId = dId;
    }
    const stockItems = await prisma.stock.findMany({
      where,
      include: { product: true },
    });

    const inventory = await prisma.inventory.create({
      data: {
        name,
        items: {
          create: stockItems.map((s) => ({
            productId: s.productId,
            systemQty: s.quantity,
            actualQty: s.quantity,
            difference: 0,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/inventories/:id/items", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const { items } = req.body; // [{id, actualQty}]
    for (const item of items) {
      const existing = await prisma.inventoryItem.findUnique({ where: { id: item.id } });
      if (existing) {
        await prisma.inventoryItem.update({
          where: { id: item.id },
          data: {
            actualQty: item.actualQty,
            difference: item.actualQty - existing.systemQty,
          },
        });
      }
    }
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    res.json(inventory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Orders ---
const orderInclude = {
  user: true,
  items: { include: { product: { include: { department: true } } } },
};

app.get("/api/orders", async (req, res) => {
  try {
    const where = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.userId) {
      const uId = safeId(req.query.userId);
      if (uId) where.userId = uId;
    }
    const orders = await prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { tableNr, userId, items, source, notes } = req.body;
    const order = await prisma.order.create({
      data: {
        tableNr,
        userId,
        source: source || "pos",
        notes: notes || "",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            personLabel: item.personLabel || "",
          })),
        },
        total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      },
      include: orderInclude,
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/orders/:id/deliver", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const order = await prisma.order.update({
      where: { id },
      data: { status: "delivered" },
      include: orderInclude,
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/orders/:id/close", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const { payMethod } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { status: "closed", payMethod, closedAt: new Date() },
      include: orderInclude,
    });

    // Decrease stock when order is closed
    // Pre-fetch all recipes with their ingredients to avoid N+1 queries
    const productIds = order.items.map((i) => i.productId);
    const recipes = await prisma.recipe.findMany({
      where: { productId: { in: productIds } },
      include: { items: { include: { product: true } } },
    });
    const recipeMap = new Map(recipes.map((r) => [r.productId, r]));

    for (const item of order.items) {
      const recipe = recipeMap.get(item.productId);

      if (recipe) {
        // Decrease ingredient stock based on recipe
        for (const ri of recipe.items) {
          await prisma.stock.upsert({
            where: {
              productId_departmentId: {
                productId: ri.productId,
                departmentId: ri.product.departmentId,
              },
            },
            update: { quantity: { decrement: ri.quantity * item.quantity } },
            create: {
              productId: ri.productId,
              departmentId: ri.product.departmentId,
              quantity: 0,
            },
          });
        }
      } else {
        // Decrease product stock directly
        await prisma.stock.upsert({
          where: {
            productId_departmentId: {
              productId: item.productId,
              departmentId: item.product.departmentId,
            },
          },
          update: { quantity: { decrement: item.quantity } },
          create: {
            productId: item.productId,
            departmentId: item.product.departmentId,
            quantity: 0,
          },
        });
      }
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Add items to existing order ---
app.post("/api/orders/:id/items", async (req, res) => {
  try {
    const orderId = safeId(req.params.id);
    if (!orderId) return res.status(400).json({ error: "Invalid ID" });
    const { items } = req.body;
    await prisma.orderItem.createMany({
      data: items.map((item) => ({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        personLabel: item.personLabel || "",
      })),
    });
    const addedTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { total: { increment: addedTotal } },
      include: orderInclude,
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Request bill (mark order as requesting payment) ---
app.put("/api/orders/:id/request-bill", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const { preferredPayment } = req.body;
    const order = await prisma.order.update({
      where: { id },
      data: { payMethod: preferredPayment || null },
      include: orderInclude,
    });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const orderId = safeId(req.params.id);
    if (!orderId) return res.status(400).json({ error: "Invalid ID" });
    await prisma.orderItem.deleteMany({ where: { orderId } });
    await prisma.order.delete({ where: { id: orderId } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Order Item Ready (KDS) ---
app.put("/api/orders/:orderId/items/:itemId/ready", async (req, res) => {
  try {
    const orderId = safeId(req.params.orderId);
    if (!orderId) return res.status(400).json({ error: "Invalid order ID" });
    const itemId = safeId(req.params.itemId);
    if (!itemId) return res.status(400).json({ error: "Invalid item ID" });
    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: { ready: true },
      include: { product: { include: { department: true } } },
    });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Waiter Calls ---
app.get("/api/call-waiter", async (_req, res) => {
  try {
    const calls = await prisma.waiterCall.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
    });
    res.json(calls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/call-waiter", async (req, res) => {
  try {
    const { tableNr, type } = req.body;
    if (tableNr == null || typeof tableNr !== "number") return res.status(400).json({ error: "tableNr is required" });
    const call = await prisma.waiterCall.create({
      data: { tableNr, type: type || "call" },
    });
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/call-waiter/:id/acknowledge", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const call = await prisma.waiterCall.update({
      where: { id },
      data: { status: "acknowledged" },
    });
    res.json(call);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Reports ---
app.get("/api/reports/sales", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "closed" },
      include: { user: true, items: { include: { product: true } } },
      orderBy: { closedAt: "desc" },
    });
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const byPayMethod = {};
    for (const o of orders) {
      const method = o.payMethod || "UNKNOWN";
      byPayMethod[method] = (byPayMethod[method] || 0) + o.total;
    }
    res.json({ totalSales, byPayMethod, orderCount: orders.length, orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Reservations ---
app.get("/api/reservations", async (_req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({ orderBy: { createdAt: "desc" } });
    res.json(reservations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/reservations", async (req, res) => {
  try {
    const reservation = await prisma.reservation.create({ data: req.body });
    res.json(reservation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/api/reservations/:id", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    await prisma.reservation.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Feedback ---
app.get("/api/feedback", async (_req, res) => {
  try {
    const feedbacks = await prisma.feedback.findMany({ orderBy: { createdAt: "desc" } });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    const feedback = await prisma.feedback.create({ data: req.body });
    res.json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- HACCP ---
app.get("/api/haccp", async (req, res) => {
  try {
    const where = {};
    if (req.query.date) where.date = req.query.date;
    const checks = await prisma.hACCPCheck.findMany({ where, orderBy: { id: "asc" } });
    res.json(checks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/haccp", async (req, res) => {
  try {
    const { date, itemId, checkedAt } = req.body;
    const existing = await prisma.hACCPCheck.findFirst({ where: { date, itemId } });
    if (existing) {
      await prisma.hACCPCheck.delete({ where: { id: existing.id } });
      res.json({ ok: true, removed: true });
    } else {
      const check = await prisma.hACCPCheck.create({ data: { date, itemId, checkedAt } });
      res.json(check);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Settings ---
app.get("/api/settings", async (_req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/settings", async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    for (const [key, value] of entries) {
      await prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    }
    const settings = await prisma.setting.findMany();
    const result = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Shift Handover ---
app.get("/api/shift-handovers", async (_req, res) => {
  try {
    const handovers = await prisma.shiftHandover.findMany({ orderBy: { createdAt: "desc" } });
    res.json(handovers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/shift-handovers", async (req, res) => {
  try {
    const handover = await prisma.shiftHandover.create({ data: req.body });
    res.json(handover);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Attendance (Pontaj) ---
app.get("/api/attendance", async (_req, res) => {
  try {
    const records = await prisma.attendance.findMany({
      include: { user: true },
      orderBy: { clockIn: "desc" },
    });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/attendance", async (req, res) => {
  try {
    const { userId } = req.body;
    const record = await prisma.attendance.create({
      data: { userId },
      include: { user: true },
    });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/attendance/:id/clock-out", async (req, res) => {
  try {
    const id = safeId(req.params.id);
    if (!id) return res.status(400).json({ error: "Invalid ID" });
    const record = await prisma.attendance.update({
      where: { id },
      data: { clockOut: new Date() },
      include: { user: true },
    });
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Waste ---
app.get("/api/waste", async (_req, res) => {
  try {
    const entries = await prisma.wasteEntry.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/waste", async (req, res) => {
  try {
    const { productId, quantity, reason, date } = req.body;
    const entry = await prisma.wasteEntry.create({
      data: { productId, quantity, reason, date },
      include: { product: true },
    });
    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Bon Consum (Consumption Voucher) ---
app.get("/api/bon-consum", async (_req, res) => {
  try {
    const vouchers = await prisma.consumptionVoucher.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(vouchers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/bon-consum", async (req, res) => {
  try {
    const { productId, quantity, reason } = req.body;
    const voucher = await prisma.consumptionVoucher.create({
      data: { productId, quantity, reason },
      include: { product: true },
    });
    res.json(voucher);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Production: serve React build ---
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "..", "dist");
  app.use(express.static(distPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTERPRISE FEATURES (15 modules)
// ─────────────────────────────────────────────────────────────────────────────

// 1. HOSPITALITY DIGITAL IDENTITY LAYER ──────────────────────────────────────
const MOCK_GUESTS = [
  { id: 1, name: "Ion Popescu", email: "ion.popescu@email.ro", phone: "0721000001", country: "RO", loyaltyPoints: 1240, totalVisits: 23, lifetimeValue: 4870, gdprConsent: true, riskScore: "low", brands: ["HoReCa Central", "Sky Lounge"] },
  { id: 2, name: "Maria Ionescu", email: "maria@email.ro", phone: "0722000002", country: "RO", loyaltyPoints: 340, totalVisits: 7, lifetimeValue: 1220, gdprConsent: true, riskScore: "low", brands: ["HoReCa Central"] },
  { id: 3, name: "Andrei Dumitrescu", email: "andrei@email.ro", phone: "0733000003", country: "RO", loyaltyPoints: 0, totalVisits: 2, lifetimeValue: 260, gdprConsent: false, riskScore: "medium", brands: ["Sky Lounge"] },
  { id: 4, name: "Elena Stanescu", email: "elena@email.ro", phone: "0744000004", country: "RO", loyaltyPoints: 5600, totalVisits: 89, lifetimeValue: 18900, gdprConsent: true, riskScore: "low", brands: ["HoReCa Central", "Sky Lounge", "Garden Bistro"] },
  { id: 5, name: "Mihai Georgescu", email: "mihai@email.ro", phone: "0755000005", country: "RO", loyaltyPoints: 80, totalVisits: 3, lifetimeValue: 380, gdprConsent: true, riskScore: "high", brands: ["HoReCa Central"] },
];

app.get("/api/guests", (_req, res) => res.json(MOCK_GUESTS));

// 2. GLOBAL PAYMENT ORCHESTRATION ENGINE ─────────────────────────────────────
app.get("/api/payment-orchestration/stats", (_req, res) => {
  res.json({
    totalTransactions: 1847,
    successRate: 97.3,
    fraudDetected: 12,
    avgFeeSaved: 0.43,
    pspStats: [
      { name: "Stripe", share: 52, fee: 1.4, uptime: 99.98, latency: 180 },
      { name: "Adyen", share: 31, fee: 1.2, uptime: 99.95, latency: 210 },
      { name: "Worldline", share: 17, fee: 0.9, uptime: 99.7, latency: 320 },
    ],
    routingRules: [
      { icon: "💶", condition: "EUR > 500", action: "Adyen (fee minim)" },
      { icon: "🔄", condition: "Stripe DOWN", action: "Failover → Adyen" },
      { icon: "🛡️", condition: "Fraud score > 80", action: "Blocare + Review" },
      { icon: "📱", condition: "Mobile < 100 lei", action: "BNPL eligibil" },
    ],
  });
});

app.get("/api/payment-orchestration/transactions", (_req, res) => {
  const psps = ["Stripe", "Adyen", "Worldline"];
  const methods = ["card", "contactless", "online", "BNPL", "gift card"];
  const statuses = ["success", "success", "success", "success", "failed", "pending"];
  const txs = Array.from({ length: 15 }, (_, i) => ({
    id: 10000 + i,
    amount: +(Math.random() * 500 + 10).toFixed(2),
    currency: "RON",
    psp: psps[Math.floor(Math.random() * psps.length)],
    method: methods[Math.floor(Math.random() * methods.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    fraudScore: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - i * 600000).toISOString(),
  }));
  res.json(txs);
});

// 3. REAL-TIME SUPPLY CHAIN NETWORK ──────────────────────────────────────────
app.get("/api/supply-chain", (_req, res) => {
  res.json({
    criticalAlerts: 3,
    estimatedSavings: 1240,
    activeSuppliers: 14,
    transferSuggestions: [
      { product: "Somon proaspăt", from: "Locația A (surplus 8kg)", to: "Locația C (stoc 0)", quantity: 5, unit: "kg", priority: "high" },
      { product: "Vin Roze", from: "Locația B (surplus 24 sticle)", to: "Locația D (stoc critic)", quantity: 12, unit: "sticle", priority: "medium" },
      { product: "Ulei măsline", from: "Depozit Central", to: "Locația A", quantity: 20, unit: "L", priority: "medium" },
    ],
    suppliers: [
      { name: "Agro Pro SRL", score: 92, deliveryRate: 98, qualityScore: 95 },
      { name: "Fresh Market", score: 78, deliveryRate: 84, qualityScore: 88 },
      { name: "Global Foods", score: 65, deliveryRate: 72, qualityScore: 71 },
      { name: "BioGreen", score: 88, deliveryRate: 91, qualityScore: 94 },
    ],
    priceVolatility: [
      { ingredient: "Făină 00", currentPrice: 4.2, previousPrice: 3.8, unit: "kg" },
      { ingredient: "Somon Atlantic", currentPrice: 89, previousPrice: 72, unit: "kg" },
      { ingredient: "Ulei floarea-soarelui", currentPrice: 8.5, previousPrice: 9.1, unit: "L" },
      { ingredient: "Carne vită", currentPrice: 45, previousPrice: 43, unit: "kg" },
      { ingredient: "Ouă", currentPrice: 1.8, previousPrice: 1.6, unit: "buc" },
    ],
  });
});

// 4. LABOR OPTIMIZATION AI ────────────────────────────────────────────────────
app.get("/api/labor-optimization", (_req, res) => {
  const hours = ["11:00", "11:15", "11:30", "11:45", "12:00", "12:15", "12:30", "12:45", "13:00", "13:15", "13:30", "13:45", "14:00", "14:15", "14:30", "14:45"];
  const loads = [20, 25, 35, 55, 78, 92, 88, 95, 82, 70, 60, 45, 38, 28, 22, 15];
  const covers = [4, 5, 7, 11, 16, 19, 18, 20, 17, 14, 12, 9, 8, 6, 4, 3];
  res.json({
    laborCostPct: 28.4,
    overtimeRisk: 2,
    burnoutAlerts: 1,
    staffOnDuty: 8,
    trafficForecast: hours.map((h, i) => ({ time: h, load: loads[i], covers: covers[i] })),
    suggestedShifts: [
      { name: "Ionel Popa", role: "Ospătar", startTime: "11:00", endTime: "19:00", overtimeRisk: false, burnoutRisk: false },
      { name: "Alina Marin", role: "Ospătar", startTime: "12:00", endTime: "21:00", overtimeRisk: true, burnoutRisk: false },
      { name: "George Toma", role: "Bucătar", startTime: "10:00", endTime: "18:00", overtimeRisk: false, burnoutRisk: true },
      { name: "Cristina Vlad", role: "Bar", startTime: "16:00", endTime: "00:00", overtimeRisk: false, burnoutRisk: false },
    ],
    staffBenchmark: [
      { name: "Ionel Popa", location: "HoReCa Central", hoursWorked: 168, sales: 24800, avgOrder: 87, score: 92, burnout: false, overtime: false },
      { name: "Alina Marin", location: "HoReCa Central", hoursWorked: 182, sales: 31200, avgOrder: 95, score: 88, burnout: false, overtime: true },
      { name: "George Toma", location: "Sky Lounge", hoursWorked: 176, sales: 19400, avgOrder: 74, score: 71, burnout: true, overtime: false },
      { name: "Cristina Vlad", location: "Sky Lounge", hoursWorked: 160, sales: 28900, avgOrder: 102, score: 95, burnout: false, overtime: false },
    ],
  });
});

// 5. LIVE OPERATION CONTROL CENTER ─────────────────────────────────────────────
app.get("/api/war-room", async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({ take: 200, orderBy: { createdAt: "desc" } });
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today);
    const closedToday = todayOrders.filter((o) => o.status === "closed");
    const revenueToday = closedToday.reduce((s, o) => s + (o.total || 0), 0);
    const liveOrders = orders.filter((o) => o.status === "open" || o.status === "delivered").length;
    const revenueTrend = Array.from({ length: 12 }, (_, i) => ({
      hour: `${(new Date().getHours() - 11 + i + 24) % 24}h`,
      value: Math.floor(Math.random() * 3000 + 500),
    }));
    const locations = [
      { id: 1, name: "HoReCa Central", openOrders: Math.floor(Math.random() * 8) + 1, avgPrepTime: Math.floor(Math.random() * 10) + 8, revenue: Math.floor(Math.random() * 5000) + 2000, status: "ok" },
      { id: 2, name: "Sky Lounge", openOrders: Math.floor(Math.random() * 5) + 1, avgPrepTime: Math.floor(Math.random() * 8) + 6, revenue: Math.floor(Math.random() * 4000) + 1500, status: "ok" },
      { id: 3, name: "Garden Bistro", openOrders: Math.floor(Math.random() * 3), avgPrepTime: Math.floor(Math.random() * 20) + 12, revenue: Math.floor(Math.random() * 3000) + 1000, status: "warning" },
    ];
    res.json({ liveOrders, avgPrepTime: 11, revenueToday, slaRate: 94.2, refundSpike: false, locationCount: locations.length, locations, revenueTrend });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/war-room/alerts", (_req, res) => {
  res.json([
    { severity: "warning", location: "Garden Bistro", message: "Timp preparare > 18 minute", time: "acum 2 min" },
    { severity: "critical", location: "Sky Lounge", message: "Stoc critic: Somon proaspăt 0 kg", time: "acum 5 min" },
    { severity: "info", location: "HoReCa Central", message: "Peak traffic detectat (+40% față de avg)", time: "acum 8 min" },
  ]);
});

// 6. SELF-HEALING INFRASTRUCTURE ─────────────────────────────────────────────
app.get("/api/infra-health", (_req, res) => {
  res.json({
    healthyCount: 7, totalServices: 8, autoRestarts: 2, openCircuitBreakers: 1, uptime: 99.97,
    services: [
      { name: "API Server", status: "healthy", latency: 45, cpu: 32, memory: 48, lastRestart: null },
      { name: "Database (SQLite)", status: "healthy", latency: 8, cpu: 12, memory: 28, lastRestart: null },
      { name: "Auth Service", status: "healthy", latency: 22, cpu: 8, memory: 15, lastRestart: null },
      { name: "Payment Gateway", status: "degraded", latency: 340, cpu: 67, memory: 71, lastRestart: "acum 22 min" },
      { name: "KDS WebSocket", status: "healthy", latency: 12, cpu: 5, memory: 12, lastRestart: null },
      { name: "Supply Chain Sync", status: "healthy", latency: 89, cpu: 18, memory: 22, lastRestart: null },
      { name: "Analytics Engine", status: "healthy", latency: 156, cpu: 45, memory: 62, lastRestart: null },
      { name: "Notification Service", status: "down", latency: 0, cpu: 0, memory: 0, lastRestart: "acum 3 min" },
    ],
    circuitBreakers: [
      { service: "Payment Gateway", state: "half-open" },
      { service: "API Server", state: "closed" },
      { service: "Database", state: "closed" },
      { service: "Notification Service", state: "open" },
    ],
    scaling: [
      { service: "API Server", instances: 3, load: 32 },
      { service: "Analytics", instances: 2, load: 68 },
      { service: "KDS", instances: 1, load: 22 },
    ],
    databases: [
      { name: "Primary DB", region: "EU-West", role: "primary", healthy: true },
      { name: "Replica DB", region: "EU-Central", role: "replica", healthy: true },
      { name: "Failover DB", region: "EU-East", role: "standby", healthy: true },
    ],
  });
});

// 7. EXPERIENCE ENGINE ────────────────────────────────────────────────────────
const experienceState = {
  musicMood: "relaxed", musicVolume: 65, currentTrack: "Norah Jones – Come Away With Me",
  lightScene: "dim", lightIntensity: 55, colorTemp: 3200,
  temperature: 22, acousticMode: "normal",
  signageScreens: [
    { id: 1, name: "Ecran Intrare", location: "Hol Principal", currentContent: "Meniu Zilei", online: true },
    { id: 2, name: "Ecran Bar", location: "Bar", currentContent: "Cocktail Signature", online: true },
    { id: 3, name: "Ecran Terasa", location: "Terasa", currentContent: "Promoție Weekend", online: false },
  ],
};

app.get("/api/experience-engine", (_req, res) => res.json(experienceState));
app.put("/api/experience-engine", (req, res) => {
  Object.assign(experienceState, req.body);
  res.json(experienceState);
});

// 8. DARK KITCHEN + CLOUD KITCHEN ────────────────────────────────────────────
app.get("/api/dark-kitchen", (_req, res) => {
  const brands = [
    { id: 1, name: "BurgerBox", icon: "🍔", cuisine: "Burgers", active: true, revenue: 8420, orders: 187, avgOrder: 45, rating: 4.6, trend: 1, platforms: ["Glovo", "Bolt Food"] },
    { id: 2, name: "SushiGo", icon: "🍣", cuisine: "Sushi & Asian", active: true, revenue: 12300, orders: 134, avgOrder: 92, rating: 4.8, trend: 1, platforms: ["Glovo", "Tazz"] },
    { id: 3, name: "PizzaNow", icon: "🍕", cuisine: "Pizza", active: true, revenue: 6800, orders: 210, avgOrder: 32, rating: 4.3, trend: 0, platforms: ["Bolt Food", "Tazz"] },
    { id: 4, name: "HealthBowl", icon: "🥗", cuisine: "Healthy Food", active: false, revenue: 1200, orders: 28, avgOrder: 43, rating: 4.1, trend: -1, platforms: ["Glovo"] },
  ];
  res.json({
    brandCount: brands.length,
    activeMenus: brands.filter((b) => b.active).length,
    totalRevenue: brands.reduce((s, b) => s + b.revenue, 0),
    platforms: 3,
    brands,
    ghostMenuItems: [
      { brand: "BurgerBox", name: "Double Smash Burger", price: 49, platform: "Glovo", active: true, orders: 89 },
      { brand: "BurgerBox", name: "Crispy Chicken Burger", price: 42, platform: "Bolt Food", active: true, orders: 67 },
      { brand: "SushiGo", name: "Salmon Roll 8 pcs", price: 62, platform: "Glovo", active: true, orders: 54 },
      { brand: "SushiGo", name: "Dragon Roll", price: 78, platform: "Tazz", active: true, orders: 43 },
      { brand: "PizzaNow", name: "Margherita 32cm", price: 38, platform: "Bolt Food", active: true, orders: 112 },
    ],
    costAllocation: brands.map((b) => ({
      brand: b.name,
      revenue: b.revenue,
      cogs: b.revenue * 0.32,
      laborCost: b.revenue * 0.18,
      margin: (1 - 0.32 - 0.18 - 0.12) * 100,
    })),
  });
});

// 9. REVENUE SCIENCE LAYER ────────────────────────────────────────────────────
app.get("/api/revenue-science", (_req, res) => {
  const menuItems = [
    { name: "PIZZA MARGHERITA", category: "star", popularity: 87, margin: 68, revenue: 4320, recommendation: "Menține prețul" },
    { name: "BURGER CLASIC", category: "star", popularity: 82, margin: 61, revenue: 3890, recommendation: "Crește prețul +5%" },
    { name: "PASTE CARBONARA", category: "plowhorse", popularity: 74, margin: 38, revenue: 2980, recommendation: "Optimizează rețeta" },
    { name: "SUPA CREMA ROSII", category: "plowhorse", popularity: 68, margin: 72, revenue: 2100, recommendation: "Promovează mai mult" },
    { name: "TIRAMISU", category: "puzzle", popularity: 32, margin: 78, revenue: 1420, recommendation: "Adaugă în featured" },
    { name: "SOMON LA GRATAR", category: "puzzle", popularity: 28, margin: 82, revenue: 980, recommendation: "Marketing necesar" },
    { name: "SALATA CAESAR", category: "dog", popularity: 22, margin: 28, revenue: 440, recommendation: "Consideră eliminarea" },
    { name: "INGHETATA VANILIE", category: "dog", popularity: 18, margin: 31, revenue: 320, recommendation: "Eliminare sau rework" },
  ];
  res.json({
    starCount: menuItems.filter((i) => i.category === "star").length,
    dogCount: menuItems.filter((i) => i.category === "dog").length,
    avgMargin: menuItems.reduce((s, i) => s + i.margin, 0) / menuItems.length,
    revenueToday: 16450,
    menuItems,
    elasticity: [
      { name: "PIZZA MARGHERITA", currentPrice: 42, elasticity: -0.7, optimalPrice: 48, revenueImpact: 420, action: "increase" },
      { name: "BURGER CLASIC", currentPrice: 38, elasticity: -1.2, optimalPrice: 35, revenueImpact: 180, action: "decrease" },
      { name: "SOMON LA GRATAR", currentPrice: 68, elasticity: -0.4, optimalPrice: 79, revenueImpact: 890, action: "increase" },
      { name: "SALATA CAESAR", currentPrice: 24, elasticity: -1.8, optimalPrice: 22, revenueImpact: 60, action: "decrease" },
    ],
    marginByCategory: [
      { name: "Pizza & Paste", margin: 62, revenue: 12400, cogs: 4712 },
      { name: "Grill & Carne", margin: 55, revenue: 9800, cogs: 4410 },
      { name: "Pește & Fructe de mare", margin: 72, revenue: 6200, cogs: 1736 },
      { name: "Deserturi", margin: 78, revenue: 3400, cogs: 748 },
      { name: "Băuturi alcoolice", margin: 68, revenue: 8900, cogs: 2848 },
    ],
    abTests: [
      { product: "PIZZA MARGHERITA", duration: "14 zile", status: "completed", winner: "B",
        priceA: 42, priceB: 46, convA: 18.2, convB: 16.8, revA: 3200, revB: 3680 },
      { product: "BURGER CLASIC", duration: "7 zile", status: "running",
        priceA: 38, priceB: 41, convA: 14.5, convB: 13.1, revA: 2100, revB: 2300, winner: null },
    ],
  });
});

// 10. FRANCHISE DOMINATION SYSTEM ─────────────────────────────────────────────
app.get("/api/franchise", (_req, res) => {
  const locations = [
    { id: 1, name: "HoReCa Central", city: "București", franchisee: "Popescu SRL", revenue: 124000, royalty: 6200, complianceScore: 96, kpiScore: 91 },
    { id: 2, name: "Sky Lounge Brașov", city: "Brașov", franchisee: "Ionescu Group", revenue: 89000, royalty: 4450, complianceScore: 88, kpiScore: 84 },
    { id: 3, name: "Garden Bistro Cluj", city: "Cluj-Napoca", franchisee: "Dumitrescu SA", revenue: 67000, royalty: 3350, complianceScore: 72, kpiScore: 68 },
    { id: 4, name: "HoReCa Constanța", city: "Constanța", franchisee: "Maritim SRL", revenue: 95000, royalty: 4750, complianceScore: 93, kpiScore: 89 },
  ];
  res.json({
    locationCount: locations.length,
    totalRoyalty: locations.reduce((s, l) => s + l.royalty, 0),
    avgCompliance: Math.round(locations.reduce((s, l) => s + l.complianceScore, 0) / locations.length),
    auditPending: 2,
    locations,
    complianceDetails: locations.map((l) => ({
      name: l.name,
      brandGuidelines: l.complianceScore + Math.floor(Math.random() * 6 - 3),
      foodSafety: l.complianceScore + Math.floor(Math.random() * 8 - 4),
      staffTraining: l.complianceScore + Math.floor(Math.random() * 10 - 5),
      cleanliness: l.complianceScore + Math.floor(Math.random() * 6 - 3),
      overall: l.complianceScore,
    })),
    royaltyCalc: locations.map((l) => ({
      name: l.name, revenue: l.revenue, royaltyPct: 5,
      royaltyAmount: l.revenue * 0.05,
      paid: l.revenue * 0.05 * (l.complianceScore > 85 ? 1 : 0.7),
      outstanding: l.revenue * 0.05 * (l.complianceScore > 85 ? 0 : 0.3),
    })),
    auditItems: [
      { location: "Garden Bistro Cluj", type: "Compliance Audit", date: "2025-01-15", status: "warning", findings: "Ghidurile de brand nu sunt respectate în zona de intrare. Temperatura frigiderelor depășește norma.", action: "Corectare necesară în 30 zile" },
      { location: "HoReCa Central", type: "Financial Audit", date: "2025-01-20", status: "ok", findings: "Toate rapoartele financiare sunt conforme. Royalty plătit la zi.", action: null },
      { location: "Sky Lounge Brașov", type: "Mystery Shopper", date: "2025-01-18", status: "critical", findings: "Timp așteptare 28 minute. Personal neprietenos la bar. Băuturi neconforme cu rețetarul.", action: "Plan de remediere urgent" },
    ],
  });
});

// 11. API ECONOMY MODE ─────────────────────────────────────────────────────────
app.get("/api/api-economy", (_req, res) => {
  res.json({
    activeKeys: 23,
    callsToday: 184720,
    apiRevenue: 4280,
    activePlugins: 7,
    topEndpoints: [
      { endpoint: "GET /api/products", calls: 48200, latency: 45, errorRate: 0.1 },
      { endpoint: "GET /api/orders", calls: 39800, latency: 62, errorRate: 0.2 },
      { endpoint: "POST /api/orders", calls: 12400, latency: 89, errorRate: 0.5 },
      { endpoint: "GET /api/stock", calls: 28100, latency: 38, errorRate: 0.1 },
    ],
    revenueStreams: [
      { name: "API Subscriptions", model: "SaaS per lună", revenue: 2800, share: 65 },
      { name: "Plugin Marketplace", model: "Revenue share 30%", revenue: 980, share: 23 },
      { name: "Enterprise Custom", model: "Contract anual", revenue: 500, share: 12 },
    ],
    apiKeys: [
      { developer: "RestaurantX SRL", key: "sk_live_****4f2a", plan: "pro", callsToday: 12400, rateLimit: 1000, active: true },
      { developer: "FoodTech Labs", key: "sk_live_****8b91", plan: "enterprise", callsToday: 84200, rateLimit: 10000, active: true },
      { developer: "SmartPOS Dev", key: "sk_live_****2c44", plan: "free", callsToday: 1820, rateLimit: 100, active: true },
      { developer: "Delivery.ro", key: "sk_live_****7d03", plan: "pro", callsToday: 22800, rateLimit: 2000, active: false },
    ],
    plugins: [
      { id: 1, name: "WhatsApp Notifications", icon: "💬", description: "Notificări comenzi și rezervări via WhatsApp", rating: 4.8, price: 49, installs: 412, installed: true },
      { id: 2, name: "Google Analytics Bridge", icon: "📊", description: "Sincronizare date POS cu GA4", rating: 4.6, price: 0, installs: 1840, installed: true },
      { id: 3, name: "Accounting Export", icon: "📋", description: "Export automat în SAGA/Ciel", rating: 4.5, price: 89, installs: 234, installed: false },
      { id: 4, name: "Delivery Aggregator", icon: "🛵", description: "Integrare Glovo, Tazz, Bolt Food", rating: 4.9, price: 129, installs: 678, installed: true },
    ],
    endpoints: [
      { method: "GET", path: "/api/v1/products", description: "Lista produse" },
      { method: "GET", path: "/api/v1/orders", description: "Lista comenzi" },
      { method: "POST", path: "/api/v1/orders", description: "Creare comandă" },
      { method: "GET", path: "/api/v1/guests/:id", description: "Profil guest" },
      { method: "POST", path: "/api/v1/loyalty/redeem", description: "Răscumpărare puncte" },
    ],
  });
});

// 12. GLOBAL DATA NETWORK EFFECT ──────────────────────────────────────────────
app.get("/api/data-network", (_req, res) => {
  res.json({
    networkLocations: 247,
    analyzedTransactions: 1240000,
    industryAvgMargin: 38,
    trendsDetected: 12,
    benchmarks: [
      { metric: "Avg Check Value", yours: 87, industryAvg: 74, top10: 120, unit: " lei", higherIsBetter: true },
      { metric: "Table Turnover Rate", yours: 3.2, industryAvg: 2.8, top10: 4.5, unit: "x/zi", higherIsBetter: true },
      { metric: "Food Cost %", yours: 32, industryAvg: 35, top10: 27, unit: "%", higherIsBetter: false },
      { metric: "Labor Cost %", yours: 28, industryAvg: 31, top10: 24, unit: "%", higherIsBetter: false },
      { metric: "EBITDA Margin", yours: 22, industryAvg: 18, top10: 35, unit: "%", higherIsBetter: true },
    ],
    foodTrends: [
      { name: "Plant-Based Dishes", icon: "🌱", category: "Tendință globală", growth: 34, popularity: 72 },
      { name: "Fermented Foods", icon: "🫙", category: "Health & Wellness", growth: 28, popularity: 55 },
      { name: "Birria Tacos", icon: "🌮", category: "Trending Viral", growth: 89, popularity: 68 },
      { name: "Smash Burgers", icon: "🍔", category: "Comfort Food", growth: 45, popularity: 82 },
    ],
    ingredientCostTrends: [
      { name: "Somon Atlantic", currentCost: 89, previousCost: 72, unit: "kg", forecast: "up", action: "Negociați contracte pe termen lung" },
      { name: "Ulei măsline", currentCost: 32, previousCost: 38, unit: "L", forecast: "down", action: "Oportunitate de stoc" },
      { name: "Avocado", currentCost: 12, previousCost: 11, unit: "buc", forecast: "stable", action: "Mentenanță stoc" },
    ],
    peakHours: [
      { day: "Luni", peakHour: "12:30", hourlyLoad: [0,0,0,0,0,0,0,0,10,20,35,60,85,90,75,55,30,15,10,5,0,0,0,0] },
      { day: "Vineri", peakHour: "13:00", hourlyLoad: [0,0,0,0,0,0,0,0,15,30,55,80,95,98,88,70,45,60,75,80,55,30,15,5] },
      { day: "Sâmbătă", peakHour: "13:30", hourlyLoad: [0,0,0,0,0,0,0,0,5,15,35,70,90,98,95,80,60,55,70,85,70,45,25,10] },
    ],
    peakByRegion: [
      { region: "București", peakHour: "13:00 – 15:00", avgCovers: 89, avgCheck: 94 },
      { region: "Cluj-Napoca", peakHour: "12:30 – 14:30", avgCovers: 62, avgCheck: 82 },
      { region: "Brașov", peakHour: "12:00 – 14:00", avgCovers: 45, avgCheck: 76 },
    ],
  });
});

// 13. PREDICTIVE RISK ENGINE ────────────────────────────────────────────────────
app.get("/api/risk-engine", (_req, res) => {
  res.json({
    criticalAlerts: 2,
    fraudSuspicions: 3,
    refundAnomalies: 2,
    avgRiskScore: 42,
    alerts: [
      { type: "refund", severity: "critical", title: "Cluster Refunduri Suspecte", location: "Garden Bistro Cluj", time: "acum 1h", description: "14 refunduri în 2 ore de la același angajat. Valoare totală: 840 lei.", evidence: "Angajat: George T. | Orele: 14:22–16:18" },
      { type: "shrinkage", severity: "critical", title: "Shrinkage Anormal Detectat", location: "Sky Lounge Brașov", time: "Ieri 22:30", description: "Diferență stoc vs. consum: -8.2kg carne. Estimat cost: 360 lei.", evidence: "Ultimul inventar: 18/01/2025 | Diferență persistentă 3 zile" },
      { type: "fraud", severity: "high", title: "Suspiciune Fraudă Internă", location: "HoReCa Central", time: "Săptămâna aceasta", description: "Pattern de void-uri la ore de trafic redus. 7 void-uri suspecte.", evidence: "Angajat: Mihai V. | Valoare cumulată: 420 lei" },
    ],
    fraudSuspects: [
      { name: "George Toma", suspicionType: "Refund fraud", location: "Garden Bistro Cluj", value: 840, frequency: 14, riskScore: 88 },
      { name: "Mihai Vlad", suspicionType: "Void manipulation", location: "HoReCa Central", value: 420, frequency: 7, riskScore: 74 },
      { name: "Ana Pop", suspicionType: "Tip skimming", location: "Sky Lounge Brașov", value: 180, frequency: 12, riskScore: 45 },
    ],
    refundClusters: [
      { title: "Cluster Refunduri Seară", location: "Garden Bistro Cluj", period: "15-18 Ian 2025", anomalyScore: 88, count: 14, totalValue: 840, employee: "George T.", pattern: "Toate refundurile au fost procesate fără aprobare manager, între orele 22:00-23:30" },
      { title: "Cluster Refunduri Weekend", location: "HoReCa Central", period: "11-12 Ian 2025", anomalyScore: 56, count: 6, totalValue: 290, employee: "Ana M.", pattern: "Refunduri repetate pentru aceleași produse. Posibil erori de sistem sau manipulare." },
    ],
    suspiciousReservations: [
      { id: 1842, guestName: "Ion Doe", date: "2025-01-25", persons: 20, signals: ["Număr fals", "Email invalid", "No-show anterior"], riskScore: 82, flagged: true },
      { id: 1798, guestName: "Companie XYZ", date: "2025-01-22", persons: 15, signals: ["Rezervare duplicată"], riskScore: 45, flagged: false },
    ],
  });
});

// 14. FINANCIAL CONTROL LAYER ─────────────────────────────────────────────────
app.get("/api/financial-control", async (_req, res) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const orders = await prisma.order.findMany({
      where: { status: "closed", closedAt: { gte: today } },
    });
    const revenueToday = orders.reduce((s, o) => s + (o.total || 0), 0);
    res.json({
      revenueToday,
      ebitdaMargin: 22.4,
      cashBalance: 48200,
      taxLiability: 8640,
      plStatement: [
        { label: "VENITURI", isHeader: true, value: 0 },
        { label: "Vânzări Food", indent: true, value: 84200 },
        { label: "Vânzări Băuturi", indent: true, value: 42800 },
        { label: "Delivery Revenue", indent: true, value: 12400 },
        { label: "TOTAL VENITURI", isTotal: true, value: 139400 },
        { label: "COSTURI DIRECTE", isHeader: true, value: 0 },
        { label: "COGS Food", indent: true, negative: true, value: -28200 },
        { label: "COGS Băuturi", indent: true, negative: true, value: -10800 },
        { label: "BRUT PROFIT", isTotal: true, value: 100400 },
        { label: "CHELTUIELI OPERAȚIONALE", isHeader: true, value: 0 },
        { label: "Salarii", indent: true, negative: true, value: -39200 },
        { label: "Chirie", indent: true, negative: true, value: -12000 },
        { label: "Utilități", indent: true, negative: true, value: -4800 },
        { label: "EBITDA", isTotal: true, value: 44400 },
      ],
      cogsBreakdown: [
        { category: "Carne & Pește", amount: 18400, pct: 47.2 },
        { category: "Legume & Fructe", amount: 6200, pct: 15.9 },
        { category: "Lactate & Ouă", amount: 4800, pct: 12.3 },
        { category: "Băuturi alcoolice", amount: 7200, pct: 18.5 },
        { category: "Altele", amount: 2400, pct: 6.2 },
      ],
      ebitda: { revenue: 139400, ebit: 40200, ebitda: 44400 },
      ebitdaProjection: [
        { month: "Aug", value: 38000 }, { month: "Sep", value: 42000 }, { month: "Oct", value: 44000 },
        { month: "Nov", value: 41000 }, { month: "Dec", value: 52000 }, { month: "Ian", value: 44400 },
        { month: "Feb", value: 46000, projected: true }, { month: "Mar", value: 49000, projected: true },
        { month: "Apr", value: 51000, projected: true }, { month: "Mai", value: 55000, projected: true },
        { month: "Iun", value: 58000, projected: true }, { month: "Iul", value: 60000, projected: true },
      ],
      cashFlowStatement: [
        { label: "Activitate Operațională", isHeader: true, value: 0 },
        { label: "Încasări clienți", indent: true, value: 136800 },
        { label: "Plăți furnizori", indent: true, value: -39000 },
        { label: "Plăți salarii", indent: true, value: -39200 },
        { label: "FLUX NET OPERAȚIONAL", isHeader: true, value: 58600 },
        { label: "Activitate Investiții", isHeader: true, value: 0 },
        { label: "Echipamente", indent: true, value: -8400 },
        { label: "FLUX NET TOTAL", isHeader: true, value: 50200 },
      ],
      cashReconciliation: { register: 48200, physical: 48150 },
      taxForecast: [
        { name: "TVA Luna Ianuarie", dueDate: "25 Feb 2025", amount: 5200, status: "pending" },
        { name: "Impozit Profit T4", dueDate: "25 Mar 2025", amount: 2840, status: "pending" },
        { name: "CAS + CASS Salariați", dueDate: "25 Feb 2025", amount: 14800, status: "due" },
      ],
      accruals: [
        { description: "Chirie Febraruarie", period: "Feb 2025", amount: -12000 },
        { description: "Abonament Software", period: "Feb 2025", amount: -890 },
        { description: "Garanție echipamente", period: "Q1 2025", amount: 2400 },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 15. HOSPITALITY SUPERAPP ────────────────────────────────────────────────────
app.get("/api/superapp", (_req, res) => {
  res.json({
    restaurants: [
      { id: 1, name: "HoReCa Central", icon: "🏠", cuisine: "Internațional", location: "București Centru", rating: 4.7, deliveryTime: 25, minOrder: 45 },
      { id: 2, name: "Sky Lounge", icon: "🌆", cuisine: "Fine Dining", location: "Brașov", rating: 4.9, deliveryTime: 40, minOrder: 120 },
      { id: 3, name: "Garden Bistro", icon: "🌿", cuisine: "Mediteranean", location: "Cluj-Napoca", rating: 4.4, deliveryTime: 30, minOrder: 60 },
      { id: 4, name: "BurgerBox", icon: "🍔", cuisine: "Burgers & Fries", location: "Virtual Brand", rating: 4.6, deliveryTime: 20, minOrder: 35 },
    ],
    offers: [
      { icon: "🍕", title: "Pizza Ta Preferată", description: "Bazat pe cele 8 comenzi anterioare", discount: 20, expires: "Duminică 23:59", bonusPoints: 150 },
      { icon: "🥗", title: "Healthy Monday Deal", description: "Reducere pe salatele tale favorite", discount: 15, expires: "Luni 12:00", bonusPoints: 80 },
      { icon: "🎂", title: "La mulți ani!", description: "Ofertă specială de ziua ta", discount: 30, expires: "Ziua ta de naștere", bonusPoints: 300 },
    ],
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// END ENTERPRISE FEATURES
// ─────────────────────────────────────────────────────────────────────────────

// --- Global error handler ---
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  if (res.headersSent) return _next(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down...");
  server.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});
