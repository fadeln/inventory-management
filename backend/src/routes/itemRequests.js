const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate request number: REQ-YYYYMMDD-XXXX
 */
const generateRequestNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `REQ-${year}${month}${day}-${random}`;
};

/**
 * GET /api/item-requests
 * Get all item requests
 */
router.get("/", authenticate, async (req, res) => {
  try {
    const requests = await prisma.itemRequest.findMany({
      include: {
        createdBy: {
          select: { id: true, name: true, username: true },
        },
        approvedBy: {
          select: { id: true, name: true, username: true },
        },
        items: {
          include: { item: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(requests);
  } catch (error) {
    console.error("Get item requests error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/item-requests
 * Create item request (DRAFT)
 */
router.post("/", authenticate, async (req, res) => {
  try {
    const { items, requestedBy, department, requiredDate, notes } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "items is required" });
    }

    const request = await prisma.itemRequest.create({
      data: {
        requestNumber: generateRequestNumber(),
        requestedBy,
        department,
        notes,
        requiredDate: new Date(`${requiredDate}T00:00:00.000Z`),
        createdById: req.user.id,
        status: "DRAFT",
        items: {
          create: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.status(201).json(request);
  } catch (error) {
    console.error("Create item request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/item-requests/:id
 * Update item request (DRAFT only)
 */
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { reason, items, requestedBy, department, requiredDate, notes } =
      req.body;

    const existing = await prisma.itemRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Item request not found" });
    }

    if (existing.status !== "DRAFT") {
      return res
        .status(400)
        .json({ error: "Only DRAFT requests can be edited" });
    }

    const request = await prisma.itemRequest.update({
      where: { id: req.params.id },
      data: {
        reason,
        requestedBy,
        department,
        notes,
        requiredDate: new Date(`${requiredDate}T00:00:00.000Z`),
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            itemId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    res.json(request);
  } catch (error) {
    console.error("Update item request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/item-requests/:id/submit
 * Submit item request for approval
 */
router.post(
  "/:id/submit",
  authenticate,
  authorize("admin", "warehouse_staff"),
  async (req, res) => {
    try {
      const request = await prisma.itemRequest.update({
        where: { id: req.params.id },
        data: {
          status: "WAITING_APPROVAL",
        },
      });

      res.json(request);
    } catch (error) {
      console.error("Submit item request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * POST /api/item-requests/:id/approve
 * Partial approval
 * items = itemIds to REJECT (delete)
 * ✅ Stock deducted + stock movement created
 */
router.post(
  "/:id/approve",
  authenticate,
  authorize("admin", "warehouse_staff", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { status, signatureImage, items } = req.body;

      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "items must be an array" });
      }

      const result = await prisma.$transaction(async (tx) => {
        // 1️⃣ Fetch request + items
        const request = await tx.itemRequest.findUnique({
          where: { id: req.params.id },
          include: { items: true },
        });

        if (!request) {
          throw new Error("Item request not found");
        }

        if (request.status !== "WAITING_APPROVAL") {
          throw new Error("Only WAITING_APPROVAL can be approved");
        }

        // 2️⃣ Reject selected items
        if (items.length > 0) {
          await tx.itemRequestItem.deleteMany({
            where: {
              itemRequestId: request.id,
              itemId: { in: items },
            },
          });
        }

        // 3️⃣ Fetch approved items
        const approvedItems = await tx.itemRequestItem.findMany({
          where: { itemRequestId: request.id },
        });

        if (approvedItems.length === 0) {
          throw new Error("All items were rejected");
        }

        // 4️⃣ Update stock + create stock movement (OUT)
        for (const reqItem of approvedItems) {
          const item = await tx.item.findUnique({
            where: { id: reqItem.itemId },
          });

          if (!item) {
            throw new Error(`Item not found: ${reqItem.itemId}`);
          }

          if (item.currentStock < reqItem.quantity) {
            throw new Error(`Insufficient stock for item ${item.name}`);
          }

          const newStock = item.currentStock - reqItem.quantity;

          await tx.item.update({
            where: { id: item.id },
            data: { currentStock: newStock },
          });

          await tx.stockMovement.create({
            data: {
              itemId: item.id,
              type: "out",
              quantity: reqItem.quantity,
              previousStock: item.currentStock,
              newStock,
              reference: request.requestNumber,
              performedById: req.user.id,
              notes: "Item request approved",
            },
          });
        }

        // 5️⃣ Approve request
        const updated = await tx.itemRequest.update({
          where: { id: request.id },
          data: {
            status,
            approvedAt: new Date(),
            approvedById: req.user.id,
            signatureImage,
          },
        });

        return updated;
      });

      res.json(result);
    } catch (error) {
      console.error("Approve item request error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

/**
 * POST /api/item-requests/:id/reject
 * Reject entire item request
 */
router.post(
  "/:id/reject",
  authenticate,
  authorize("admin", "warehouse_staff", "head_of_warehouse"),
  async (req, res) => {
    try {
      const { status, reason } = req.body;

      const request = await prisma.itemRequest.update({
        where: { id: req.params.id },
        data: {
          status,
          rejectReason: reason,
        },
      });

      res.json(request);
    } catch (error) {
      console.error("Reject item request error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * DELETE /api/item-requests/:id
 * Delete item request
 */
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.itemRequest.delete({
      where: { id: req.params.id },
    });

    res.json({ message: "Item request deleted successfully" });
  } catch (error) {
    console.error("Delete item request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
