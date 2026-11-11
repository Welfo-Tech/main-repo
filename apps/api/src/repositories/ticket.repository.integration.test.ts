import {
  OrganizationType,
  ProductCategory,
  TicketUrgency,
  UserRole,
  prisma,
} from "@repo/db";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createTicket,
  findTicketById,
  findTickets,
  updateTicket,
} from "./ticket.repository.js";

const seeded = {
  userId: "",
  orgId: "",
  modelId: "",
  productId: "",
  ticketId: "",
};

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      email: `ticket-repo-int-${Date.now()}@welfo.test`,
      name: "Ticket Repo Integration",
      passwordHash: "x",
      role: UserRole.OPERATIONS,
    },
  });
  const org = await prisma.organization.create({
    data: { name: "Ticket Repo Int Org", type: OrganizationType.HOSPITAL },
  });
  const model = await prisma.productModel.create({
    data: { name: "Ticket Repo Int Model", category: ProductCategory.ENDOSCOPE },
  });
  const product = await prisma.product.create({
    data: {
      serialNumber: `TKT-REPO-INT-${Date.now()}`,
      modelId: model.id,
      ownerOrgId: org.id,
    },
  });
  seeded.userId = user.id;
  seeded.orgId = org.id;
  seeded.modelId = model.id;
  seeded.productId = product.id;
});

afterAll(async () => {
  if (seeded.ticketId)
    await prisma.ticket.deleteMany({ where: { id: seeded.ticketId } });
  if (seeded.productId)
    await prisma.product.deleteMany({ where: { id: seeded.productId } });
  if (seeded.modelId)
    await prisma.productModel.deleteMany({ where: { id: seeded.modelId } });
  if (seeded.orgId)
    await prisma.organization.deleteMany({ where: { id: seeded.orgId } });
  if (seeded.userId)
    await prisma.user.deleteMany({ where: { id: seeded.userId } });
  await prisma.$disconnect();
});

describe("ticket repository against a real schema", () => {
  it("creates a ticket and reads its product back through the select", async () => {
    const ticket = await createTicket({
      organizationId: seeded.orgId,
      productId: seeded.productId,
      reportedProblem: "scope image flickers",
      urgency: TicketUrgency.HIGH,
      createdBy: seeded.userId,
    });
    seeded.ticketId = ticket.id;

    expect(ticket.ticketNumber).toMatch(/^TKT-\d{4}-\d{4}$/);
    expect(ticket.product?.id).toBe(seeded.productId);
    expect(ticket.product?.serialNumber).toContain("TKT-REPO-INT-");
    expect(ticket.product?.model?.name).toBe("Ticket Repo Int Model");
  });

  it("returns the product when listing tickets", async () => {
    const tickets = await findTickets({ orgId: seeded.orgId });
    const found = tickets.find((t) => t.id === seeded.ticketId);
    expect(found).toBeDefined();
    expect(found?.product?.id).toBe(seeded.productId);
  });

  it("returns the product when fetching one ticket", async () => {
    const ticket = await findTicketById(seeded.ticketId);
    expect(ticket?.product?.id).toBe(seeded.productId);
  });

  it("detaches the product when it is set to null", async () => {
    const updated = await updateTicket(seeded.ticketId, { productId: null });
    expect(updated.product).toBeNull();
  });
});
