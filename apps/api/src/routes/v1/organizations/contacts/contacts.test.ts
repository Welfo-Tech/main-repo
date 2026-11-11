import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../../app.js";
import { NotFoundError } from "../../../../lib/errors.js";
import * as contactService from "../../../../services/customer-contact.service.js";
import * as tokenLib from "../../../../lib/token.js";

vi.mock("../../../../services/customer-contact.service.js");
vi.mock("../../../../lib/token.js");

const orgId = "org-1";
const contactId = "contact-1";

const mockContact = {
  id: contactId,
  organizationId: orgId,
  name: "Dr. Sharma",
  designation: "Head of Procurement",
  email: "sharma@cityhospital.in",
  phone: "+91-9876543210",
  isPrimary: true,
  isActive: true,
  createdAt: new Date("2026-01-01").toISOString(),
  updatedAt: new Date("2026-01-01").toISOString(),
};

const adminToken = "Bearer valid-token";
const adminPayload = { sub: "user-1", role: UserRole.ADMIN, type: "access" };

function mockValidAuth(role: UserRole = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    ...adminPayload,
    role,
    sub: "user-1",
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/organizations/:orgId/contacts", () => {
  it("returns 200 with contact list", async () => {
    mockValidAuth();
    vi.mocked(contactService.listContacts).mockResolvedValue([mockContact] as never);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts`, {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request(`/api/v1/organizations/${orgId}/contacts`);
    expect(res.status).toBe(401);
  });

  it("returns 404 when org not found", async () => {
    mockValidAuth();
    vi.mocked(contactService.listContacts).mockRejectedValue(new NotFoundError("organization not found"));

    const res = await app.request(`/api/v1/organizations/missing/contacts`, {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/organizations/:orgId/contacts/:contactId", () => {
  it("returns 200 with contact", async () => {
    mockValidAuth();
    vi.mocked(contactService.getContact).mockResolvedValue(mockContact as never);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts/${contactId}`, {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["id"]).toBe(contactId);
  });

  it("returns 404 when contact not found", async () => {
    mockValidAuth();
    vi.mocked(contactService.getContact).mockRejectedValue(new NotFoundError("contact not found"));

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts/missing`, {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/organizations/:orgId/contacts", () => {
  it("returns 201 with created contact", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(contactService.addContact).mockResolvedValue(mockContact as never);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Dr. Sharma" }),
    });

    expect(res.status).toBe(201);
  });

  it("returns 400 on invalid payload", async () => {
    mockValidAuth();

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 when role is TECHNICIAN", async () => {
    mockValidAuth(UserRole.TECHNICIAN);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "Test" }),
    });

    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/organizations/:orgId/contacts/:contactId", () => {
  it("returns 200 with updated contact", async () => {
    mockValidAuth(UserRole.OPERATIONS);
    vi.mocked(contactService.editContact).mockResolvedValue({
      ...mockContact,
      designation: "Director",
    } as never);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts/${contactId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ designation: "Director" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["designation"]).toBe("Director");
  });

  it("returns 404 when contact does not exist", async () => {
    mockValidAuth();
    vi.mocked(contactService.editContact).mockRejectedValue(new NotFoundError("contact not found"));

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts/missing`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: adminToken },
      body: JSON.stringify({ name: "New Name" }),
    });

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/organizations/:orgId/contacts/:contactId", () => {
  it("returns 204 on success", async () => {
    mockValidAuth(UserRole.ADMIN);
    vi.mocked(contactService.removeContact).mockResolvedValue(undefined as never);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts/${contactId}`, {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(204);
  });

  it("returns 403 when role is OPERATIONS", async () => {
    mockValidAuth(UserRole.OPERATIONS);

    const res = await app.request(`/api/v1/organizations/${orgId}/contacts/${contactId}`, {
      method: "DELETE",
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(403);
  });
});
