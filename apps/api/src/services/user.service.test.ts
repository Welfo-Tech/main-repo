import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as password from "../lib/password.js";
import * as userRepo from "../repositories/user.repository.js";
import { createStaffUser, editUser, getUser, listUsers } from "./user.service.js";

vi.mock("../repositories/user.repository.js");
vi.mock("../lib/password.js");

const actor = { id: "admin-1", role: UserRole.ADMIN };

const mockUser = {
  id: "user-1",
  name: "Priya Singh",
  email: "priya@welfo.local",
  role: UserRole.OPERATIONS,
  isActive: true,
  lastLoginAt: null,
};

beforeEach(() => vi.clearAllMocks());

describe("listUsers", () => {
  it("returns all users", async () => {
    vi.mocked(userRepo.findUsers).mockResolvedValue([mockUser]);
    const result = await listUsers({}, actor);
    expect(result).toHaveLength(1);
    expect(result[0]!.email).toBe("priya@welfo.local");
    expect(userRepo.findUsers).toHaveBeenCalledWith({});
  });

  it("passes role filter", async () => {
    vi.mocked(userRepo.findUsers).mockResolvedValue([]);
    await listUsers({ role: UserRole.OPERATIONS }, actor);
    expect(userRepo.findUsers).toHaveBeenCalledWith({ role: UserRole.OPERATIONS });
  });
});

describe("getUser", () => {
  it("returns user by id", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(mockUser);
    const result = await getUser("user-1", actor);
    expect(result.email).toBe("priya@welfo.local");
  });

  it("throws NotFoundError when not found", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(null);
    await expect(getUser("missing", actor)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("createStaffUser", () => {
  const input = {
    name: "Priya Singh",
    email: "priya@welfo.local",
    password: "secret123",
    role: UserRole.OPERATIONS,
  };

  it("creates user when email is not taken", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null);
    vi.mocked(password.hashPassword).mockResolvedValue("hashed");
    vi.mocked(userRepo.createUser).mockResolvedValue(mockUser);

    const result = await createStaffUser(input, actor);

    expect(userRepo.findUserByEmail).toHaveBeenCalledWith("priya@welfo.local");
    expect(password.hashPassword).toHaveBeenCalledWith("secret123");
    expect(userRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "priya@welfo.local", role: UserRole.OPERATIONS }),
    );
    expect(result.email).toBe("priya@welfo.local");
  });

  it("throws ValidationError when email is already in use", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue({
      ...mockUser,
      passwordHash: "hash",
    });
    await expect(createStaffUser(input, actor)).rejects.toBeInstanceOf(ValidationError);
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });

  it("throws ValidationError when role is TECHNICIAN", async () => {
    vi.mocked(userRepo.findUserByEmail).mockResolvedValue(null);
    await expect(
      createStaffUser({ ...input, role: UserRole.TECHNICIAN }, actor),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(userRepo.createUser).not.toHaveBeenCalled();
  });
});

describe("editUser", () => {
  it("updates user when found", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(mockUser);
    vi.mocked(userRepo.updateUser).mockResolvedValue({ ...mockUser, isActive: false });

    const result = await editUser("user-1", { isActive: false }, actor);
    expect(result.isActive).toBe(false);
  });

  it("throws NotFoundError when user not found", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(null);
    await expect(editUser("missing", { isActive: false }, actor)).rejects.toBeInstanceOf(NotFoundError);
  });
});
