import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { NotFoundError, ValidationError } from "../../../lib/errors.js";
import * as userService from "../../../services/user.service.js";
import * as tokenLib from "../../../lib/token.js";

vi.mock("../../../services/user.service.js");
vi.mock("../../../lib/token.js");

const mockUser = {
  id: "user-1",
  name: "Priya Singh",
  email: "priya@welfo.local",
  role: UserRole.OPERATIONS,
  isActive: true,
  lastLoginAt: null,
};

const adminToken = "Bearer valid-token";
const adminPayload = { sub: "admin-1", role: UserRole.ADMIN, type: "access" };

function mockValidAuth(role: UserRole = UserRole.ADMIN) {
  vi.mocked(tokenLib.verifyToken).mockResolvedValue({
    ...adminPayload,
    role,
    sub: "admin-1",
  } as never);
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/v1/users", () => {
  it("returns 200 with user list", async () => {
    mockValidAuth();
    vi.mocked(userService.listUsers).mockResolvedValue([mockUser]);

    const res = await app.request("/api/v1/users", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(body).toHaveLength(1);
  });

  it("returns 401 without auth", async () => {
    const res = await app.request("/api/v1/users");
    expect(res.status).toBe(401);
  });

  it("returns 403 for non-admin role", async () => {
    mockValidAuth(UserRole.OPERATIONS);
    const res = await app.request("/api/v1/users", {
      headers: { Authorization: adminToken },
    });
    expect(res.status).toBe(403);
  });
});

describe("GET /api/v1/users/:id", () => {
  it("returns 200 with user", async () => {
    mockValidAuth();
    vi.mocked(userService.getUser).mockResolvedValue(mockUser);

    const res = await app.request("/api/v1/users/user-1", {
      headers: { Authorization: adminToken },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string };
    expect(body.id).toBe("user-1");
  });

  it("returns 404 when not found", async () => {
    mockValidAuth();
    vi.mocked(userService.getUser).mockRejectedValue(new NotFoundError("user not found"));

    const res = await app.request("/api/v1/users/bad-id", {
      headers: { Authorization: adminToken },
    });
    expect(res.status).toBe(404);
  });
});

describe("POST /api/v1/users", () => {
  it("returns 201 with created user", async () => {
    mockValidAuth();
    vi.mocked(userService.createStaffUser).mockResolvedValue(mockUser);

    const res = await app.request("/api/v1/users", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Singh",
        email: "priya@welfo.local",
        password: "secret123",
        role: "OPERATIONS",
      }),
    });

    expect(res.status).toBe(201);
    const body = (await res.json()) as { email: string };
    expect(body.email).toBe("priya@welfo.local");
  });

  it("returns 400 when email is taken", async () => {
    mockValidAuth();
    vi.mocked(userService.createStaffUser).mockRejectedValue(
      new ValidationError("email already in use"),
    );

    const res = await app.request("/api/v1/users", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Singh",
        email: "priya@welfo.local",
        password: "secret123",
        role: "OPERATIONS",
      }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 403 for non-admin role", async () => {
    mockValidAuth(UserRole.OPERATIONS);

    const res = await app.request("/api/v1/users", {
      method: "POST",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Priya Singh",
        email: "priya@welfo.local",
        password: "secret123",
        role: "OPERATIONS",
      }),
    });
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/v1/users/:id", () => {
  it("returns 200 with updated user", async () => {
    mockValidAuth();
    vi.mocked(userService.editUser).mockResolvedValue({ ...mockUser, isActive: false });

    const res = await app.request("/api/v1/users/user-1", {
      method: "PATCH",
      headers: { Authorization: adminToken, "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { isActive: boolean };
    expect(body.isActive).toBe(false);
  });
});
