import { TicketStatus, TicketUrgency, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError } from "../../../lib/errors.js";
import * as tokenLib from "../../../lib/token.js";
import * as ticketService from "../../../services/ticket.service.js";

vi.mock("../../../services/ticket.service.js");
vi.mock("../../../lib/token.js");

const ORG_ID = "550e8400-e29b-41d4-a716-446655440001";
const TICKET_ID = "550e8400-e29b-41d4-a716-446655440002";

const mockTicket = {
  id: TICKET_ID,
  ticketNumber: "TKT-2026-0001",
  organizationId: ORG_ID,
  contactId: null,
  productId: null,
  reportedProblem: "Endoscope not transmitting image",
  urgency: TicketUrgency.HIGH,
  status: TicketStatus.OPEN,
  createdBy: "550e8400-e29b-41d4-a716-446655440000",
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
  organization: { id: ORG_ID, name: "Apollo Hospitals Delhi" },
  contact: null,
  product: null,
};

const adminToken = "Bearer valid-token";

function mockValidAuth(role = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    sub: "user-1",
    role,
    type: "access",
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/tickets", () => {
  it("returns 200 with ticket list", async () => {
    mockValidAuth();
    vi.mocked(ticketService.listTickets).mockResolvedValue([mockTicket] as never);

    const res = await app.request("/api/v1/tickets", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/tickets");
    expect(res.status).toBe(401);
  });

  it("passes query filters to service", async () => {
    mockValidAuth();
    vi.mocked(ticketService.listTickets).mockResolvedValue([]);

    const res = await app.request(`/api/v1/tickets?status=OPEN&orgId=${ORG_ID}`, {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    expect(ticketService.listTickets).toHaveBeenCalledWith(
      expect.objectContaining({ status: "OPEN", orgId: ORG_ID }),
      expect.anything(),
    );
  });
});

describe("GET /api/v1/tickets/:id", () => {
  it("returns 200 with ticket", async () => {
    mockValidAuth();
    vi.mocked(ticketService.getTicket).mockResolvedValue(mockTicket as never);

    const res = await app.request("/api/v1/tickets/${TICKET_ID}", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["ticketNumber"]).toBe("TKT-2026-0001");
    expect(body["organization"]).toBeDefined();
  });

  it("returns 404 when ticket not found", async () => {
    mockValidAuth();
    vi.mocked(ticketService.getTicket).mockRejectedValue(
      new NotFoundError("ticket not found"),
    );

    const res = await app.request("/api/v1/tickets/missing", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/tickets", () => {
  it("returns 201 with created ticket", async () => {
    mockValidAuth();
    vi.mocked(ticketService.openTicket).mockResolvedValue(mockTicket as never);

    const res = await app.request("/api/v1/tickets", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: ORG_ID,
        reportedProblem: "Endoscope not transmitting image",
        urgency: "HIGH",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["ticketNumber"]).toBe("TKT-2026-0001");
  });

  it("returns 400 when required fields are missing", async () => {
    mockValidAuth();

    const res = await app.request("/api/v1/tickets", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ urgency: "HIGH" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 for TECHNICIAN role", async () => {
    mockValidAuth(UserRole.TECHNICIAN);

    const res = await app.request("/api/v1/tickets", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: ORG_ID,
        reportedProblem: "issue",
      }),
    });

    expect(res.status).toBe(403);
  });

  it("returns 404 when org does not exist", async () => {
    mockValidAuth();
    vi.mocked(ticketService.openTicket).mockRejectedValue(
      new NotFoundError("organization not found"),
    );

    const res = await app.request("/api/v1/tickets", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        organizationId: "550e8400-e29b-41d4-a716-000000000000",
        reportedProblem: "issue",
      }),
    });

    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/tickets/:id", () => {
  it("returns 200 with updated ticket", async () => {
    mockValidAuth();
    vi.mocked(ticketService.editTicket).mockResolvedValue({
      ...mockTicket,
      status: TicketStatus.INTAKE_RECEIVED,
    } as never);

    const res = await app.request("/api/v1/tickets/${TICKET_ID}", {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "INTAKE_RECEIVED" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["status"]).toBe("INTAKE_RECEIVED");
  });

  it("returns 404 when ticket not found", async () => {
    mockValidAuth();
    vi.mocked(ticketService.editTicket).mockRejectedValue(
      new NotFoundError("ticket not found"),
    );

    const res = await app.request("/api/v1/tickets/missing", {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CONVERTED" }),
    });

    expect(res.status).toBe(404);
  });
});
