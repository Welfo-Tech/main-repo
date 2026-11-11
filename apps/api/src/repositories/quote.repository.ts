import { QuoteStatus, prisma } from "@repo/db";

const lineItemSelect = {
  id: true,
  sortOrder: true,
  itemType: true,
  partId: true,
  description: true,
  quantity: true,
  unitPrice: true,
  discountPct: true,
  lineTotal: true,
  taxRate: true,
  hsnCode: true,
  gstType: true,
} as const;

const quoteSelect = {
  id: true,
  quoteNumber: true,
  version: true,
  caseId: true,
  status: true,
  subtotal: true,
  taxAmount: true,
  totalAmount: true,
  currency: true,
  validUntil: true,
  terms: true,
  approvedByName: true,
  approvedAt: true,
  approvalMethod: true,
  rejectionReason: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  case: { select: { id: true, caseNumber: true, organization: { select: { id: true, name: true } } } },
  lineItems: { select: lineItemSelect, orderBy: { sortOrder: "asc" as const } },
} as const;

export interface QuoteFilters {
  caseId?: string;
  status?: QuoteStatus;
}

export async function findQuotes(filters: QuoteFilters) {
  return prisma.quote.findMany({
    where: {
      ...(filters.caseId ? { caseId: filters.caseId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    select: quoteSelect,
    orderBy: [{ caseId: "asc" }, { version: "desc" }],
  });
}

export async function findQuoteById(id: string) {
  return prisma.quote.findUnique({ where: { id }, select: quoteSelect });
}

export async function findLatestVersionForCase(caseId: string) {
  return prisma.quote.findFirst({
    where: { caseId },
    orderBy: { version: "desc" },
    select: { version: true, id: true, status: true },
  });
}

export interface LineItemInput {
  sortOrder?: number;
  itemType: "PART" | "LABOR" | "SHIPPING" | "OTHER";
  partId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct?: number;
  taxRate?: number;
  hsnCode?: string;
  gstType?: "CGST_SGST" | "IGST" | "EXEMPT";
}

function round2(n: number): string {
  return n.toFixed(2);
}

function computeLineTotal(item: LineItemInput): number {
  const disc = item.discountPct ?? 0;
  return item.quantity * item.unitPrice * (1 - disc / 100);
}

function computeTotals(items: LineItemInput[]): {
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
} {
  let subtotal = 0;
  let taxAmount = 0;
  for (const item of items) {
    const lt = computeLineTotal(item);
    subtotal += lt;
    taxAmount += lt * ((item.taxRate ?? 18) / 100);
  }
  return {
    subtotal: round2(subtotal),
    taxAmount: round2(taxAmount),
    totalAmount: round2(subtotal + taxAmount),
  };
}

export interface CreateQuoteData {
  caseId: string;
  validUntil?: Date;
  terms?: string;
  lineItems: LineItemInput[];
  createdBy: string;
}

export async function createQuote(data: CreateQuoteData) {
  const [{ quote_number }] = await prisma.$queryRaw<[{ quote_number: string }]>`
    SELECT generate_quote_number() AS quote_number
  `;

  const existing = await findLatestVersionForCase(data.caseId);
  const nextVersion = existing ? existing.version + 1 : 1;
  const totals = computeTotals(data.lineItems);

  return prisma.$transaction(async (tx) => {
    if (existing && existing.status !== QuoteStatus.REJECTED && existing.status !== QuoteStatus.EXPIRED) {
      await tx.quote.update({
        where: { id: existing.id },
        data: { status: QuoteStatus.SUPERSEDED },
      });
    }

    return tx.quote.create({
      data: {
        quoteNumber: quote_number,
        version: nextVersion,
        caseId: data.caseId,
        status: QuoteStatus.DRAFT,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        totalAmount: totals.totalAmount,
        validUntil: data.validUntil,
        terms: data.terms,
        createdBy: data.createdBy,
        lineItems: {
          create: data.lineItems.map((item, idx) => ({
            sortOrder: item.sortOrder ?? idx,
            itemType: item.itemType,
            partId: item.partId,
            description: item.description,
            quantity: round2(item.quantity),
            unitPrice: round2(item.unitPrice),
            discountPct: round2(item.discountPct ?? 0),
            lineTotal: round2(computeLineTotal(item)),
            taxRate: round2(item.taxRate ?? 18),
            hsnCode: item.hsnCode,
            gstType: item.gstType ?? "CGST_SGST",
          })),
        },
      },
      select: quoteSelect,
    });
  });
}

export interface UpdateQuoteData {
  status?: QuoteStatus;
  validUntil?: Date | null;
  terms?: string | null;
  approvedByName?: string;
  approvedAt?: Date;
  approvalMethod?: "EMAIL" | "PHONE" | "PORTAL" | "IN_PERSON";
  rejectionReason?: string;
}

export async function updateQuote(id: string, data: UpdateQuoteData) {
  return prisma.quote.update({ where: { id }, data, select: quoteSelect });
}

export async function addLineItem(quoteId: string, item: LineItemInput) {
  const lt = computeLineTotal(item);
  const tax = lt * ((item.taxRate ?? 18) / 100);
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    select: { subtotal: true, taxAmount: true, lineItems: { select: { sortOrder: true } } },
  });
  const maxOrder = quote.lineItems.reduce((m, li) => Math.max(m, li.sortOrder), -1);
  const newSubtotal = Number(quote.subtotal) + lt;
  const newTax = Number(quote.taxAmount) + tax;

  return prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quoteId },
      data: { subtotal: round2(newSubtotal), taxAmount: round2(newTax), totalAmount: round2(newSubtotal + newTax) },
    });
    return tx.quoteLineItem.create({
      data: {
        quoteId,
        sortOrder: item.sortOrder ?? maxOrder + 1,
        itemType: item.itemType,
        partId: item.partId,
        description: item.description,
        quantity: round2(item.quantity),
        unitPrice: round2(item.unitPrice),
        discountPct: round2(item.discountPct ?? 0),
        lineTotal: round2(lt),
        taxRate: round2(item.taxRate ?? 18),
        hsnCode: item.hsnCode,
        gstType: item.gstType ?? "CGST_SGST",
      },
      select: lineItemSelect,
    });
  });
}

export async function removeLineItem(quoteId: string, itemId: string) {
  const item = await prisma.quoteLineItem.findFirstOrThrow({
    where: { id: itemId, quoteId },
    select: { lineTotal: true, taxRate: true },
  });
  const lt = Number(item.lineTotal);
  const tax = lt * (Number(item.taxRate) / 100);
  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    select: { subtotal: true, taxAmount: true },
  });
  const newSubtotal = Number(quote.subtotal) - lt;
  const newTax = Number(quote.taxAmount) - tax;

  return prisma.$transaction(async (tx) => {
    await tx.quoteLineItem.delete({ where: { id: itemId } });
    await tx.quote.update({
      where: { id: quoteId },
      data: { subtotal: round2(newSubtotal), taxAmount: round2(newTax), totalAmount: round2(newSubtotal + newTax) },
    });
  });
}
