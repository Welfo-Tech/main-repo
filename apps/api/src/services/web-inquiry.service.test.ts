import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as storage from "../lib/storage.js";
import * as orgRepo from "../repositories/organization.repository.js";
import * as repo from "../repositories/web-inquiry.repository.js";
import {
  convertToServiceCase,
  getInquiry,
  listInquiries,
  submitInquiry,
  updateInquiry,
  verifySerial,
} from "./web-inquiry.service.js";

vi.mock("../repositories/web-inquiry.repository.js");
vi.mock("../repositories/organization.repository.js");
vi.mock("../lib/storage.js");

const actor = { id: "user-1", role: UserRole.OPERATIONS };

const mockProduct = {
  id: "prod-1",
  serialNumber: "WF-2024-00001",
  status: "IN_SERVICE" as const,
  ownerOrgId: "org-1",
  model: { id: "pm-1", name: "Olympus CF-HQ190L", category: "ENDOSCOPE" as const, manufacturer: "Olympus" },
};

const mockInquiry = {
  id: "inq-1",
  inquiryNumber: "WFI-2026-0001",
  submitterName: "Dr. Anand Mehta",
  submitterEmail: "anand@apollodelhi.com",
  submitterPhone: "+91-9876543210",
  organizationName: "Apollo Hospitals Delhi",
  city: "Delhi",
  serialNumber: "WF-2024-00001",
  productId: "prod-1",
  reportedProblem: "Image dark on one side and fogging after autoclave.",
  urgency: "HIGH" as const,
  status: "PENDING" as const,
  photoPaths: [],
  convertedCaseId: null,
  submittedAt: new Date("2026-09-30"),
  updatedAt: new Date("2026-09-30"),
  product: { ...mockProduct, ownerOrg: { id: "org-1", name: "Apollo Hospitals Delhi" } },
};

const mockOrg = { id: "org-1", name: "Apollo Hospitals Delhi" };

beforeEach(() => vi.clearAllMocks());

describe("verifySerial", () => {
  it("returns valid with model name for a known serial", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    const result = await verifySerial("WF-2024-00001");
    expect(result.valid).toBe(true);
    expect(result).toMatchObject({ productModel: "Olympus CF-HQ190L" });
  });

  it("does not leak the owner organization", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    const result = await verifySerial("WF-2024-00001");
    expect(JSON.stringify(result)).not.toContain("Apollo");
  });

  it("returns invalid for an unknown serial", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(null);
    const result = await verifySerial("NOPE");
    expect(result.valid).toBe(false);
  });

  it("trims whitespace before lookup", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    await verifySerial("  WF-2024-00001  ");
    expect(repo.findProductBySerial).toHaveBeenCalledWith("WF-2024-00001");
  });
});

describe("submitInquiry", () => {
  const input = {
    submitterName: "Dr. Anand Mehta",
    submitterEmail: "anand@apollodelhi.com",
    organizationName: "Apollo Hospitals Delhi",
    serialNumber: "WF-2024-00001",
    reportedProblem: "Image dark on one side after autoclave cycle.",
  };

  it("creates the inquiry against the resolved product", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    vi.mocked(repo.createInquiry).mockResolvedValue(mockInquiry);

    const result = await submitInquiry(input);

    expect(repo.createInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ productId: "prod-1", serialNumber: "WF-2024-00001" }),
    );
    expect(result.inquiryNumber).toBe("WFI-2026-0001");
  });

  it("rejects an unknown serial number", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(null);
    await expect(submitInquiry(input)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.createInquiry).not.toHaveBeenCalled();
  });

  it("returns no uploads and records no paths when no photos are declared", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    vi.mocked(repo.createInquiry).mockResolvedValue(mockInquiry);

    const result = await submitInquiry(input);

    expect(result.uploads).toEqual([]);
    expect(repo.setInquiryPhotoPaths).not.toHaveBeenCalled();
  });

  it("records photo paths on the inquiry when uploads are issued", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    vi.mocked(repo.createInquiry).mockResolvedValue(mockInquiry);
    vi.mocked(storage.createUploadTargets).mockResolvedValue([
      { path: "inquiries/inq-1/1.jpg", uploadUrl: "https://s/u", publicUrl: "https://s/p" },
    ]);

    const result = await submitInquiry({ ...input, photoFileNames: ["tip.jpg"] });

    expect(result.uploads).toHaveLength(1);
    expect(repo.setInquiryPhotoPaths).toHaveBeenCalledWith("inq-1", ["inquiries/inq-1/1.jpg"]);
  });

  it("still succeeds when storage is not configured", async () => {
    vi.mocked(repo.findProductBySerial).mockResolvedValue(mockProduct);
    vi.mocked(repo.createInquiry).mockResolvedValue(mockInquiry);
    vi.mocked(storage.createUploadTargets).mockResolvedValue([]);

    const result = await submitInquiry({ ...input, photoFileNames: ["tip.jpg"] });

    expect(result.inquiryNumber).toBe("WFI-2026-0001");
    expect(result.uploads).toEqual([]);
    expect(repo.setInquiryPhotoPaths).not.toHaveBeenCalled();
  });
});

describe("listInquiries", () => {
  it("returns inquiries with no filter", async () => {
    vi.mocked(repo.findInquiries).mockResolvedValue([mockInquiry]);
    const result = await listInquiries({}, actor);
    expect(result).toHaveLength(1);
  });

  it("passes status filter", async () => {
    vi.mocked(repo.findInquiries).mockResolvedValue([]);
    await listInquiries({ status: "ACKNOWLEDGED" }, actor);
    expect(repo.findInquiries).toHaveBeenCalledWith({ status: "ACKNOWLEDGED" });
  });
});

describe("getInquiry", () => {
  it("returns inquiry by id", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue(mockInquiry);
    const result = await getInquiry("inq-1", actor);
    expect(result.inquiryNumber).toBe("WFI-2026-0001");
  });

  it("throws NotFoundError when missing", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue(null);
    await expect(getInquiry("missing", actor)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("updateInquiry", () => {
  it("acknowledges a PENDING inquiry", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue(mockInquiry);
    vi.mocked(repo.updateInquiryStatus).mockResolvedValue({ ...mockInquiry, status: "ACKNOWLEDGED" });
    const result = await updateInquiry("inq-1", "ACKNOWLEDGED", actor);
    expect(result.status).toBe("ACKNOWLEDGED");
  });

  it("throws ValidationError when already CONVERTED", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue({ ...mockInquiry, status: "CONVERTED" });
    await expect(updateInquiry("inq-1", "CLOSED", actor)).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("convertToServiceCase", () => {
  const converted = {
    ticket: { id: "tkt-1", ticketNumber: "TKT-2026-0001", status: "CONVERTED" as const },
    serviceCase: { id: "case-1", caseNumber: "WFC-2026-0001", status: "INTAKE" as const, priority: "NORMAL" as const },
  };

  it("derives the organization from the product owner", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue(mockInquiry);
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(repo.convertInquiry).mockResolvedValue(converted);

    const result = await convertToServiceCase("inq-1", {}, actor);

    expect(repo.convertInquiry).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: "org-1", createdBy: "user-1" }),
    );
    expect(result.serviceCase.caseNumber).toBe("WFC-2026-0001");
  });

  it("creates a contact from the submitter when asked", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue(mockInquiry);
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg as never);
    vi.mocked(repo.convertInquiry).mockResolvedValue(converted);

    await convertToServiceCase("inq-1", { createContactFromSubmitter: true }, actor);

    expect(repo.convertInquiry).toHaveBeenCalledWith(
      expect.objectContaining({
        newContact: expect.objectContaining({ name: "Dr. Anand Mehta", email: "anand@apollodelhi.com" }),
      }),
    );
  });

  it("requires an explicit org when the product has no owner", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue({
      ...mockInquiry,
      product: { ...mockInquiry.product, ownerOrgId: null },
    });

    await expect(convertToServiceCase("inq-1", {}, actor)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.convertInquiry).not.toHaveBeenCalled();
  });

  it("refuses to convert twice", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue({ ...mockInquiry, status: "CONVERTED" });
    await expect(convertToServiceCase("inq-1", {}, actor)).rejects.toBeInstanceOf(ValidationError);
    expect(repo.convertInquiry).not.toHaveBeenCalled();
  });

  it("refuses to convert a CLOSED inquiry", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue({ ...mockInquiry, status: "CLOSED" });
    await expect(convertToServiceCase("inq-1", {}, actor)).rejects.toBeInstanceOf(ValidationError);
  });
});
