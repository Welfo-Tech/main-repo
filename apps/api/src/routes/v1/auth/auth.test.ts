import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "../../../app.js";
import { AuthError, ForbiddenError } from "../../../lib/errors.js";
import * as authService from "../../../services/auth.service.js";

vi.mock("../../../services/auth.service.js");

const mockLoginResult = {
  accessToken: "access-token",
  refreshToken: "refresh-token",
  user: {
    id: "uuid-1",
    email: "admin@welfo.com",
    name: "Admin",
    role: UserRole.ADMIN,
  },
};

beforeEach(() => vi.clearAllMocks());

describe("POST /api/v1/auth/login", () => {
  it("returns 200 with tokens on valid credentials", async () => {
    vi.mocked(authService.login).mockResolvedValue(mockLoginResult);

    const res = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@welfo.com", password: "password" }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(body["accessToken"]).toBe("access-token");
    expect(body["refreshToken"]).toBe("refresh-token");
  });

  it("returns 400 on invalid request body", async () => {
    const res = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });

    expect(res.status).toBe(400);
  });

  it("returns 401 on wrong credentials", async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new AuthError("invalid credentials"),
    );

    const res = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@welfo.com", password: "wrong" }),
    });

    expect(res.status).toBe(401);
  });

  it("returns 403 on inactive account", async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ForbiddenError("account is inactive"),
    );

    const res = await app.request("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@welfo.com", password: "password" }),
    });

    expect(res.status).toBe(403);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("returns 204", async () => {
    const res = await app.request("/api/v1/auth/logout", { method: "POST" });
    expect(res.status).toBe(204);
  });
});

describe("GET /api/v1/auth/me", () => {
  it("returns 401 without token", async () => {
    const res = await app.request("/api/v1/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await app.request("/api/v1/auth/me", {
      headers: { Authorization: "Bearer bad-token" },
    });
    expect(res.status).toBe(401);
  });
});
