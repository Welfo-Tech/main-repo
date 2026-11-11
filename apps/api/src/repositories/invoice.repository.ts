import { InvoiceStatus, PaymentStatus, prisma } from "@repo/db";

const paymentSelect = {
  id: true,
  invoiceId: true,
  amount: true,
  paymentDate: true,
  method: true,
  referenceNumber: true,
  notes: true,
  status: true,
  recordedBy: true,
  verifiedBy: true,
  verifiedAt: true,
  createdAt: true,
} as const;

const invoiceSelect = {
  id: true,
  invoiceNumber: true,
  caseId: true,
  quoteId: true,
  organizationId: true,
  status: true,
  issueDate: true,
  dueDate: true,
  subtotal: true,
  taxAmount: true,
  totalAmount: true,
  paidAmount: true,
  currency: true,
  paymentTerms: true,
  cancellationReason: true,
  cancelledAt: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  case: { select: { id: true, caseNumber: true } },
  organization: { select: { id: true, name: true } },
  lineItems: {
    select: {
      id: true,
      sortOrder: true,
      itemType: true,
      description: true,
      quantity: true,
      unitPrice: true,
      discountPct: true,
      lineTotal: true,
      taxRate: true,
      hsnCode: true,
      gstType: true,
    },
    orderBy: { sortOrder: "asc" as const },
  },
  payments: { select: paymentSelect, orderBy: { paymentDate: "desc" as const } },
} as const;

export interface InvoiceFilters {
  status?: InvoiceStatus;
  orgId?: string;
}

export async function findInvoices(filters: InvoiceFilters) {
  return prisma.invoice.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.orgId ? { organizationId: filters.orgId } : {}),
    },
    select: invoiceSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function findInvoiceById(id: string) {
  return prisma.invoice.findUnique({ where: { id }, select: invoiceSelect });
}

export interface CreateInvoiceData {
  caseId: string;
  organizationId: string;
  quoteId?: string;
  issueDate?: Date;
  dueDate?: Date;
  paymentTerms?: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  lineItems: Array<{
    sortOrder?: number;
    itemType: "PART" | "LABOR" | "SHIPPING" | "OTHER";
    description: string;
    quantity: string;
    unitPrice: string;
    discountPct?: string;
    lineTotal: string;
    taxRate?: string;
    hsnCode?: string;
    gstType?: "CGST_SGST" | "IGST" | "EXEMPT";
  }>;
  createdBy: string;
}

export async function createInvoice(data: CreateInvoiceData) {
  const [{ invoice_number }] = await prisma.$queryRaw<[{ invoice_number: string }]>`
    SELECT generate_invoice_number() AS invoice_number
  `;

  return prisma.invoice.create({
    data: {
      invoiceNumber: invoice_number,
      caseId: data.caseId,
      organizationId: data.organizationId,
      quoteId: data.quoteId,
      status: InvoiceStatus.DRAFT,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      paymentTerms: data.paymentTerms,
      subtotal: data.subtotal,
      taxAmount: data.taxAmount,
      totalAmount: data.totalAmount,
      paidAmount: "0.00",
      createdBy: data.createdBy,
      lineItems: {
        create: data.lineItems.map((li, idx) => ({
          sortOrder: li.sortOrder ?? idx,
          itemType: li.itemType,
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          discountPct: li.discountPct ?? "0.00",
          lineTotal: li.lineTotal,
          taxRate: li.taxRate ?? "18.00",
          hsnCode: li.hsnCode,
          gstType: li.gstType ?? "CGST_SGST",
        })),
      },
    },
    select: invoiceSelect,
  });
}

export interface UpdateInvoiceData {
  status?: InvoiceStatus;
  issueDate?: Date | null;
  dueDate?: Date | null;
  paymentTerms?: string | null;
  cancellationReason?: string;
  cancelledAt?: Date;
}

export async function updateInvoice(id: string, data: UpdateInvoiceData) {
  return prisma.invoice.update({ where: { id }, data, select: invoiceSelect });
}

export interface CreatePaymentData {
  invoiceId: string;
  amount: number;
  paymentDate: Date;
  method: "BANK_TRANSFER" | "CHEQUE" | "CASH" | "UPI" | "CARD";
  referenceNumber?: string;
  notes?: string;
  recordedBy: string;
}

export async function recordPayment(data: CreatePaymentData) {
  const invoice = await prisma.invoice.findUniqueOrThrow({
    where: { id: data.invoiceId },
    select: { totalAmount: true, paidAmount: true, status: true },
  });

  const newPaid = Number(invoice.paidAmount) + data.amount;
  const total = Number(invoice.totalAmount);

  let newStatus: InvoiceStatus = invoice.status as InvoiceStatus;
  if (newPaid >= total) {
    newStatus = InvoiceStatus.PAID;
  } else if (newPaid > 0) {
    newStatus = InvoiceStatus.PARTIALLY_PAID;
  }

  return prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: data.invoiceId },
      data: { paidAmount: newPaid.toFixed(2), status: newStatus },
    });
    return tx.payment.create({
      data: {
        invoiceId: data.invoiceId,
        amount: data.amount.toFixed(2),
        paymentDate: data.paymentDate,
        method: data.method,
        referenceNumber: data.referenceNumber,
        notes: data.notes,
        status: PaymentStatus.RECORDED,
        recordedBy: data.recordedBy,
      },
      select: paymentSelect,
    });
  });
}

export async function findPaymentsByInvoice(invoiceId: string) {
  return prisma.payment.findMany({
    where: { invoiceId },
    select: paymentSelect,
    orderBy: { paymentDate: "desc" },
  });
}

export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  verifiedBy?: string,
) {
  return prisma.payment.update({
    where: { id },
    data: {
      status,
      ...(verifiedBy ? { verifiedBy, verifiedAt: new Date() } : {}),
    },
    select: paymentSelect,
  });
}
