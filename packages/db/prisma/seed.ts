import { prisma } from "../src/client.js";

const HASHES = {
  "welfo@admin123": "$2a$12$KeGJmRQB0pLBz8nk3x6jBuaNzZYoMvPqsWjwmsP8BKjBAmuG7dR/y",
  "welfo@ops123": "$2a$12$t/K5ATpColSFQZk5PG8kTeXO3abEmfROKgHK2f09tI.odNlHL/aHO",
};

async function main() {
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@welfo.local" },
    update: {},
    create: {
      email: "admin@welfo.local",
      name: "Admin User",
      passwordHash: HASHES["welfo@admin123"],
      role: "ADMIN",
      isActive: true,
    },
  });

  const opsUser = await prisma.user.upsert({
    where: { email: "ops@welfo.local" },
    update: {},
    create: {
      email: "ops@welfo.local",
      name: "Operations User",
      passwordHash: HASHES["welfo@ops123"],
      role: "OPERATIONS",
      isActive: true,
    },
  });

  const org = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Apollo Hospitals Delhi",
      type: "HOSPITAL",
      tier: "PREMIUM",
      gstNumber: "07AABCA1234B1Z5",
      paymentTermsDays: 30,
      isActive: true,
    },
  });

  await prisma.customerContact.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      organizationId: org.id,
      name: "Dr. Neha Sharma",
      designation: "Head of Biomedical Engineering",
      email: "neha.sharma@apollodelhi.in",
      phone: "+91-98765-43210",
      isPrimary: true,
      isActive: true,
    },
  });

  const productModel = await prisma.productModel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Olympus CF-HQ190L",
      category: "COLONOSCOPE",
      manufacturer: "Olympus",
      description: "High-definition colonoscope with NBI",
      isActive: true,
    },
  });

  const product = await prisma.product.upsert({
    where: { serialNumber: "WF-2024-00001" },
    update: {},
    create: {
      serialNumber: "WF-2024-00001",
      modelId: productModel.id,
      ownerOrgId: org.id,
      status: "IN_SERVICE",
      saleDate: new Date("2024-03-15"),
      warrantyExpiry: new Date("2026-03-15"),
    },
  });

  console.log("Seed complete.");
  console.log(`Admin user: admin@welfo.local / welfo@admin123`);
  console.log(`Ops user:   ops@welfo.local  / welfo@ops123`);
  console.log(`Org: ${org.name} (${org.id})`);
  console.log(`Product: ${product.serialNumber}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
