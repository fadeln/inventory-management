const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate transaction number: OUT-YYYYMMDD-XXXX
 */
const generateTransactionNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `OUT-${year}${month}${day}-${random}`;
};

/**
 * GET /api/outgoing-goods
 * Get all outgoing goods
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const outgoingGoods = await prisma.outgoingGoods.findMany({
      include: {
        issuedBy: { select: { id: true, name: true, username: true } },
        items: {
          include: {
            item: {
              select: {
                id: true,
                sku: true,
                name: true,
                currentStock: true,
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(outgoingGoods);
  } catch (error) {
    console.error("Get outgoing goods error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/outgoing-goods
 * Create outgoing goods (DRAFT)
 * ❌ No stock update here
 */
router.post(
  "/",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const { destination, recipientName, notes, items, issuedById } = req.body;

      if (!destination || !recipientName || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: "Invalid request data" });
      }

      const outgoingGoods = await prisma.outgoingGoods.create({
        data: {
          transactionNumber: generateTransactionNumber(),
          destination,
          recipientName,
          notes: notes || "",
          issuedById: issuedById || req.user.id,
          status: "DRAFT",
          items: {
            create: items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          issuedBy: { select: { id: true, name: true, username: true } },
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                  currentStock: true,
                  unit: true,
                },
              },
            },
          },
        },
      });

      res.status(201).json(outgoingGoods);
    } catch (error) {
      console.error("Create outgoing goods error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PUT /api/outgoing-goods/:id
 * Update outgoing goods (DRAFT only)
 * ❌ No stock update
 */
router.put(
  "/:id",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const { destination, recipientName, notes, items } = req.body;

      const outgoingGoods = await prisma.$transaction(async (tx) => {
        const existing = await tx.outgoingGoods.findUnique({
          where: { id: req.params.id },
          include: { items: true },
        });

        if (!existing) {
          throw new Error("Outgoing goods not found");
        }

        if (existing.status !== "DRAFT") {
          throw new Error("Only DRAFT outgoing goods can be edited");
        }

        return tx.outgoingGoods.update({
          where: { id: existing.id },
          data: {
            destination,
            recipientName,
            notes: notes || "",
            items: {
              deleteMany: {},
              create: items.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
              })),
            },
          },
          include: {
            issuedBy: { select: { id: true, name: true, username: true } },
            items: {
              include: {
                item: {
                  select: {
                    id: true,
                    sku: true,
                    name: true,
                    currentStock: true,
                    unit: true,
                  },
                },
              },
            },
          },
        });
      });

      res.json(outgoingGoods);
    } catch (error) {
      console.error("Update outgoing goods error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/outgoing-goods/:id/submit
 * Submit outgoing goods for approval
 */
router.post(
  "/:id/submit",
  authenticate,
  authorize("admin"),
  async (req, res) => {
    try {
      await prisma.outgoingGoods.update({
        where: { id: req.params.id },
        data: { status: "WAITING_APPROVAL" },
      });

      res.json({ message: "Outgoing goods submitted for approval" });
    } catch (error) {
      console.error("Submit outgoing goods error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/outgoing-goods/:id/approve
 * Partial approval
 * items = itemIds to REJECT (delete)
 * ✅ Stock updated ONLY for approved items
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize("admin", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { items, signatureImage } = req.body;
      // items: string[] (itemIds to delete)

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "items must be an array" });
      }

      const result = await prisma.$transaction(async (tx) => {
        const outgoing = await tx.outgoingGoods.findUnique({
          where: { id: req.params.id },
          include: { items: true },
        });

        if (!outgoing) {
          throw new Error("Outgoing goods not found");
        }

        if (outgoing.status !== "WAITING_APPROVAL") {
          throw new Error("Only WAITING_APPROVAL can be approved");
        }

        // Reject selected items
        if (items.length > 0) {
          await tx.outgoingGoodsItem.deleteMany({
            where: {
              outgoingGoodsId: outgoing.id,
              itemId: { in: items },
            },
          });
        }

        await tx.outgoingGoods.update({
          where: { id: outgoing.id },
          data: {
            status: "APPROVED",
            approvedAt: new Date(),
            signatureImage: signatureImage || null,
          },
        });

        const approvedItems = await tx.outgoingGoodsItem.findMany({
          where: { outgoingGoodsId: outgoing.id },
        });

        if (approvedItems.length === 0) {
          throw new Error("All items were rejected. Nothing to approve.");
        }

        // Update stock + stock movements for approved items
        for (const ogItem of approvedItems) {
          const item = await tx.item.findUnique({
            where: { id: ogItem.itemId },
          });

          if (!item) {
            throw new Error(`Item not found: ${ogItem.itemId}`);
          }

          const newStock = item.currentStock - ogItem.quantity;

          await tx.item.update({
            where: { id: item.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              itemId: item.id,
              type: "out",
              quantity: ogItem.quantity,
              previousStock: item.currentStock,
              newStock,
              reference: outgoing.transactionNumber,
              performedById: req.user.id,
              notes: "Outgoing goods approved (partial)",
            },
          });
        }

        return {
          outgoingId: outgoing.id,
          approvedItemCount: approvedItems.length,
          rejectedItemCount: items.length,
        };
      });

      res.status(200).json(result);
    } catch (error) {
      console.error("Approve outgoing goods error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/outgoing-goods/:id/reject
 * Reject entire outgoing goods transaction
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize("admin", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { status, reason } = req.body;

      await prisma.outgoingGoods.update({
        where: { id: req.params.id },
        data: {
          status,
          rejectReason: reason,
        },
      });

      res.json({ message: "Outgoing goods rejected successfully" });
    } catch (error) {
      console.error("Reject outgoing goods error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/outgoing-goods/:id
 * Delete outgoing goods
 */
router.delete("/:id", authenticate, authorize("admin"), async (req, res) => {
  try {
    await prisma.outgoingGoods.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Outgoing goods deleted successfully" });
  } catch (error) {
    console.error("Delete outgoing goods error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
