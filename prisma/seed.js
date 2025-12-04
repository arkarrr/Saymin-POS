// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Roles
  const rolesData = [
    {
      name: "OWNER",
      displayName: "Owner",
      description: "Full access to the POS system",
    },
    {
      name: "MANAGER",
      displayName: "Manager",
      description: "Manages products, stock and reports",
    },
    {
      name: "CASHIER",
      displayName: "Cashier",
      description: "Handles daily sales and payments",
    },
    {
      name: "INVENTORY",
      displayName: "Inventory",
      description: "Manages stock operations",
    },
    {
      name: "ACCOUNTANT",
      displayName: "Accountant",
      description: "Views financial reports and exports",
    },
  ];

  const roles = {};
  for (const role of rolesData) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    roles[role.name] = r;
  }
  console.log("Roles seeded:", Object.keys(roles));

  // 2. Seed Permissions
  const permissionsData = [
    // Products & inventory
    {
      key: "MANAGE_PRODUCTS",
      description: "Create/update/delete products and prices",
    },
    { key: "VIEW_STOCK", description: "View stock levels" },
    { key: "ADJUST_STOCK", description: "Perform stock adjustments" },
    {
      key: "MANAGE_PURCHASES",
      description: "Create and manage purchase orders/stock-in",
    },

    // Sales & cash
    { key: "CREATE_SALE", description: "Create sales in POS" },
    { key: "APPLY_DISCOUNT", description: "Apply normal discounts" },
    {
      key: "APPLY_HIGH_DISCOUNT",
      description: "Apply large discounts (e.g. >20%)",
    },
    {
      key: "MANAGE_PAY_LATER",
      description: "Create and manage pay-later/credit sales",
    },
    { key: "OPEN_CLOSE_SHIFT", description: "Open and close cashier shift" },
    { key: "VIEW_OWN_SHIFT_REPORT", description: "View own shift summary" },
    {
      key: "VIEW_ALL_SHIFTS",
      description: "View all cashiers’ shift summaries",
    },

    // Customers & suppliers
    { key: "MANAGE_CUSTOMERS", description: "Create/update customer records" },
    {
      key: "VIEW_CUSTOMER_BALANCES",
      description: "View customer credit balances",
    },
    { key: "MANAGE_SUPPLIERS", description: "Create/update supplier records" },

    // Reports & finance
    { key: "VIEW_SALES_REPORTS", description: "View sales reports" },
    { key: "VIEW_PROFIT_REPORTS", description: "View profit/COGS reports" },
    { key: "EXPORT_REPORTS", description: "Export data (CSV/Excel)" },

    // System & settings
    {
      key: "MANAGE_USERS",
      description: "Create/update users and assign roles",
    },
    {
      key: "MANAGE_SETTINGS",
      description: "Update system settings and parameters",
    },
  ];

  const permissions = {};
  for (const perm of permissionsData) {
    const p = await prisma.permission.upsert({
      where: { key: perm.key },
      update: {},
      create: perm,
    });
    permissions[perm.key] = p;
  }
  console.log("Permissions seeded:", Object.keys(permissions));

  // 3. Attach permissions to roles
  const rolePermissionsMap = {
    OWNER: [
      "MANAGE_PRODUCTS",
      "VIEW_STOCK",
      "ADJUST_STOCK",
      "MANAGE_PURCHASES",
      "CREATE_SALE",
      "APPLY_DISCOUNT",
      "APPLY_HIGH_DISCOUNT",
      "MANAGE_PAY_LATER",
      "OPEN_CLOSE_SHIFT",
      "VIEW_OWN_SHIFT_REPORT",
      "VIEW_ALL_SHIFTS",
      "MANAGE_CUSTOMERS",
      "VIEW_CUSTOMER_BALANCES",
      "MANAGE_SUPPLIERS",
      "VIEW_SALES_REPORTS",
      "VIEW_PROFIT_REPORTS",
      "EXPORT_REPORTS",
      "MANAGE_USERS",
      "MANAGE_SETTINGS",
    ],
    MANAGER: [
      "MANAGE_PRODUCTS",
      "VIEW_STOCK",
      "ADJUST_STOCK",
      "MANAGE_PURCHASES",
      "CREATE_SALE",
      "APPLY_DISCOUNT",
      "APPLY_HIGH_DISCOUNT",
      "OPEN_CLOSE_SHIFT",
      "VIEW_OWN_SHIFT_REPORT",
      "VIEW_ALL_SHIFTS",
      "MANAGE_CUSTOMERS",
      "VIEW_CUSTOMER_BALANCES",
      "MANAGE_SUPPLIERS",
      "VIEW_SALES_REPORTS",
      "EXPORT_REPORTS",
    ],
    CASHIER: [
      "CREATE_SALE",
      "APPLY_DISCOUNT",
      "MANAGE_PAY_LATER",
      "OPEN_CLOSE_SHIFT",
      "VIEW_OWN_SHIFT_REPORT",
      "MANAGE_CUSTOMERS",
    ],
    INVENTORY: [
      "VIEW_STOCK",
      "ADJUST_STOCK",
      "MANAGE_PURCHASES",
      "MANAGE_SUPPLIERS",
    ],
    ACCOUNTANT: [
      "VIEW_SALES_REPORTS",
      "VIEW_PROFIT_REPORTS",
      "EXPORT_REPORTS",
      "VIEW_CUSTOMER_BALANCES",
    ],
  };

  for (const [roleName, permKeys] of Object.entries(rolePermissionsMap)) {
    const role = roles[roleName];
    if (!role) continue;

    for (const key of permKeys) {
      const perm = permissions[key];
      if (!perm) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: perm.id,
        },
      });
    }
  }
  console.log("Role-permission mappings seeded");

  // 4. Default Users (same idea as before)
  const ownerPasswordHash = await bcrypt.hash("owner123", 10);
  const cashierPasswordHash = await bcrypt.hash("cashier123", 10);

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Shop Owner",
      email: "owner@example.com",
      passwordHash: ownerPasswordHash,
      isActive: true,
      roles: {
        create: [
          { role: { connect: { name: "OWNER" } } },
          { role: { connect: { name: "MANAGER" } } },
        ],
      },
    },
  });

  const cashierUser = await prisma.user.upsert({
    where: { email: "cashier@example.com" },
    update: {},
    create: {
      name: "Main Cashier",
      email: "cashier@example.com",
      passwordHash: cashierPasswordHash,
      isActive: true,
      roles: {
        create: [{ role: { connect: { name: "CASHIER" } } }],
      },
    },
  });

  console.log("Users seeded:", {
    owner: ownerUser.email,
    cashier: cashierUser.email,
  });

  // 7. Seed Outlets
  const outletsData = [
    {
      name: "Main Shop",
      code: "OUTLET-MAIN",
      address: "123 Main Road",
    },
    {
      name: "Warehouse",
      code: "OUTLET-WH",
      address: "Industrial Zone Block 4",
    },
  ];

  const outlets = {};
  for (const o of outletsData) {
    const outlet = await prisma.outlet.upsert({
      where: { code: o.code },
      update: {},
      create: o,
    });
    outlets[o.code] = outlet;
  }
  console.log("Outlets seeded:", Object.keys(outlets));

  // 8. Link users to outlets
  // Owner has both outlets, default = Main
  await prisma.userOutlet.upsert({
    where: {
      userId_outletId: {
        userId: ownerUser.id,
        outletId: outlets["OUTLET-MAIN"].id,
      },
    },
    update: { isDefault: true },
    create: {
      userId: ownerUser.id,
      outletId: outlets["OUTLET-MAIN"].id,
      isDefault: true,
    },
  });

  await prisma.userOutlet.upsert({
    where: {
      userId_outletId: {
        userId: ownerUser.id,
        outletId: outlets["OUTLET-WH"].id,
      },
    },
    update: {},
    create: {
      userId: ownerUser.id,
      outletId: outlets["OUTLET-WH"].id,
    },
  });

  // Cashier only sees Main Shop
  await prisma.userOutlet.upsert({
    where: {
      userId_outletId: {
        userId: cashierUser.id,
        outletId: outlets["OUTLET-MAIN"].id,
      },
    },
    update: {},
    create: {
      userId: cashierUser.id,
      outletId: outlets["OUTLET-MAIN"].id,
      isDefault: true,
    },
  });

  // 7. Customers seed (dev reset)
  console.log("Resetting customers...");

  // Delete all existing customers
  await prisma.customer.deleteMany({});

  // Ensure the default Walk-in Customer (ID = 1) exists
  await prisma.customer.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Walk-in Customer",
      address: null,
      phone: null,
      remarks: "System default walk-in customer",
    },
  });

  // Create two more normal customers
  await prisma.customer.createMany({
    data: [
      {
        name: "Aung Aung",
        address: "Yangon",
        phone: "0912345678",
        remarks: "Regular customer",
      },
      {
        name: "Mya Mya",
        address: "Mandalay",
        phone: "0987654321",
        remarks: "Wholesale buyer",
      },
    ],
  });

  // 9. Seed Brands
  console.log("Resetting brands...");

  // Delete all existing brands (dev-friendly)
  await prisma.brand.deleteMany({});

  await prisma.brand.createMany({
    data: [
      {
        name: "GreenGrow",
        remarks: "Fertilizer and leafy crop specialists",
      },
      {
        name: "AgriProtect",
        remarks: "Pesticides and crop-protection chemicals",
      },
      {
        name: "SunHarvest",
        remarks: "Seeds and growth boosters",
      },
      {
        name: "BioPlus",
        remarks: "Organic and environment-friendly farm inputs",
      },
    ],
  });

  console.log("Brands seeded:", await prisma.brand.count());

  // 💥 Reset Products & Variants
  console.log("Resetting products & variants...");

  await prisma.productVariant.deleteMany({});
  await prisma.product.deleteMany({});

  // Get brands from earlier seed
  const greenGrow = await prisma.brand.findUnique({
    where: { name: "GreenGrow" },
  });
  const agriProtect = await prisma.brand.findUnique({
    where: { name: "AgriProtect" },
  });
  const sunHarvest = await prisma.brand.findUnique({
    where: { name: "SunHarvest" },
  });

  // Create products
  const urea = await prisma.product.create({
    data: {
      name: "Urea 46%",
      brandId: greenGrow?.id,
      remarks: "Nitrogen fertilizer",
    },
  });

  const npk = await prisma.product.create({
    data: {
      name: "NPK 15-15-15",
      brandId: sunHarvest?.id,
      remarks: "Balanced nutrient fertilizer",
    },
  });

  const maxGuard = await prisma.product.create({
    data: {
      name: "MaxGuard Insecticide",
      brandId: agriProtect?.id,
      remarks: "Broad-spectrum insecticide",
    },
  });

  // Variants
  await prisma.productVariant.createMany({
    data: [
      // Urea 46% variants
      {
        productId: urea.id,
        sku: "UREA-50KG",
        label: "50 kg bag",
        unit: "kg",
        sizeValue: 50,
        costPrice: "28000.00",
        sellPrice: "32000.00",
        openingStock: 20,
      },
      {
        productId: urea.id,
        sku: "UREA-25KG",
        label: "25 kg bag",
        unit: "kg",
        sizeValue: 25,
        costPrice: "15000.00",
        sellPrice: "18000.00",
        openingStock: 15,
      },

      // NPK variants
      {
        productId: npk.id,
        sku: "NPK15-25KG",
        label: "25 kg bag",
        unit: "kg",
        sizeValue: 25,
        costPrice: "26000.00",
        sellPrice: "30000.00",
        openingStock: 10,
      },
      {
        productId: npk.id,
        sku: "NPK15-5KG",
        label: "5 kg pack",
        unit: "kg",
        sizeValue: 5,
        costPrice: "6000.00",
        sellPrice: "7500.00",
        openingStock: 30,
      },

      // MaxGuard variants
      {
        productId: maxGuard.id,
        sku: "MAXGUARD-1L",
        label: "1 L bottle",
        unit: "L",
        sizeValue: 1,
        costPrice: "9000.00",
        sellPrice: "11000.00",
        openingStock: 25,
      },
      {
        productId: maxGuard.id,
        sku: "MAXGUARD-500ML",
        label: "500 ml bottle",
        unit: "ml",
        sizeValue: 500,
        costPrice: "5500.00",
        sellPrice: "7000.00",
        openingStock: 40,
      },
    ],
  });

  console.log("Products seeded:", await prisma.product.count());
  console.log("Variants seeded:", await prisma.productVariant.count());
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
