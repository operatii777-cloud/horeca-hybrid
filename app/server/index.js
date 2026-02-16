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
    const { tableNr, userId, items, source } = req.body;
    const order = await prisma.order.create({
      data: {
        tableNr,
        userId,
        source: source || "pos",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
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
