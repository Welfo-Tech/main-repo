import { type WebInquiryStatus } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import type { AuthUser } from "../middleware/auth.js";
import { findOrganizationById } from "../repositories/organization.repository.js";
import {
  type InquiryFilters,
  convertInquiry,
  createInquiry,
  findInquiries,
  findInquiryById,
  findProductBySerial,
  updateInquiryStatus,
} from "../repositories/web-inquiry.repository.js";

const TERMINAL_STATUSES = new Set<WebInquiryStatus>(["CONVERTED", "CLOSED"]);

async function requireInquiry(id: string) {
  const inquiry = await findInquiryById(id);
  if (!inquiry) throw new NotFoundError("inquiry not found");
  return inquiry;
}

export async function verifySerial(serialNumber: string) {
  const product = await findProductBySerial(serialNumber.trim());
  if (!product) return { valid: false as const };

  return {
    valid: true as const,
    productModel: product.model?.name ?? "Unregistered model",
    manufacturer: product.model?.manufacturer ?? null,
    status: product.status,
  };
}

export async function submitInquiry(data: {
  submitterName: string;
  submitterEmail: string;
  submitterPhone?: string;
  organizationName: string;
  city?: string;
  serialNumber: string;
  reportedProblem: string;
  urgency?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
}) {
  const product = await findProductBySerial(data.serialNumber.trim());
  if (!product) {
    throw new ValidationError("serial number not found in our records");
  }

  return createInquiry({
    submitterName: data.submitterName,
    submitterEmail: data.submitterEmail,
    submitterPhone: data.submitterPhone,
    organizationName: data.organizationName,
    city: data.city,
    serialNumber: product.serialNumber,
    productId: product.id,
    reportedProblem: data.reportedProblem,
    urgency: data.urgency,
  });
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

export async function convertToServiceCase(
  id: string,
  data: {
    organizationId?: string;
    contactId?: string;
    createContactFromSubmitter?: boolean;
    priority?: "LOW" | "NORMAL" | "HIGH" | "CRITICAL";
    intakeCondition?: string;
  },
  actor: AuthUser,
) {
  const inquiry = await requireInquiry(id);

  if (inquiry.status === "CONVERTED") {
    throw new ValidationError("inquiry has already been converted");
  }
  if (inquiry.status === "CLOSED") {
    throw new ValidationError("inquiry is CLOSED and cannot be converted");
  }

  const organizationId = data.organizationId ?? inquiry.product.ownerOrgId;
  if (!organizationId) {
    throw new ValidationError(
      "this product has no owner organization on record — pick one to convert",
    );
  }

  const org = await findOrganizationById(organizationId);
  if (!org) throw new NotFoundError("organization not found");

  const result = await convertInquiry({
    inquiryId: id,
    organizationId,
    contactId: data.contactId,
    newContact:
      !data.contactId && data.createContactFromSubmitter
        ? {
            name: inquiry.submitterName,
            email: inquiry.submitterEmail,
            phone: inquiry.submitterPhone ?? undefined,
          }
        : undefined,
    priority: data.priority,
    intakeCondition: data.intakeCondition,
    createdBy: actor.id,
  });

  return { inquiry: await requireInquiry(id), ...result };
}
