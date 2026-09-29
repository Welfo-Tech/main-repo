import { type TicketUrgency, type WebInquiryStatus, prisma } from "@repo/db";

const inquirySelect = {
  id: true,
  inquiryNumber: true,
  submitterName: true,
  submitterEmail: true,
  submitterPhone: true,
  organizationName: true,
  city: true,
  productModel: true,
  serialNumber: true,
  purchaseDate: true,
  reportedProblem: true,
  urgency: true,
  status: true,
  submittedAt: true,
  updatedAt: true,
} as const;

export interface CreateInquiryData {
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  organizationName: string;
  city?: string;
  productModel: string;
  serialNumber?: string;
  purchaseDate?: Date;
  reportedProblem: string;
  urgency?: TicketUrgency;
}

export interface InquiryFilters {
  status?: WebInquiryStatus;
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
      productModel: data.productModel,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
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
