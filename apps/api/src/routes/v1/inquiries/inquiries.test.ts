import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as inquiryService from "../../../services/web-inquiry.service.js";
import * as tokenLib from "../../../lib/token.js";

vi.mock("../../../services/web-inquiry.service.js");
vi.mock("../../../lib/token.js");

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
  reportedProblem: "Image blurry and light source flickering.",
  urgency: "HIGH" as const,
  status: "PENDING" as const,
  submittedAt: new Date("2026-09-30"),
  updatedAt: new Date("2026-09-30"),
};

const authToken = "Bearer valid-token";

function mockValidAuth(role: UserRole = UserRole.OPERATIONS) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    sub: "user-1",
    role,
    type: "access",
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("POST /api/v1/portal/inquiries", () => {
  const validBody = {
    submitterName: "Dr. Anand Mehta",
    submitterEmail: "anand@apollohospitals.com",
    submitterPhone: "+91-9876543210",
    organizationName: "Apollo Hospitals Delhi",
    city: "Delhi",
    productModel: "Rigid Endoscope 4K",
    serialNumber: "WFO-2022-0042",
    reportedProblem: "Image is blurry and the light source flickers during procedures.",
    urgency: "HIGH",
  };

  it("returns 201 with inquiry number and requires no auth", async () => {
    vi.mocked(inquiryService.submitInquiry).mockResolvedValue(mockInquiry);

    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { inquiryNumber: string };
    expect(body.inquiryNumber).toBe("WFI-2026-0001");
  });

  it("returns 400 when reportedProblem is too short", async () => {
    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, reportedProblem: "broken" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, submitterEmail: "not-an-email" }),
    });

    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/inquiries", () => {
  it("returns 200 with inquiry list", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.listInquiries).mockResolvedValue([mockInquiry]);

    const res = await app.request("/api/v1/inquiries", {
      headers: { Authorization: authToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/inquiries");
    expect(res.status).toBe(401);
  });

  it("returns 403 for technician role", async () => {
    mockValidAuth(UserRole.TECHNICIAN);
    const res = await app.request("/api/v1/inquiries", {
      headers: { Authorization: authToken },
    });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/inquiries/:id", () => {
  it("returns 200 with inquiry", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.getInquiry).mockResolvedValue(mockInquiry);

    const res = await app.request("/api/v1/inquiries/inq-1", {
      headers: { Authorization: authToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { inquiryNumber: string };
    expect(body.inquiryNumber).toBe("WFI-2026-0001");
  });

  it("returns 404 when missing", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.getInquiry).mockRejectedValue(new NotFoundError("inquiry not found"));

    const res = await app.request("/api/v1/inquiries/bad-id", {
      headers: { Authorization: authToken },
    });
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/inquiries/:id", () => {
  it("returns 200 with updated status", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.updateInquiry).mockResolvedValue({
      ...mockInquiry,
      status: "ACKNOWLEDGED",
    });

    const res = await app.request("/api/v1/inquiries/inq-1", {
      method: "PATCH",
      headers: { Authorization: authToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACKNOWLEDGED" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string };
    expect(body.status).toBe("ACKNOWLEDGED");
  });

  it("returns 400 when inquiry is already terminal", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.updateInquiry).mockRejectedValue(
      new ValidationError("inquiry is CONVERTED and cannot be updated"),
    );

    const res = await app.request("/api/v1/inquiries/inq-1", {
      method: "PATCH",
      headers: { Authorization: authToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });

    expect(res.status).toBe(400);
  });
});
