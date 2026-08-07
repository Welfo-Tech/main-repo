import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "../lib/errors.js";
import * as orgRepo from "../repositories/organization.repository.js";
import { createOrg, deactivateOrg, getOrganization, listOrganizations, updateOrg } from "./organization.service.js";
import { UserRole } from "@repo/db";

vi.mock("../repositories/organization.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const mockOrg = {
  id: "org-1",
  name: "City General Hospital",
  type: "HOSPITAL" as const,
  tier: "STANDARD" as const,
  gstNumber: "22AAAAA0000A1Z5",
  panNumber: null,
  paymentTermsDays: 30,
  website: null,
  notes: null,
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listOrganizations", () => {
  it("returns all organizations matching filters", async () => {
    vi.mocked(orgRepo.findOrganizations).mockResolvedValue([mockOrg]);

    const result = await listOrganizations({}, actor);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("City General Hospital");
    expect(orgRepo.findOrganizations).toHaveBeenCalledWith({});
  });

  it("passes filters through to repo", async () => {
    vi.mocked(orgRepo.findOrganizations).mockResolvedValue([]);

    await listOrganizations({ type: "HOSPITAL", isActive: true }, actor);

    expect(orgRepo.findOrganizations).toHaveBeenCalledWith({ type: "HOSPITAL", isActive: true });
  });
});

describe("getOrganization", () => {
  it("returns org when found", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg);

    const result = await getOrganization("org-1", actor);

    expect(result.id).toBe("org-1");
    expect(result.name).toBe("City General Hospital");
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(getOrganization("missing-id", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("createOrg", () => {
  it("creates and returns new org", async () => {
    vi.mocked(orgRepo.createOrganization).mockResolvedValue(mockOrg);

    const result = await createOrg({ name: "City General Hospital", type: "HOSPITAL" }, actor);

    expect(result.name).toBe("City General Hospital");
    expect(orgRepo.createOrganization).toHaveBeenCalledWith({ name: "City General Hospital", type: "HOSPITAL" });
  });
});

describe("updateOrg", () => {
  it("updates and returns org", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg);
    vi.mocked(orgRepo.updateOrganization).mockResolvedValue({ ...mockOrg, paymentTermsDays: 45 });

    const result = await updateOrg("org-1", { paymentTermsDays: 45 }, actor);

    expect(result.paymentTermsDays).toBe(45);
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(updateOrg("missing", { name: "new" }, actor)).rejects.toThrow(NotFoundError);
  });
});

describe("deactivateOrg", () => {
  it("soft-deletes the org", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg);
    vi.mocked(orgRepo.softDeleteOrganization).mockResolvedValue({ id: "org-1" });

    await deactivateOrg("org-1", actor);

    expect(orgRepo.softDeleteOrganization).toHaveBeenCalledWith("org-1");
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(deactivateOrg("missing", actor)).rejects.toThrow(NotFoundError);
  });
});
