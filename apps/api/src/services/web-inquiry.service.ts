import { type WebInquiryStatus } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import {
  type CreateInquiryData,
  type InquiryFilters,
  createInquiry,
  findInquiries,
  findInquiryById,
  updateInquiryStatus,
} from "../repositories/web-inquiry.repository.js";

const TERMINAL_STATUSES = new Set<WebInquiryStatus>(["CONVERTED", "CLOSED"]);

async function requireInquiry(id: string) {
  const inquiry = await findInquiryById(id);
  if (!inquiry) throw new NotFoundError("inquiry not found");
  return inquiry;
}

export async function submitInquiry(data: CreateInquiryData) {
  return createInquiry(data);
}

export async function listInquiries(filters: InquiryFilters, _actor: AuthUser) {
  return findInquiries(filters);
}

export async function getInquiry(id: string, _actor: AuthUser) {
  return requireInquiry(id);
}

export async function updateInquiry(
  id: string,
  status: WebInquiryStatus,
  _actor: AuthUser,
) {
  const inquiry = await requireInquiry(id);
  if (TERMINAL_STATUSES.has(inquiry.status)) {
    throw new ValidationError(`inquiry is ${inquiry.status} and cannot be updated`);
  }
  return updateInquiryStatus(id, status);
}
