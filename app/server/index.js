const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- Auth ---
app.post("/api/auth/login", async (req, res) => {
  const { pin } = req.body;
  if (!pin) return res.status(400).json({ error: "PIN is required" });
  const user = await prisma.user.findUnique({ where: { pin } });
  if (!user) return res.status(401).json({ error: "Invalid PIN" });
  res.json({ id: user.id, name: user.name, role: user.role });
});

// --- Users ---
app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  res.json(users.map(({ pin, ...u }) => u));
});

app.put("/api/users/:id", async (req, res) => {
  const { name } = req.body;
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { name },
  });
  res.json(user);
});

// --- Departments ---
app.get("/api/departments", async (_req, res) => {
  const departments = await prisma.department.findMany({ orderBy: { id: "asc" } });
  res.json(departments);
});

app.post("/api/departments", async (req, res) => {
  const dept = await prisma.department.create({ data: req.body });
  res.json(dept);
});

app.put("/api/departments/:id", async (req, res) => {
  const dept = await prisma.department.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(dept);
});

app.delete("/api/departments/:id", async (req, res) => {
  await prisma.department.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// --- Categories ---
app.get("/api/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { id: "asc" } });
  res.json(categories);
});

app.post("/api/categories", async (req, res) => {
  const cat = await prisma.category.create({ data: req.body });
  res.json(cat);
});

app.put("/api/categories/:id", async (req, res) => {
  const cat = await prisma.category.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(cat);
});

app.delete("/api/categories/:id", async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// --- Suppliers ---
app.get("/api/suppliers", async (_req, res) => {
  const suppliers = await prisma.supplier.findMany({ orderBy: { id: "asc" } });
  res.json(suppliers);
});

app.post("/api/suppliers", async (req, res) => {
  const supplier = await prisma.supplier.create({ data: req.body });
  res.json(supplier);
});

app.put("/api/suppliers/:id", async (req, res) => {
  const supplier = await prisma.supplier.update({
    where: { id: Number(req.params.id) },
    data: req.body,
  });
  res.json(supplier);
});

app.delete("/api/suppliers/:id", async (req, res) => {
  await prisma.supplier.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

// --- Products ---
app.get("/api/products", async (req, res) => {
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  if (req.query.categoryId) where.categoryId = Number(req.query.categoryId);
  const products = await prisma.product.findMany({
    where,
    include: { department: true, category: true, stockItems: true },
    orderBy: { name: "asc" },
  });
  res.json(products);
});

app.post("/api/products", async (req, res) => {
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
});

app.put("/api/products/:id", async (req, res) => {
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: req.body,
    include: { department: true, category: true, stockItems: true },
  });
  res.json(product);
});

app.delete("/api/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.stock.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  res.json({ ok: true });
});

// --- Stock ---
app.get("/api/stock", async (req, res) => {
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  const stock = await prisma.stock.findMany({
    where,
    include: { product: true, department: true },
    orderBy: { id: "asc" },
  });
  res.json(stock);
});

// --- Recipes ---
app.get("/api/recipes", async (_req, res) => {
  const recipes = await prisma.recipe.findMany({
    include: { product: true, items: { include: { product: true } } },
    orderBy: { id: "asc" },
  });
  res.json(recipes);
});

app.post("/api/recipes", async (req, res) => {
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
});

app.delete("/api/recipes/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.recipeItem.deleteMany({ where: { recipeId: id } });
  await prisma.recipe.delete({ where: { id } });
  res.json({ ok: true });
});

// --- NIR (Nota de Intrare Recepție) ---
app.get("/api/nir", async (_req, res) => {
  const nirs = await prisma.nIR.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
  res.json(nirs);
});

app.post("/api/nir", async (req, res) => {
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
});

// --- Transfer ---
app.get("/api/transfers", async (_req, res) => {
  const transfers = await prisma.transfer.findMany({
    include: {
      fromDepartment: true,
      toDepartment: true,
      items: { include: { product: true } },
    },
    orderBy: { date: "desc" },
  });
  res.json(transfers);
});

app.post("/api/transfers", async (req, res) => {
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
});

// --- Retur ---
app.get("/api/returs", async (_req, res) => {
  const returs = await prisma.retur.findMany({
    include: { supplier: true, items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
  res.json(returs);
});

app.post("/api/returs", async (req, res) => {
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
});

// --- Inventory ---
app.get("/api/inventories", async (_req, res) => {
  const inventories = await prisma.inventory.findMany({
    include: { items: { include: { product: true } } },
    orderBy: { date: "desc" },
  });
  res.json(inventories);
});

app.post("/api/inventories", async (req, res) => {
  const { name, departmentId } = req.body;

  // Get current stock for the department
  const where = {};
  if (departmentId) where.departmentId = Number(departmentId);
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
});

app.put("/api/inventories/:id/items", async (req, res) => {
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
    where: { id: Number(req.params.id) },
    include: { items: { include: { product: true } } },
  });
  res.json(inventory);
});

// --- Orders ---
app.get("/api/orders", async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  if (req.query.userId) where.userId = Number(req.query.userId);
  const orders = await prisma.order.findMany({
    where,
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

app.post("/api/orders", async (req, res) => {
  const { tableNr, userId, items } = req.body;
  const order = await prisma.order.create({
    data: {
      tableNr,
      userId,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    },
    include: { user: true, items: { include: { product: true } } },
  });
  res.json(order);
});

app.put("/api/orders/:id/close", async (req, res) => {
  const { payMethod } = req.body;
  const order = await prisma.order.update({
    where: { id: Number(req.params.id) },
    data: { status: "closed", payMethod, closedAt: new Date() },
    include: { user: true, items: { include: { product: true } } },
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
});

app.delete("/api/orders/:id", async (req, res) => {
  const orderId = Number(req.params.id);
  await prisma.orderItem.deleteMany({ where: { orderId } });
  await prisma.order.delete({ where: { id: orderId } });
  res.json({ ok: true });
});

// --- Reports ---
app.get("/api/reports/sales", async (req, res) => {
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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
