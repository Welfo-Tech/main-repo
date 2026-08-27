import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import {
  DispatchDirection,
  DispatchStatus,
  PrismaClient,
  RepairEventType,
  ServiceCaseStatus,
  UserRole,
} from "../generated/prisma/client.js";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const ADMIN_USER_ID = "f01869b5-2cd4-4fef-8741-22ab74d256ac";
const APOLLO_ORG_ID = "00000000-0000-0000-0000-000000000001";

const TECH_USER_1_ID = "00000000-0000-0000-0000-000000000020";
const TECH_USER_2_ID = "00000000-0000-0000-0000-000000000021";
const TECH_1_ID = "00000000-0000-0000-0000-000000000030";
const TECH_2_ID = "00000000-0000-0000-0000-000000000031";
const SEED_PRODUCT_ID = "00000000-0000-0000-0000-000000000050";
const SEED_CASE_ID = "00000000-0000-0000-0000-000000000060";
const SEED_ASSIGNMENT_ID = "00000000-0000-0000-0000-000000000070";
const SEED_REPAIR_EVENT_1_ID = "00000000-0000-0000-0000-000000000080";
const SEED_REPAIR_EVENT_2_ID = "00000000-0000-0000-0000-000000000081";
const SEED_DISPATCH_ID = "00000000-0000-0000-0000-000000000090";

async function main() {
  await prisma.user.upsert({
    where: { id: TECH_USER_1_ID },
    create: {
      id: TECH_USER_1_ID,
      name: "Ravi Sharma",
      email: "ravi.sharma@welfo.local",
      passwordHash: "$2b$10$placeholder.hash.for.seed.data.only",
      role: UserRole.TECHNICIAN,
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { id: TECH_USER_2_ID },
    create: {
      id: TECH_USER_2_ID,
      name: "Priya Nair",
      email: "priya.nair@welfo.local",
      passwordHash: "$2b$10$placeholder.hash.for.seed.data.only",
      role: UserRole.TECHNICIAN,
    },
    update: {},
  });

  await prisma.technician.upsert({
    where: { id: TECH_1_ID },
    create: {
      id: TECH_1_ID,
      userId: TECH_USER_1_ID,
      employeeId: "EMP-001",
      phone: "+91-9876543210",
      specializations: ["fiber-optic-repair", "endoscope-cleaning", "light-source-service"],
      isActive: true,
    },
    update: {},
  });

  await prisma.technician.upsert({
    where: { id: TECH_2_ID },
    create: {
      id: TECH_2_ID,
      userId: TECH_USER_2_ID,
      employeeId: "EMP-002",
      phone: "+91-9123456789",
      specializations: ["rigid-endoscopy", "camera-head-repair"],
      isActive: true,
    },
    update: {},
  });

  const existingProduct = await prisma.product.findFirst({
    where: { ownerOrgId: APOLLO_ORG_ID },
  });

  const productId = existingProduct?.id ?? SEED_PRODUCT_ID;

  if (!existingProduct) {
    const model = await prisma.productModel.findFirst();
    if (model) {
      await prisma.product.upsert({
        where: { id: SEED_PRODUCT_ID },
        create: {
          id: SEED_PRODUCT_ID,
          serialNumber: "WF-SEED-0001",
          modelId: model.id,
          ownerOrgId: APOLLO_ORG_ID,
        },
        update: {},
      });
    }
  }

  await prisma.serviceCase.upsert({
    where: { id: SEED_CASE_ID },
    create: {
      id: SEED_CASE_ID,
      caseNumber: "WFC-2026-0099",
      status: ServiceCaseStatus.IN_REPAIR,
      organizationId: APOLLO_ORG_ID,
      productId,
      assignedTechnicianId: TECH_1_ID,
      createdBy: ADMIN_USER_ID,
    },
    update: {},
  });

  await prisma.technicianAssignment.upsert({
    where: { id: SEED_ASSIGNMENT_ID },
    create: {
      id: SEED_ASSIGNMENT_ID,
      caseId: SEED_CASE_ID,
      technicianId: TECH_1_ID,
      assignedBy: ADMIN_USER_ID,
      reason: "Primary technician for fiber-optic cases",
    },
    update: {},
  });

  await prisma.repairEvent.upsert({
    where: { id: SEED_REPAIR_EVENT_1_ID },
    create: {
      id: SEED_REPAIR_EVENT_1_ID,
      caseId: SEED_CASE_ID,
      technicianId: TECH_1_ID,
      eventType: RepairEventType.OBSERVATION,
      description: "Scope shows significant light leakage from fiber bundle near insertion tube joint. Bundle shows approximately 40% fiber breakage.",
      eventAt: new Date("2026-08-20T10:00:00Z"),
    },
    update: {},
  });

  await prisma.repairEvent.upsert({
    where: { id: SEED_REPAIR_EVENT_2_ID },
    create: {
      id: SEED_REPAIR_EVENT_2_ID,
      caseId: SEED_CASE_ID,
      technicianId: TECH_1_ID,
      eventType: RepairEventType.PART_REPLACED,
      description: "Replaced fiber bundle assembly (P/N WF-FB-0042). Light transmission restored to 95% of rated output. Sealed insertion tube junction with medical-grade adhesive.",
      eventAt: new Date("2026-08-22T14:30:00Z"),
    },
    update: {},
  });

  await prisma.dispatchRecord.upsert({
    where: { id: SEED_DISPATCH_ID },
    create: {
      id: SEED_DISPATCH_ID,
      caseId: SEED_CASE_ID,
      direction: DispatchDirection.INBOUND,
      courierName: "DTDC Courier",
      trackingNumber: "DTDC9876543210",
      status: DispatchStatus.DELIVERED,
      dispatchDate: new Date("2026-08-15"),
      expectedDelivery: new Date("2026-08-17"),
      actualDelivery: new Date("2026-08-17"),
      fromAddress: {
        name: "Apollo Hospitals Delhi",
        addressLine1: "Mathura Road, Sarita Vihar",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110076",
      },
      toAddress: {
        name: "Welfo Fiber Optics",
        addressLine1: "Industrial Estate, Phase 2",
        city: "Rishikesh",
        state: "Uttarakhand",
        pincode: "249201",
      },
      conditionNotes: "Scope received with protective foam padding. No visible external damage to shipping box.",
    },
    update: {},
  });

  console.info("Seed complete: technicians, repair events, dispatch record");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
