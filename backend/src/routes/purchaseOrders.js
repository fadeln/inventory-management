const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate purchase order number: PO-YYYYMMDD-XXXX
 */
const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PO-${year}${month}${day}-${random}`;
};

/**
 * GET /api/purchase-orders
 * Get all purchase orders
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        createdBy: { select: { id: true, name: true } },
        items: { include: { item: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error("Get purchase orders error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/purchase-orders
 * Create purchase order (DRAFT)
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "purchasing"),
  async (req, res) => {
    try {
      const { supplierId, items, notes, expectedDate } = req.body;

      if (!supplierId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const order = await prisma.purchaseOrder.create({
        data: {
          orderNumber: generateOrderNumber(),
          supplierId,
          createdById: req.user.id,
          notes: notes || null,
          expectedDate: new Date(`${expectedDate}T00:00:00.000Z`),
          status: "DRAFT",
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: { include: { item: true } },
        },
      });

      res.status(201).json(order);
    } catch (error) {
      console.error("Create purchase order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PUT /api/purchase-orders/:id
 * Update purchase order (DRAFT only)
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "purchasing"),
  async (req, res) => {
    try {
      const { supplierId, items, notes, expectedDate } = req.body;

      const order = await prisma.$transaction(async (tx) => {
        const existing = await tx.purchaseOrder.findUnique({
          where: { id: req.params.id },
        });

        if (!existing) {
          throw new Error("Purchase order not found");
        }

        if (existing.status !== "DRAFT") {
          throw new Error("Only DRAFT purchase orders can be edited");
        }

        return tx.purchaseOrder.update({
          where: { id: existing.id },
          data: {
            supplierId,
            notes: notes || null,
            expectedDate: new Date(`${expectedDate}T00:00:00.000Z`),
            items: {
              deleteMany: {},
              create: items.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            items: { include: { item: true } },
          },
        });
      });

      res.json(order);
    } catch (error) {
      console.error("Update purchase order error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/purchase-orders/:id/submit
 * Submit purchase order for approval
 */
router.post(
  "/:id/submit",
  authenticate,
  authorize("admin", "purchasing"),
  async (req, res) => {
    try {
      await prisma.purchaseOrder.update({
        where: { id: req.params.id },
        data: { status: "WAITING_APPROVAL" },
      });

      res.json({ message: "Purchase order submitted for approval" });
    } catch (error) {
      console.error("Submit purchase order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/purchase-orders/:id/approve
 * Partial approval
 * items = itemIds to REJECT (delete)
 * ✅ Stock movement happens here
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize("admin", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { items, signatureImage } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "items must be an array" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch purchase order with items
        const order = await tx.purchaseOrder.findUnique({
          where: { id: req.params.id },
          include: { items: true },
        });

        if (!order) {
          throw new Error("Purchase order not found");
        }

        if (order.status !== "WAITING_APPROVAL") {
          throw new Error("Only WAITING_APPROVAL can be approved");
        }

        // 2️⃣ Reject selected items (DELETE)
        if (items.length > 0) {
          await tx.purchaseOrderItem.deleteMany({
            where: {
              purchaseOrderId: order.id,
              itemId: { in: items },
            },
          });
        }

        // 3️⃣ Fetch approved (remaining) items
        const approvedItems = await tx.purchaseOrderItem.findMany({
          where: { purchaseOrderId: order.id },
        });

        if (approvedItems.length === 0) {
          throw new Error("All items were rejected");
        }

        // 4️⃣ Update stock + create stock movements (IN)
        for (const poItem of approvedItems) {
          const item = await tx.item.findUnique({
            where: { id: poItem.itemId },
          });

          if (!item) {
            throw new Error(`Item not found: ${poItem.itemId}`);
          }

          const newStock = item.currentStock + poItem.quantity;

          await tx.item.update({
            where: { id: item.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              itemId: item.id,
              type: "in",
              quantity: poItem.quantity,
              previousStock: item.currentStock,
              newStock,
              reference: order.orderNumber,
              performedById: req.user.id,
              notes: "Stock added from approved purchase order",
            },
          });
        }

        // 5️⃣ Approve purchase order
        return tx.purchaseOrder.update({
          where: { id: order.id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
            approvedById: req.user.id,
            signatureImage: signatureImage || null,
          },
        });
      });

      res.json(result);
    } catch (error) {
      console.error("Approve purchase order error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/purchase-orders/:id/reject
 * Reject entire purchase order
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize("admin", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { reason } = req.body;

      await prisma.purchaseOrder.update({
        where: { id: req.params.id },
        data: {
          status: "REJECTED",
          rejectReason: reason,
        },
      });

      res.json({ message: "Purchase order rejected" });
    } catch (error) {
      console.error("Reject purchase order error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/purchase-orders/:id
 * Delete purchase order
 */
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await prisma.purchaseOrder.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Purchase order deleted successfully" });
  } catch (error) {
    console.error("Delete purchase order error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
