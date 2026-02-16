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

// --- Products ---
app.get("/api/products", async (req, res) => {
  const where = {};
  if (req.query.departmentId) where.departmentId = Number(req.query.departmentId);
  if (req.query.categoryId) where.categoryId = Number(req.query.categoryId);
  const products = await prisma.product.findMany({
    where,
    include: { department: true, category: true },
    orderBy: { name: "asc" },
  });
  res.json(products);
});

app.post("/api/products", async (req, res) => {
  const product = await prisma.product.create({
    data: req.body,
    include: { department: true, category: true },
  });
  res.json(product);
});

app.put("/api/products/:id", async (req, res) => {
  const product = await prisma.product.update({
    where: { id: Number(req.params.id) },
    data: req.body,
    include: { department: true, category: true },
  });
  res.json(product);
});

app.delete("/api/products/:id", async (req, res) => {
  await prisma.product.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
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
