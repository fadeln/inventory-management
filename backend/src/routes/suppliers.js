const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all suppliers
router.get('/', authenticate, async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    res.json(suppliers);
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get supplier by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: req.params.id },
    });

    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json(supplier);
  } catch (error) {
    console.error('Get supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create supplier
router.post('/', authenticate, authorize('admin', 'purchasing'), async (req, res) => {
  try {
    const { name, contactName, email, phone, address } = req.body;

    const supplier = await prisma.supplier.create({
      data: { name, contactName, email, phone, address },
    });

    res.status(201).json(supplier);
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update supplier
router.put('/:id', authenticate, authorize('admin', 'purchasing'), async (req, res) => {
  try {
    const { name, contactName, email, phone, address } = req.body;

    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: { name, contactName, email, phone, address },
    });

    res.json(supplier);
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete supplier
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await prisma.supplier.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
