const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', authenticate, async (req, res) => {
  try {
    const [
      totalItems,
      totalCategories,
      totalSuppliers,
      lowStockItems,
      pendingRequests,
      pendingPurchaseOrders,
      recentMovements,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.category.count(),
      prisma.supplier.count(),
      prisma.item.count({ where: { currentStock: { lte: prisma.item.fields.minStock } } }),
      prisma.itemRequest.count({ where: { status: 'pending' } }),
      prisma.purchaseOrder.count({ where: { status: 'pending' } }),
      prisma.stockMovement.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          item: true,
          performedBy: { select: { id: true, name: true } },
        },
      }),
    ]);

    // Get low stock items details
    const lowStockItemsList = await prisma.item.findMany({
      where: {
        currentStock: { lte: 10 }, // Using a fixed threshold for simplicity
      },
      include: { category: true },
      take: 10,
    });

    res.json({
      totalItems,
      totalCategories,
      totalSuppliers,
      lowStockItems: lowStockItemsList.length,
      pendingRequests,
      pendingPurchaseOrders,
      recentMovements,
      lowStockItemsList,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
