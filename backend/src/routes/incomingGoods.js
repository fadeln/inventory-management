const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate transaction number: IN-YYYYMMDD-XXXX
 */
const generateTransactionNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `IN-${year}${month}${day}-${random}`;
};

/**
 * GET /api/incoming-goods
 * Get all incoming goods with supplier, receiver, and items
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const incomingGoods = await prisma.incomingGoods.findMany({
      include: {
        supplier: true,
        receivedBy: {
          select: { id: true, name: true, username: true },
        },
        items: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(incomingGoods);
  } catch (error) {
    console.error("Get incoming goods error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/incoming-goods
 * Create a new incoming goods transaction in DRAFT status
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const { supplierId, items, notes, receivedAt, referenceNumber } =
        req.body;

      if (!supplierId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const incomingGoods = await prisma.incomingGoods.create({
        data: {
          transactionNumber: generateTransactionNumber(),
          referenceNumber,
          supplierId,
          receivedById: req.user.id,
          receivedAt: receivedAt ? new Date(receivedAt) : new Date(),
          notes: notes || null,
          status: "DRAFT",
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
              unitPrice: item.unitPrice ?? null,
            })),
          },
        },
        include: {
          supplier: true,
          receivedBy: {
            select: { id: true, name: true, username: true },
          },
          items: {
            include: { item: true },
          },
        },
      });

      res.status(201).json(incomingGoods);
    } catch (error) {
      console.error("Create incoming goods error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PUT /api/incoming-goods/:id
 * Update an existing incoming goods transaction (DRAFT only)
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const { supplierId, items, notes, receivedAt, referenceNumber } =
        req.body;

      if (!supplierId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const incomingGoods = await prisma.$transaction(async (tx) => {
        const existing = await tx.incomingGoods.findUnique({
          where: { id: req.params.id },
          include: { items: true },
        });

        if (!existing) {
          throw new Error("Incoming goods not found");
        }

        if (existing.status !== "DRAFT") {
          throw new Error("Only DRAFT incoming goods can be edited");
        }

        return tx.incomingGoods.update({
          where: { id: existing.id },
          data: {
            supplierId,
            referenceNumber,
            receivedAt: receivedAt ? new Date(receivedAt) : existing.receivedAt,
            notes: notes || null,
            items: {
              deleteMany: {},
              create: items.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                unitPrice: item.unitPrice ?? null,
              })),
            },
          },
          include: {
            supplier: true,
            receivedBy: {
              select: { id: true, name: true, username: true },
            },
            items: {
              include: { item: true },
            },
          },
        });
      });

      res.status(200).json(incomingGoods);
    } catch (error) {
      console.error("Update incoming goods error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/incoming-goods/:id/approve
 * Approve incoming goods with partial item rejection support
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
        const incoming = await tx.incomingGoods.findUnique({
          where: { id: req.params.id },
          include: { items: true },
        });

        if (!incoming) {
          throw new Error("Incoming goods not found");
        }

        if (incoming.status !== "WAITING_APPROVAL") {
          throw new Error("Only WAITING_APPROVAL can be approved");
        }

        if (items.length > 0) {
          await tx.incomingGoodsItem.deleteMany({
            where: {
              incomingGoodsId: incoming.id,
              itemId: { in: items },
            },
          });
        }

        await tx.incomingGoods.update({
          where: { id: incoming.id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
            signatureImage: signatureImage || null,
          },
        });

        const approvedItems = await tx.incomingGoodsItem.findMany({
          where: { incomingGoodsId: incoming.id },
        });

        if (approvedItems.length === 0) {
          throw new Error("All items were rejected. Nothing to approve.");
        }

        for (const igItem of approvedItems) {
          const item = await tx.item.findUnique({
            where: { id: igItem.itemId },
          });

          if (!item) {
            throw new Error(`Item not found: ${igItem.itemId}`);
          }

          const newStock = item.currentStock + igItem.quantity;

          await tx.item.update({
            where: { id: item.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              itemId: item.id,
              type: "in",
              quantity: igItem.quantity,
              previousStock: item.currentStock,
              newStock,
              reference: incoming.transactionNumber,
              performedById: req.user.id,
              notes: "Incoming goods approved (partial)",
            },
          });
        }

        return {
          incomingId: incoming.id,
          approvedItemCount: approvedItems.length,
          rejectedItemCount: items.length,
        };
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Approve incoming goods error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/incoming-goods/:id/submit
 * Submit incoming goods for approval
 */
router.post(
  "/:id/submit",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      await prisma.incomingGoods.update({
        where: { id: req.params.id },
        data: {
          status: "WAITING_APPROVAL",
        },
      });

      res.json({ message: "Incoming goods submitted successfully" });
    } catch (error) {
      console.error("Submit incoming goods error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/incoming-goods/:id/reject
 * Reject an incoming goods transaction
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize("admin", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { status, reason } = req.body;

      await prisma.incomingGoods.update({
        where: { id: req.params.id },
        data: {
          status,
          rejectReason: reason,
        },
      });

      res.json({ message: "Incoming goods rejected successfully" });
    } catch (error) {
      console.error("Reject incoming goods error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/incoming-goods/:id
 * Delete an incoming goods transaction
 */
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await prisma.incomingGoods.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Incoming goods deleted successfully" });
  } catch (error) {
    console.error("Delete incoming goods error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
