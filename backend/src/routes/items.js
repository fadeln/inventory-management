const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

// Get all items
router.get("/", authenticate, async (req, res) => {
  try {
    const items = await prisma.item.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(items);
  } catch (error) {
    console.error("Get items error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get item by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: req.params.id },
      include: { category: true },
    });

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (error) {
    console.error("Get item error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create item
router.post(
  "/",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const {
        code, // This is sku in your database
        name,
        description,
        categoryId,
        unit,
        minStock,
        stock, // This is currentStock in your database
        location,
      } = req.body;

      console.log("Creating item with data:", req.body);

      // Validate required fields
      if (!code || !name || !categoryId || !unit) {
        return res.status(400).json({
          error: "Missing required fields",
          details: "Code, name, category, and unit are required",
        });
      }

      // Check if SKU already exists
      const existingItem = await prisma.item.findFirst({
        where: {
          sku: code,
        },
      });

      if (existingItem) {
        return res.status(409).json({ error: "Item SKU already exists" });
      }

      // Find category to ensure it exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      const item = await prisma.item.create({
        data: {
          sku: code, // Map code to sku
          name,
          description: description || "",
          categoryId,
          unit,
          minStock: parseInt(minStock) || 0,
          currentStock: parseInt(stock) || 0, // Map stock to currentStock
          location: location || "",
        },
        include: { category: true },
      });

      res.status(201).json(item);
    } catch (error) {
      console.error("Create item error details:", error);

      if (error.code === "P2002") {
        // Prisma unique constraint violation (sku)
        return res.status(409).json({ error: "Item SKU already exists" });
      }

      if (error.code === "P2003") {
        // Foreign key constraint violation (category doesn't exist)
        return res.status(400).json({ error: "Invalid category" });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Update item
router.put(
  "/:id",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const {
        code, // sku in database
        name,
        description,
        categoryId,
        unit,
        minStock,
        stock, // currentStock in database
        location,
      } = req.body;

      console.log("Updating item with data:", req.body);

      // Check if item exists
      const existingItem = await prisma.item.findUnique({
        where: { id: req.params.id },
      });

      if (!existingItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      // If code/sku is being changed, check if new sku already exists
      if (code && code !== existingItem.sku) {
        const skuExists = await prisma.item.findFirst({
          where: {
            id: { not: req.params.id },
            sku: code,
          },
        });

        if (skuExists) {
          return res.status(409).json({ error: "Item SKU already exists" });
        }
      }

      // If category is being changed, verify it exists
      if (categoryId && categoryId !== existingItem.categoryId) {
        const category = await prisma.category.findUnique({
          where: { id: categoryId },
        });

        if (!category) {
          return res.status(404).json({ error: "Category not found" });
        }
      }

      const item = await prisma.item.update({
        where: { id: req.params.id },
        data: {
          sku: code || existingItem.sku,
          name: name || existingItem.name,
          description:
            description !== undefined ? description : existingItem.description,
          categoryId: categoryId || existingItem.categoryId,
          unit: unit || existingItem.unit,
          minStock:
            minStock !== undefined ? parseInt(minStock) : existingItem.minStock,
          currentStock:
            stock !== undefined ? parseInt(stock) : existingItem.currentStock,
          location: location !== undefined ? location : existingItem.location,
        },
        include: { category: true },
      });

      res.json(item);
    } catch (error) {
      console.error("Update item error:", error);

      if (error.code === "P2002") {
        return res.status(409).json({ error: "Item SKU already exists" });
      }

      if (error.code === "P2025") {
        return res.status(404).json({ error: "Item not found" });
      }

      if (error.code === "P2003") {
        return res.status(400).json({ error: "Invalid category" });
      }

      res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Delete item
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    // First check if item exists
    const existingItem = await prisma.item.findUnique({
      where: { id: req.params.id },
    });

    if (!existingItem) {
      return res.status(404).json({ error: "Item not found" });
    }

    await prisma.item.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("Delete item error:", error);

    if (error.code === "P2025") {
      return res.status(404).json({ error: "Item not found" });
    }

    // Check if item has related records
    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Cannot delete item. It has related records (transactions, requests, etc.).",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
