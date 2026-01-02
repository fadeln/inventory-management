const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all stock movements
router.get('/', authenticate, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        item: true,
        performedBy: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(movements);
  } catch (error) {
    console.error('Get stock movements error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get stock movements by item
router.get('/item/:itemId', authenticate, async (req, res) => {
  try {
    const movements = await prisma.stockMovement.findMany({
      where: { itemId: req.params.itemId },
      include: {
        item: true,
        performedBy: { select: { id: true, name: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(movements);
  } catch (error) {
    console.error('Get stock movements by item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
