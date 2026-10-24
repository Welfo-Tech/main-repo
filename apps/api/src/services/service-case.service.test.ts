import { CasePriority, ServiceCaseStatus, ServiceCaseType, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as orgRepo from "../repositories/organization.repository.js";
import * as productRepo from "../repositories/product.repository.js";
import * as caseRepo from "../repositories/service-case.repository.js";
import * as techRepo from "../repositories/technician.repository.js";
import { editCase, getCase, listCases, openCase } from "./service-case.service.js";

vi.mock("../repositories/organization.repository.js");
vi.mock("../repositories/product.repository.js");
vi.mock("../repositories/service-case.repository.js");
vi.mock("../repositories/technician.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

const mockOrg = {
  id: "org-1",
  name: "Apollo Hospitals Delhi",
  type: "HOSPITAL" as const,
  tier: "PREMIUM" as const,
  gstNumber: null,
  panNumber: null,
  paymentTermsDays: 30,
  website: null,
  notes: null,
  isActive: true,
  deletedAt: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
};

const mockProduct = {
  id: "product-1",
  serialNumber: "WF-2024-00001",
  modelId: "model-1",
  ownerOrgId: "org-1",
  manufactureDate: null,
  saleDate: null,
  warrantyExpiry: null,
  status: "REGISTERED" as const,
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  model: { id: "model-1", name: "Olympus CF-HQ190", category: "ENDOSCOPE" as const, manufacturer: "Olympus" },
  ownerOrg: { id: "org-1", name: "Apollo Hospitals Delhi" },
};

const mockCase = {
  id: "case-1",
  caseNumber: "WFC-2026-0001",
  type: ServiceCaseType.REPAIR,
  status: ServiceCaseStatus.INTAKE,
  isBillable: true,
  priority: CasePriority.NORMAL,
  slaDeadline: null,
  intakeCondition: null,
  closedAt: null,
  cancellationReason: null,
  holdReason: null,
  irreparableState: null,
  irreparableReason: null,
  irreparableProposedBy: null,
  irreparableProposedAt: null,
  irreparableVerdictBy: null,
  irreparableVerdictAt: null,
  irreparableVerdictNote: null,
  createdBy: "user-1",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  organization: { id: "org-1", name: "Apollo Hospitals Delhi" },
  contact: null,
  product: {
    id: "product-1",
    serialNumber: "WF-2024-00001",
    model: { id: "model-1", name: "Olympus CF-HQ190", category: "ENDOSCOPE" as const },
  },
  technician: null,
  ticket: null,
};

const techActor = { id: "tech-user-1", role: UserRole.TECHNICIAN };

const mockTechProfile = {
  id: "tech-1",
  employeeId: "EMP-001",
  phone: null,
  specializations: [],
  isActive: true,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  user: { id: "tech-user-1", name: "Ravi Sharma", email: "tech@welfo.local" },
};

beforeEach(() => vi.clearAllMocks());

describe("technician scoping", () => {
  it("forces a technician's case list to their own assignments", async () => {
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTechProfile);
    vi.mocked(caseRepo.findCases).mockResolvedValue([]);

    await listCases({ status: ServiceCaseStatus.IN_REPAIR }, techActor);

    expect(caseRepo.findCases).toHaveBeenCalledWith(
      expect.objectContaining({ technicianId: "tech-1" }),
    );
  });

  it("ignores a technicianId the technician tries to pass in", async () => {
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTechProfile);
    vi.mocked(caseRepo.findCases).mockResolvedValue([]);

    await listCases({ technicianId: "someone-else" }, techActor);

    expect(caseRepo.findCases).toHaveBeenCalledWith(
      expect.objectContaining({ technicianId: "tech-1" }),
    );
  });

  it("does not scope admins", async () => {
    vi.mocked(caseRepo.findCases).mockResolvedValue([mockCase]);

    await listCases({}, actor);

    expect(techRepo.findTechnicianByUserId).not.toHaveBeenCalled();
    expect(caseRepo.findCases).toHaveBeenCalledWith({});
  });

  it("hides a case assigned to a different technician", async () => {
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTechProfile);
    vi.mocked(caseRepo.findCaseById).mockResolvedValue({
      ...mockCase,
      technician: { id: "tech-other", user: { id: "u9", name: "Someone Else" } },
    });

    await expect(getCase("case-1", techActor)).rejects.toBeInstanceOf(NotFoundError);
  });

  it("allows a technician their own case", async () => {
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTechProfile);
    vi.mocked(caseRepo.findCaseById).mockResolvedValue({
      ...mockCase,
      technician: { id: "tech-1", user: { id: "tech-user-1", name: "Ravi Sharma" } },
    });

    const result = await getCase("case-1", techActor);
    expect(result.caseNumber).toBe("WFC-2026-0001");
  });

  it("rejects a TECHNICIAN role with no technician profile", async () => {
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(null);
    await expect(listCases({}, techActor)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("listCases", () => {
  it("returns all cases", async () => {
    vi.mocked(caseRepo.findCases).mockResolvedValue([mockCase]);

    const result = await listCases({}, actor);

    expect(result).toHaveLength(1);
    expect(result[0]!.caseNumber).toBe("WFC-2026-0001");
    expect(caseRepo.findCases).toHaveBeenCalledWith({});
  });

  it("passes filters to repo", async () => {
    vi.mocked(caseRepo.findCases).mockResolvedValue([]);

    await listCases({ status: ServiceCaseStatus.INTAKE, orgId: "org-1" }, actor);

    expect(caseRepo.findCases).toHaveBeenCalledWith({
      status: ServiceCaseStatus.INTAKE,
      orgId: "org-1",
    });
  });
});

describe("getCase", () => {
  it("returns case with all relations", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(mockCase);

    const result = await getCase("case-1", actor);

    expect(result.caseNumber).toBe("WFC-2026-0001");
    expect(result.organization.name).toBe("Apollo Hospitals Delhi");
    expect(result.product.serialNumber).toBe("WF-2024-00001");
  });

  it("throws NotFoundError when case does not exist", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);

    await expect(getCase("missing", actor)).rejects.toThrow(NotFoundError);
  });
});

describe("openCase", () => {
  it("creates case after validating org and product", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg);
    vi.mocked(productRepo.findProductById).mockResolvedValue(mockProduct);
    vi.mocked(caseRepo.createCase).mockResolvedValue(mockCase);

    const result = await openCase(
      { organizationId: "org-1", productId: "product-1" },
      actor,
    );

    expect(result.caseNumber).toBe("WFC-2026-0001");
    expect(caseRepo.createCase).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-1",
        productId: "product-1",
        createdBy: "user-1",
      }),
    );
  });

  it("throws NotFoundError when org does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(null);

    await expect(
      openCase({ organizationId: "missing", productId: "product-1" }, actor),
    ).rejects.toThrow(NotFoundError);
    expect(caseRepo.createCase).not.toHaveBeenCalled();
  });

  it("throws NotFoundError when product does not exist", async () => {
    vi.mocked(orgRepo.findOrganizationById).mockResolvedValue(mockOrg);
    vi.mocked(productRepo.findProductById).mockResolvedValue(null);

    await expect(
      openCase({ organizationId: "org-1", productId: "missing" }, actor),
    ).rejects.toThrow(NotFoundError);
    expect(caseRepo.createCase).not.toHaveBeenCalled();
  });
});

describe("editCase", () => {
  it("updates case status", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(mockCase);
    vi.mocked(caseRepo.updateCase).mockResolvedValue({
      ...mockCase,
      status: ServiceCaseStatus.ASSIGNED,
    });

    const result = await editCase(
      "case-1",
      { status: ServiceCaseStatus.ASSIGNED },
      actor,
    );

    expect(result.status).toBe(ServiceCaseStatus.ASSIGNED);
    expect(caseRepo.updateCase).toHaveBeenCalledWith("case-1", {
      status: ServiceCaseStatus.ASSIGNED,
    });
  });

  it("throws NotFoundError when case does not exist", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);

    await expect(
      editCase("missing", { status: ServiceCaseStatus.ASSIGNED }, actor),
    ).rejects.toThrow(NotFoundError);
    expect(caseRepo.updateCase).not.toHaveBeenCalled();
  });

  it("throws ValidationError on invalid status transition (trigger P0001)", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(mockCase);
    vi.mocked(caseRepo.updateCase).mockRejectedValue({
      code: "P0001",
      message:
        "service_case case-1 is CLOSED and cannot transition to ASSIGNED. Admin override required.",
    });

    await expect(
      editCase("case-1", { status: ServiceCaseStatus.ASSIGNED }, actor),
    ).rejects.toThrow(ValidationError);
  });
});
