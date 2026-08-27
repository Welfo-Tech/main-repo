import { UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as userRepo from "../repositories/user.repository.js";
import * as techRepo from "../repositories/technician.repository.js";
import {
  createTechnicianProfile,
  editTechnician,
  getTechnician,
  listTechnicians,
} from "./technician.service.js";

vi.mock("../repositories/user.repository.js");
vi.mock("../repositories/technician.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const mockUser = {
  id: "user-2",
  name: "Ravi Kumar",
  email: "ravi@welfo.local",
  role: UserRole.ADMIN,
  isActive: true,
  passwordHash: "hash",
  lastLoginAt: null,
};

const mockTech = {
  id: "tech-1",
  employeeId: "EMP-001",
  phone: "+91-99999-00001",
  specializations: ["ENDOSCOPE"],
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  user: { id: "user-2", name: "Ravi Kumar", email: "ravi@welfo.local" },
};

beforeEach(() => vi.clearAllMocks());

describe("listTechnicians", () => {
  it("returns all technicians", async () => {
    vi.mocked(techRepo.findTechnicians).mockResolvedValue([mockTech]);
    const result = await listTechnicians({}, actor);
    expect(result).toHaveLength(1);
    expect(result[0]!.employeeId).toBe("EMP-001");
    expect(techRepo.findTechnicians).toHaveBeenCalledWith({});
  });

  it("passes isActive filter", async () => {
    vi.mocked(techRepo.findTechnicians).mockResolvedValue([]);
    await listTechnicians({ isActive: true }, actor);
    expect(techRepo.findTechnicians).toHaveBeenCalledWith({ isActive: true });
  });
});

describe("getTechnician", () => {
  it("returns technician by id", async () => {
    vi.mocked(techRepo.findTechnicianById).mockResolvedValue(mockTech);
    const result = await getTechnician("tech-1", actor);
    expect(result.employeeId).toBe("EMP-001");
  });

  it("throws NotFoundError when not found", async () => {
    vi.mocked(techRepo.findTechnicianById).mockResolvedValue(null);
    await expect(getTechnician("missing", actor)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("createTechnicianProfile", () => {
  it("creates profile when user exists and has no profile", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(mockUser);
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(null);
    vi.mocked(techRepo.createTechnician).mockResolvedValue(mockTech);

    const result = await createTechnicianProfile(
      { userId: "user-2", employeeId: "EMP-001", specializations: ["ENDOSCOPE"] },
      actor,
    );

    expect(result.employeeId).toBe("EMP-001");
    expect(techRepo.createTechnician).toHaveBeenCalled();
  });

  it("throws NotFoundError when user does not exist", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(null);
    await expect(
      createTechnicianProfile({ userId: "missing", employeeId: "EMP-001" }, actor),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws ValidationError when user already has a profile", async () => {
    vi.mocked(userRepo.findUserById).mockResolvedValue(mockUser);
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTech);
    await expect(
      createTechnicianProfile({ userId: "user-2", employeeId: "EMP-002" }, actor),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("editTechnician", () => {
  it("updates technician when found", async () => {
    vi.mocked(techRepo.findTechnicianById).mockResolvedValue(mockTech);
    vi.mocked(techRepo.updateTechnician).mockResolvedValue({
      ...mockTech,
      isActive: false,
    });

    const result = await editTechnician("tech-1", { isActive: false }, actor);
    expect(result.isActive).toBe(false);
  });

  it("throws NotFoundError when technician not found", async () => {
    vi.mocked(techRepo.findTechnicianById).mockResolvedValue(null);
    await expect(editTechnician("missing", { isActive: false }, actor)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
