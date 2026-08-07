import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthError, ForbiddenError } from "../lib/errors.js";
import * as passwordLib from "../lib/password.js";
import * as tokenLib from "../lib/token.js";
import * as userRepo from "../repositories/user.repository.js";
import { getMe, login, refresh } from "./auth.service.js";

vi.mock("../repositories/user.repository.js");
vi.mock("../lib/password.js");
vi.mock("../lib/token.js");

const mockUser = {
  id: "user-uuid-1",
  email: "admin@welfo.com",
  name: "Admin User",
  role: "ADMIN" as const,
  passwordHash: "$2a$12$hashedpassword",
  isActive: true,
  lastLoginAt: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(tokenLib.signAccessToken).mockResolvedValue("access-token");
  vi.mocked(tokenLib.signRefreshToken).mockResolvedValue("refresh-token");
});

describe("login", () => {
  it("returns tokens and user on valid credentials", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordLib.verifyPassword).mockResolvedValue(true);
    vi.mocked(userRepo.updateLastLoginAt).mockResolvedValue(undefined as never);

    const result = await login("admin@welfo.com", "password123");

    expect(result.accessToken).toBe("access-token");
    expect(result.refreshToken).toBe("refresh-token");
    expect(result.user.email).toBe("admin@welfo.com");
    expect(result.user.role).toBe("ADMIN");
    expect(userRepo.updateLastLoginAt).toHaveBeenCalledWith("user-uuid-1");
  });

  it("throws AuthError when user does not exist", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null);

    await expect(login("nobody@welfo.com", "password")).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it("throws AuthError on wrong password", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(mockUser);
    vi.mocked(passwordLib.verifyPassword).mockResolvedValue(false);

    await expect(login("admin@welfo.com", "wrongpass")).rejects.toBeInstanceOf(
      AuthError,
    );
  });

  it("throws ForbiddenError when account is inactive", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
      ...mockUser,
      isActive: false,
    });
    vi.mocked(passwordLib.verifyPassword).mockResolvedValue(true);

    await expect(login("admin@welfo.com", "password")).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });
});

describe("refresh", () => {
  it("returns a new access token on valid refresh token", async () => {
    vi.mocked(tokenLib.verifyToken).mockResolvedValue({
      sub: "user-uuid-1",
      type: "refresh",
    } as never);
    vi.mocked(userRepo.findUserById).mockResolvedValue({
      ...mockUser,
      passwordHash: undefined,
    } as never);

    const result = await refresh("valid-refresh-token");
    expect(result.accessToken).toBe("access-token");
  });

  it("throws AuthError on invalid token", async () => {
    vi.mocked(tokenLib.verifyToken).mockRejectedValue(new Error("expired"));

    await expect(refresh("bad-token")).rejects.toBeInstanceOf(AuthError);
  });

  it("throws AuthError when token type is not refresh", async () => {
    vi.mocked(tokenLib.verifyToken).mockResolvedValue({
      sub: "user-uuid-1",
      type: "access",
    } as never);

    await expect(refresh("access-token")).rejects.toBeInstanceOf(AuthError);
  });
});

describe("getMe", () => {
  it("returns user without passwordHash", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue({
      ...mockUser,
      passwordHash: undefined,
    } as never);

    const user = await getMe("user-uuid-1");
    expect(user.email).toBe("admin@welfo.com");
  });

  it("throws AuthError when user not found", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(null);

    await expect(getMe("bad-id")).rejects.toBeInstanceOf(AuthError);
  });
});
