// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // 1. Seed roles
  const rolesData = [
    { name: 'OWNER',      displayName: 'Owner',      description: 'Full access to the POS system' },
    { name: 'MANAGER',    displayName: 'Manager',    description: 'Manage products, stock and reports' },
    { name: 'CASHIER',    displayName: 'Cashier',    description: 'Handles daily sales and payments' },
    { name: 'INVENTORY',  displayName: 'Inventory',  description: 'Manages stock and purchases' },
    { name: 'ACCOUNTANT', displayName: 'Accountant', description: 'Views financial reports and exports' },
  ];

  const roles = {};

  for (const role of rolesData) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},          // no changes if already exists
      create: role,
    });
    roles[role.name] = r;
  }

  console.log('Roles seeded:', Object.keys(roles));

  // 2. Seed default users
  const ownerPasswordHash = await bcrypt.hash('owner123', 10);   // 🔒 change in real project
  const cashierPasswordHash = await bcrypt.hash('cashier123', 10);

  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      name: 'Shop Owner',
      email: 'owner@example.com',
      passwordHash: ownerPasswordHash,
      isActive: true,
      roles: {
        create: [
          { role: { connect: { id: roles.OWNER.id } } },
          { role: { connect: { id: roles.MANAGER.id } } },
        ],
      },
    },
    include: { roles: true },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: 'cashier@example.com' },
    update: {},
    create: {
      name: 'Main Cashier',
      email: 'cashier@example.com',
      passwordHash: cashierPasswordHash,
      isActive: true,
      roles: {
        create: [
          { role: { connect: { id: roles.CASHIER.id } } },
        ],
      },
    },
    include: { roles: true },
  });

  console.log('Users seeded:', {
    owner: ownerUser.email,
    cashier: cashierUser.email,
  });
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });