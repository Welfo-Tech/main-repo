import "dotenv/config";
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
      category: "ENDOSCOPE",
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

  const serviceCase = await prisma.serviceCase.upsert({
    where: { id: "00000000-0000-0000-0000-000000000010" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000010",
      caseNumber: "WFC-2026-0001",
      organizationId: org.id,
      productId: product.id,
      contactId: "00000000-0000-0000-0000-000000000002",
      status: "UNDER_ASSESSMENT",
      priority: "NORMAL",
      intakeCondition: "Blurry image, light guide connector damaged",
      createdBy: adminUser.id,
    },
  });

  const quote = await prisma.quote.upsert({
    where: { id: "00000000-0000-0000-0000-000000000020" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000020",
      quoteNumber: "QTE-2026-0001",
      version: 1,
      caseId: serviceCase.id,
      status: "APPROVED",
      subtotal: "25000.00",
      taxAmount: "4500.00",
      totalAmount: "29500.00",
      currency: "INR",
      validUntil: new Date("2026-09-30"),
      approvedByName: "Dr. Neha Sharma",
      approvedAt: new Date("2026-08-15"),
      approvalMethod: "EMAIL",
      createdBy: adminUser.id,
      lineItems: {
        create: [
          {
            id: "00000000-0000-0000-0000-000000000021",
            sortOrder: 1,
            itemType: "PART",
            description: "Light guide bundle replacement",
            quantity: "1.000",
            unitPrice: "18000.00",
            discountPct: "0.00",
            lineTotal: "18000.00",
            taxRate: "18.00",
            hsnCode: "90189099",
            gstType: "IGST",
          },
          {
            id: "00000000-0000-0000-0000-000000000022",
            sortOrder: 2,
            itemType: "LABOR",
            description: "Technician repair labor (4 hrs)",
            quantity: "4.000",
            unitPrice: "1750.00",
            discountPct: "0.00",
            lineTotal: "7000.00",
            taxRate: "18.00",
            hsnCode: null,
            gstType: "IGST",
          },
        ],
      },
    },
  });

  const invoice = await prisma.invoice.upsert({
    where: { id: "00000000-0000-0000-0000-000000000030" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000030",
      invoiceNumber: "INV-2026-0001",
      caseId: serviceCase.id,
      quoteId: quote.id,
      organizationId: org.id,
      status: "PARTIALLY_PAID",
      issueDate: new Date("2026-08-20"),
      dueDate: new Date("2026-09-19"),
      subtotal: "25000.00",
      taxAmount: "4500.00",
      totalAmount: "29500.00",
      paidAmount: "14750.00",
      currency: "INR",
      paymentTerms: "Net 30 from issue date",
      createdBy: adminUser.id,
      lineItems: {
        create: [
          {
            id: "00000000-0000-0000-0000-000000000031",
            sortOrder: 1,
            itemType: "PART",
            description: "Light guide bundle replacement",
            quantity: "1.000",
            unitPrice: "18000.00",
            discountPct: "0.00",
            lineTotal: "18000.00",
            taxRate: "18.00",
            hsnCode: "90189099",
            gstType: "IGST",
          },
          {
            id: "00000000-0000-0000-0000-000000000032",
            sortOrder: 2,
            itemType: "LABOR",
            description: "Technician repair labor (4 hrs)",
            quantity: "4.000",
            unitPrice: "1750.00",
            discountPct: "0.00",
            lineTotal: "7000.00",
            taxRate: "18.00",
            hsnCode: null,
            gstType: "IGST",
          },
        ],
      },
      payments: {
        create: [
          {
            id: "00000000-0000-0000-0000-000000000040",
            amount: "14750.00",
            paymentDate: new Date("2026-08-22"),
            method: "BANK_TRANSFER",
            referenceNumber: "NEFT2026082200019",
            notes: "50% advance payment",
            status: "VERIFIED",
            recordedBy: opsUser.id,
          },
        ],
      },
    },
  });

  console.log("Seed complete.");
  console.log(`Admin user: admin@welfo.local / welfo@admin123`);
  console.log(`Ops user:   ops@welfo.local  / welfo@ops123`);
  console.log(`Org: ${org.name} (${org.id})`);
  console.log(`Product: ${product.serialNumber}`);
  console.log(`Service case: ${serviceCase.caseNumber} (${serviceCase.id})`);
  console.log(`Quote: ${quote.quoteNumber} — APPROVED, ₹29,500`);
  console.log(`Invoice: ${invoice.invoiceNumber} — PARTIALLY_PAID, ₹14,750 of ₹29,500 paid`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
