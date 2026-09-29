import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserRole } from "@repo/db";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as repo from "../repositories/web-inquiry.repository.js";
import {
  getInquiry,
  listInquiries,
  submitInquiry,
  updateInquiry,
} from "./web-inquiry.service.js";

vi.mock("../repositories/web-inquiry.repository.js");

const actor = { id: "user-1", role: UserRole.OPERATIONS };

const mockInquiry = {
  id: "inq-1",
  inquiryNumber: "WFI-2026-0001",
  submitterName: "Dr. Anand Mehta",
  submitterEmail: "anand@apollohospitals.com",
  submitterPhone: "+91-9876543210",
  organizationName: "Apollo Hospitals Delhi",
  city: "Delhi",
  productModel: "Rigid Endoscope 4K",
  serialNumber: "WFO-2022-0042",
  purchaseDate: new Date("2022-03-15"),
  reportedProblem: "Image blurry and light source flickering during procedures.",
  urgency: "HIGH" as const,
  status: "PENDING" as const,
  submittedAt: new Date("2026-09-30"),
  updatedAt: new Date("2026-09-30"),
};

beforeEach(() => vi.clearAllMocks());

describe("submitInquiry", () => {
  it("creates and returns inquiry", async () => {
    vi.mocked(repo.createInquiry).mockResolvedValue(mockInquiry);
    const result = await submitInquiry({
      submitterName: mockInquiry.submitterName,
      submitterEmail: mockInquiry.submitterEmail,
      organizationName: mockInquiry.organizationName,
      productModel: mockInquiry.productModel,
      reportedProblem: mockInquiry.reportedProblem,
    });
    expect(result.inquiryNumber).toBe("WFI-2026-0001");
    expect(repo.createInquiry).toHaveBeenCalledOnce();
  });
});

describe("listInquiries", () => {
  it("returns inquiries with no filter", async () => {
    vi.mocked(repo.findInquiries).mockResolvedValue([mockInquiry]);
    const result = await listInquiries({}, actor);
    expect(result).toHaveLength(1);
    expect(repo.findInquiries).toHaveBeenCalledWith({});
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

  it("throws NotFoundError when missing", async () => {
    vi.mocked(repo.findInquiryById).mockResolvedValue(null);
    await expect(updateInquiry("missing", "ACKNOWLEDGED", actor)).rejects.toBeInstanceOf(NotFoundError);
  });
});
