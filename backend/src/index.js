require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const supplierRoutes = require("./routes/suppliers");
const itemRoutes = require("./routes/items");
const itemRequestRoutes = require("./routes/itemRequests");
const incomingGoodsRoutes = require("./routes/incomingGoods");
const outgoingGoodsRoutes = require("./routes/outgoingGoods");
const stockMovementRoutes = require("./routes/stockMovements");
const purchaseOrderRoutes = require("./routes/purchaseOrders");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/item-requests", itemRequestRoutes);
app.use("/api/incoming-goods", incomingGoodsRoutes);
app.use("/api/outgoing-goods", outgoingGoodsRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
