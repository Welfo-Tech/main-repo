import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as inquiryService from "../../../services/web-inquiry.service.js";
import * as tokenLib from "../../../lib/token.js";
import { resetRateLimits } from "../../../middleware/rate-limit.js";

vi.mock("../../../services/web-inquiry.service.js");
vi.mock("../../../lib/token.js");

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
  reportedProblem: "Image dark on one side after autoclave.",
  urgency: "HIGH" as const,
  status: "PENDING" as const,
  photoPaths: [],
  convertedCaseId: null,
  submittedAt: new Date("2026-09-30"),
  updatedAt: new Date("2026-09-30"),
  product: {
    id: "prod-1",
    serialNumber: "WF-2024-00001",
    status: "IN_SERVICE" as const,
    ownerOrgId: "org-1",
    model: { id: "pm-1", name: "Olympus CF-HQ190L", category: "ENDOSCOPE" as const, manufacturer: "Olympus" },
    ownerOrg: { id: "org-1", name: "Apollo Hospitals Delhi" },
  },
};

const authToken = "Bearer valid-token";

function mockValidAuth(role: UserRole = UserRole.OPERATIONS) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    sub: "user-1",
    role,
    type: "access",
  } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetRateLimits();
});

describe("GET /api/v1/portal/inquiries/verify-serial", () => {
  it("returns valid for a known serial without auth", async () => {
    vi.mocked(inquiryService.verifySerial).mockResolvedValue({
      valid: true,
      productModel: "Olympus CF-HQ190L",
      manufacturer: "Olympus",
      status: "IN_SERVICE",
    } as never);

    const res = await app.request("/api/v1/portal/inquiries/verify-serial?serial=WF-2024-00001");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { valid: boolean; productModel: string };
    expect(body.valid).toBe(true);
    expect(body.productModel).toBe("Olympus CF-HQ190L");
  });

  it("returns valid false for an unknown serial", async () => {
    vi.mocked(inquiryService.verifySerial).mockResolvedValue({ valid: false } as never);

    const res = await app.request("/api/v1/portal/inquiries/verify-serial?serial=NOPE");

    expect(res.status).toBe(200);
    const body = (await res.json()) as { valid: boolean };
    expect(body.valid).toBe(false);
  });

  it("returns 400 when serial param is missing", async () => {
    const res = await app.request("/api/v1/portal/inquiries/verify-serial");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/portal/inquiries", () => {
  const validBody = {
    submitterName: "Dr. Anand Mehta",
    submitterEmail: "anand@apollodelhi.com",
    organizationName: "Apollo Hospitals Delhi",
    serialNumber: "WF-2024-00001",
    reportedProblem: "Image is dark on one side and fogs after autoclaving.",
    urgency: "HIGH",
  };

  it("returns 201 with the inquiry number and needs no auth", async () => {
    vi.mocked(inquiryService.submitInquiry).mockResolvedValue({
      inquiryNumber: "WFI-2026-0001",
      uploads: [],
    });

    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { inquiryNumber: string };
    expect(body.inquiryNumber).toBe("WFI-2026-0001");
  });

  it("returns upload targets when photos are declared", async () => {
    vi.mocked(inquiryService.submitInquiry).mockResolvedValue({
      inquiryNumber: "WFI-2026-0001",
      uploads: [
        {
          path: "inquiries/inq-1/1.jpg",
          uploadUrl: "https://storage.example/upload/signed",
          publicUrl: "https://storage.example/public/inquiries/inq-1/1.jpg",
        },
      ],
    });

    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, photoFileNames: ["tip.jpg"] }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { uploads: { path: string; uploadUrl: string }[] };
    expect(body.uploads).toHaveLength(1);
    expect(body.uploads[0]!.path).toBe("inquiries/inq-1/1.jpg");
  });

  it("rejects more than five photos", async () => {
    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...validBody,
        photoFileNames: ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"],
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when the serial is not in our records", async () => {
    vi.mocked(inquiryService.submitInquiry).mockRejectedValue(
      new ValidationError("serial number not found in our records"),
    );

    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, serialNumber: "UNKNOWN" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when serialNumber is absent", async () => {
    const { serialNumber: _omitted, ...withoutSerial } = validBody;
    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(withoutSerial),
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 when reportedProblem is too short", async () => {
    const res = await app.request("/api/v1/portal/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validBody, reportedProblem: "broken" }),
    });

    expect(res.status).toBe(400);
  });

  it("rate limits repeated submissions from the same address", async () => {
    vi.mocked(inquiryService.submitInquiry).mockResolvedValue({
      inquiryNumber: "WFI-2026-0001",
      uploads: [],
    });

    const send = () =>
      app.request("/api/v1/portal/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "203.0.113.9" },
        body: JSON.stringify(validBody),
      });

    const statuses: number[] = [];
    for (let i = 0; i < 7; i += 1) statuses.push((await send()).status);

    expect(statuses.filter(s => s === 201)).toHaveLength(5);
    expect(statuses.filter(s => s === 429)).toHaveLength(2);
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
    expect((await res.json()) as unknown[]).toHaveLength(1);
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
  });
});

describe("POST /api/v1/inquiries/:id/convert", () => {
  it("returns 201 with the created ticket and case", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.convertToServiceCase).mockResolvedValue({
      inquiry: { ...mockInquiry, status: "CONVERTED" },
      ticket: { id: "tkt-1", ticketNumber: "TKT-2026-0001", status: "CONVERTED" },
      serviceCase: { id: "case-1", caseNumber: "WFC-2026-0001", status: "INTAKE", priority: "NORMAL" },
    } as never);

    const res = await app.request("/api/v1/inquiries/inq-1/convert", {
      method: "POST",
      headers: { Authorization: authToken, "Content-Type": "application/json" },
      body: JSON.stringify({ createContactFromSubmitter: true, priority: "HIGH" }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { serviceCase: { caseNumber: string } };
    expect(body.serviceCase.caseNumber).toBe("WFC-2026-0001");
  });

  it("returns 400 when already converted", async () => {
    mockValidAuth();
    vi.mocked(inquiryService.convertToServiceCase).mockRejectedValue(
      new ValidationError("inquiry has already been converted"),
    );

    const res = await app.request("/api/v1/inquiries/inq-1/convert", {
      method: "POST",
      headers: { Authorization: authToken, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 for technician role", async () => {
    mockValidAuth(UserRole.TECHNICIAN);
    const res = await app.request("/api/v1/inquiries/inq-1/convert", {
      method: "POST",
      headers: { Authorization: authToken, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(403);
  });
});
