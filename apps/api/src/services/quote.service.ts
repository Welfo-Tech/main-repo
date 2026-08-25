import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findCaseById } from "../repositories/service-case.repository.js";
import {
  type CreateQuoteData,
  type LineItemInput,
  type QuoteFilters,
  type UpdateQuoteData,
  addLineItem,
  createQuote,
  findQuoteById,
  findQuotes,
  removeLineItem,
  updateQuote,
} from "../repositories/quote.repository.js";

const MUTABLE_STATUSES = ["DRAFT", "UNDER_REVIEW"] as const;

async function requireCase(caseId: string) {
  const sc = await findCaseById(caseId);
  if (!sc) throw new NotFoundError("service case not found");
  return sc;
}

async function requireQuote(id: string) {
  const q = await findQuoteById(id);
  if (!q) throw new NotFoundError("quote not found");
  return q;
}

function assertEditable(status: string) {
  if (!MUTABLE_STATUSES.includes(status as (typeof MUTABLE_STATUSES)[number])) {
    throw new ValidationError(`quote is ${status} and cannot be edited`);
  }
}

export async function listQuotes(filters: QuoteFilters, _actor: AuthUser) {
  return findQuotes(filters);
}

export async function getQuote(id: string, _actor: AuthUser) {
  return requireQuote(id);
}

export async function openQuote(
  data: Omit<CreateQuoteData, "createdBy">,
  actor: AuthUser,
) {
  await requireCase(data.caseId);
  return createQuote({ ...data, createdBy: actor.id });
}

export async function editQuote(
  id: string,
  data: UpdateQuoteData,
  _actor: AuthUser,
) {
  const q = await requireQuote(id);
  if (data.status === undefined) {
    assertEditable(q.status);
  }
  return updateQuote(id, data);
}

export async function addItem(id: string, item: LineItemInput, _actor: AuthUser) {
  const q = await requireQuote(id);
  assertEditable(q.status);
  return addLineItem(id, item);
}

export async function removeItem(id: string, itemId: string, _actor: AuthUser) {
  const q = await requireQuote(id);
  assertEditable(q.status);
  return removeLineItem(id, itemId);
}
