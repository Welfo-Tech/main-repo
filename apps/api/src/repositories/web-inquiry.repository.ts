import { type TicketUrgency, type WebInquiryStatus, prisma } from "@repo/db";

const inquirySelect = {
  id: true,
  inquiryNumber: true,
  submitterName: true,
  submitterEmail: true,
  submitterPhone: true,
  organizationName: true,
  city: true,
  serialNumber: true,
  productId: true,
  reportedProblem: true,
  urgency: true,
  status: true,
  convertedCaseId: true,
  submittedAt: true,
  updatedAt: true,
  product: {
    select: {
      id: true,
      serialNumber: true,
      status: true,
      ownerOrgId: true,
      model: { select: { id: true, name: true, category: true, manufacturer: true } },
      ownerOrg: { select: { id: true, name: true } },
    },
  },
} as const;

export interface CreateInquiryData {
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  organizationName: string;
  city?: string;
  serialNumber: string;
  productId: string;
  reportedProblem: string;
  urgency?: TicketUrgency;
}

export interface InquiryFilters {
  status?: WebInquiryStatus;
}

export async function findProductBySerial(serialNumber: string) {
  return prisma.product.findUnique({
    where: { serialNumber },
    select: {
      id: true,
      serialNumber: true,
      status: true,
      ownerOrgId: true,
      model: { select: { id: true, name: true, category: true, manufacturer: true } },
    },
  });
}

export async function createInquiry(data: CreateInquiryData) {
  const [{ inquiry_number }] = await prisma.$queryRaw<[{ inquiry_number: string }]>`
    SELECT generate_inquiry_number() AS inquiry_number
  `;

  return prisma.webInquiry.create({
    data: {
      inquiryNumber: inquiry_number,
      submitterName: data.submitterName,
      submitterEmail: data.submitterEmail,
      submitterPhone: data.submitterPhone,
      organizationName: data.organizationName,
      city: data.city,
      serialNumber: data.serialNumber,
      productId: data.productId,
      reportedProblem: data.reportedProblem,
      urgency: data.urgency ?? "NORMAL",
    },
    select: inquirySelect,
  });
}

export async function findInquiries(filters: InquiryFilters) {
  return prisma.webInquiry.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
    },
    select: inquirySelect,
    orderBy: [{ status: "asc" }, { submittedAt: "desc" }],
  });
}

export async function findInquiryById(id: string) {
  return prisma.webInquiry.findUnique({ where: { id }, select: inquirySelect });
}

export async function updateInquiryStatus(id: string, status: WebInquiryStatus) {
  return prisma.webInquiry.update({ where: { id }, data: { status }, select: inquirySelect });
}

export interface ConvertInquiryData {
  inquiryId: string;
  organizationId: string;
  contactId?: string;
  newContact?: { name: string; email?: string; phone?: string };
  priority?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
  intakeCondition?: string;
  createdBy: string;
}

export async function convertInquiry(data: ConvertInquiryData) {
  const inquiry = await prisma.webInquiry.findUniqueOrThrow({
    where: { id: data.inquiryId },
    select: { id: true, productId: true, reportedProblem: true, urgency: true },
  });

  return prisma.$transaction(async (tx) => {
    let contactId = data.contactId;

    if (!contactId && data.newContact) {
      const contact = await tx.customerContact.create({
        data: {
          organizationId: data.organizationId,
          name: data.newContact.name,
          email: data.newContact.email,
          phone: data.newContact.phone,
        },
        select: { id: true },
      });
      contactId = contact.id;
    }

    const [{ ticket_number }] = await tx.$queryRaw<[{ ticket_number: string }]>`
      SELECT generate_ticket_number() AS ticket_number
    `;

    const ticket = await tx.ticket.create({
      data: {
        ticketNumber: ticket_number,
        organizationId: data.organizationId,
        contactId,
        productId: inquiry.productId,
        reportedProblem: inquiry.reportedProblem,
        urgency: inquiry.urgency,
        status: "CONVERTED",
        createdBy: data.createdBy,
      },
      select: { id: true, ticketNumber: true, status: true },
    });

    const [{ case_number }] = await tx.$queryRaw<[{ case_number: string }]>`
      SELECT generate_case_number() AS case_number
    `;

    const serviceCase = await tx.serviceCase.create({
      data: {
        caseNumber: case_number,
        organizationId: data.organizationId,
        productId: inquiry.productId,
        contactId,
        ticketId: ticket.id,
        priority: data.priority ?? "NORMAL",
        intakeCondition: data.intakeCondition,
        createdBy: data.createdBy,
      },
      select: { id: true, caseNumber: true, status: true, priority: true },
    });

    await tx.webInquiry.update({
      where: { id: data.inquiryId },
      data: { status: "CONVERTED", convertedCaseId: serviceCase.id },
    });

    return { ticket, serviceCase };
  });
}
