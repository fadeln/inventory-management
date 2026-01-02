const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const headPassword = await bcrypt.hash('head123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Administrator',
      role: 'admin',
    },
  });

  const warehouseStaff = await prisma.user.upsert({
    where: { username: 'warehouse' },
    update: {},
    create: {
      username: 'warehouse',
      password: staffPassword,
      name: 'Warehouse Staff',
      role: 'warehouse_staff',
    },
  });

    const headWarehouseStaff = await prisma.user.upsert({
    where: { username: 'head_warehouse' },
    update: {},
    create: {
      username: 'head_warehouse',
      password: headPassword,
      name: 'Head Warehouse Staff',
      role: 'head_of_warehouse',
    },
  });

  const purchasing = await prisma.user.upsert({
    where: { username: 'purchasing' },
    update: {},
    create: {
      username: 'purchasing',
      password: staffPassword,
      name: 'Purchasing Staff',
      role: 'purchasing',
    },
  });

  const requester = await prisma.user.upsert({
    where: { username: 'requester' },
    update: {},
    create: {
      username: 'requester',
      password: staffPassword,
      name: 'Item Requester',
      role: 'requester',
    },
  });

  console.log('Users created');

  // Create categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      name: 'Electronics',
      description: 'Electronic devices and components',
    },
  });

  const office = await prisma.category.upsert({
    where: { name: 'Office Supplies' },
    update: {},
    create: {
      name: 'Office Supplies',
      description: 'Office and stationery items',
    },
  });

  const furniture = await prisma.category.upsert({
    where: { name: 'Furniture' },
    update: {},
    create: {
      name: 'Furniture',
      description: 'Office furniture and fixtures',
    },
  });

  console.log('Categories created');

  // Create suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { id: 'supplier-1' },
    update: {},
    create: {
      id: 'supplier-1',
      name: 'Tech Distributors Inc.',
      contactName: 'John Smith',
      email: 'john@techdist.com',
      phone: '+1-555-0100',
      address: '123 Tech Street, Silicon Valley, CA',
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { id: 'supplier-2' },
    update: {},
    create: {
      id: 'supplier-2',
      name: 'Office Plus Supplies',
      contactName: 'Jane Doe',
      email: 'jane@officeplus.com',
      phone: '+1-555-0200',
      address: '456 Office Ave, New York, NY',
    },
  });

  console.log('Suppliers created');

  // Create items
  await prisma.item.upsert({
    where: { sku: 'ELEC-001' },
    update: {},
    create: {
      sku: 'ELEC-001',
      name: 'Laptop Dell XPS 15',
      description: 'High-performance laptop',
      categoryId: electronics.id,
      unit: 'unit',
      minStock: 5,
      currentStock: 15,
      location: 'Warehouse A, Shelf 1',
    },
  });

  await prisma.item.upsert({
    where: { sku: 'ELEC-002' },
    update: {},
    create: {
      sku: 'ELEC-002',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse',
      categoryId: electronics.id,
      unit: 'unit',
      minStock: 20,
      currentStock: 50,
      location: 'Warehouse A, Shelf 2',
    },
  });

  await prisma.item.upsert({
    where: { sku: 'OFF-001' },
    update: {},
    create: {
      sku: 'OFF-001',
      name: 'A4 Paper (Ream)',
      description: '500 sheets of A4 paper',
      categoryId: office.id,
      unit: 'ream',
      minStock: 100,
      currentStock: 250,
      location: 'Warehouse B, Shelf 1',
    },
  });

  await prisma.item.upsert({
    where: { sku: 'OFF-002' },
    update: {},
    create: {
      sku: 'OFF-002',
      name: 'Ballpoint Pens (Box)',
      description: 'Box of 50 ballpoint pens',
      categoryId: office.id,
      unit: 'box',
      minStock: 30,
      currentStock: 8,
      location: 'Warehouse B, Shelf 2',
    },
  });

  await prisma.item.upsert({
    where: { sku: 'FURN-001' },
    update: {},
    create: {
      sku: 'FURN-001',
      name: 'Office Chair',
      description: 'Ergonomic office chair',
      categoryId: furniture.id,
      unit: 'unit',
      minStock: 10,
      currentStock: 25,
      location: 'Warehouse C, Section 1',
    },
  });

  console.log('Items created');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
