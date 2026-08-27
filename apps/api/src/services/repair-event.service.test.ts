import { RepairEventType, ServiceCaseStatus, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as repairEventRepo from "../repositories/repair-event.repository.js";
import * as caseRepo from "../repositories/service-case.repository.js";
import * as techRepo from "../repositories/technician.repository.js";
import { addRepairEvent, listRepairEvents } from "./repair-event.service.js";

vi.mock("../repositories/repair-event.repository.js");
vi.mock("../repositories/service-case.repository.js");
vi.mock("../repositories/technician.repository.js");

const adminActor = { id: "user-1", role: UserRole.ADMIN };

const mockTech = {
  id: "tech-1",
  employeeId: "EMP-001",
  phone: null,
  specializations: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: "user-1", name: "Ravi Kumar", email: "ravi@welfo.local" },
};

function makeCase(status: ServiceCaseStatus) {
  return {
    id: "case-1",
    caseNumber: "WFC-2026-0001",
    type: "REPAIR" as const,
    status,
    isBillable: true,
    priority: "NORMAL" as const,
    slaDeadline: null,
    intakeCondition: null,
    closedAt: null,
    cancellationReason: null,
    holdReason: null,
    createdBy: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
    organization: { id: "org-1", name: "Apollo" },
    contact: null,
    product: { id: "prod-1", serialNumber: "WF-001", model: { id: "m1", name: "CF-HQ190L", category: "ENDOSCOPE" as const } },
    technician: { id: "tech-1", user: { id: "user-1", name: "Ravi Kumar" } },
    ticket: null,
  };
}

const mockEvent = {
  id: "evt-1",
  caseId: "case-1",
  eventType: RepairEventType.OBSERVATION,
  description: "Light guide connector loose",
  eventAt: new Date(),
  createdAt: new Date(),
  technician: {
    id: "tech-1",
    employeeId: "EMP-001",
    user: { id: "user-1", name: "Ravi Kumar" },
  },
};

beforeEach(() => vi.clearAllMocks());

describe("listRepairEvents", () => {
  it("returns events for a valid case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase(ServiceCaseStatus.IN_REPAIR));
    vi.mocked(repairEventRepo.findRepairEventsByCaseId).mockResolvedValue([mockEvent]);

    const result = await listRepairEvents("case-1", adminActor);
    expect(result).toHaveLength(1);
  });

  it("throws NotFoundError when case missing", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);
    await expect(listRepairEvents("missing", adminActor)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("addRepairEvent", () => {
  it("creates event on a workable case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase(ServiceCaseStatus.IN_REPAIR));
    vi.mocked(repairEventRepo.createRepairEvent).mockResolvedValue(mockEvent);

    const result = await addRepairEvent(
      "case-1",
      { eventType: RepairEventType.OBSERVATION, description: "Light guide loose" },
      adminActor,
    );
    expect(result.eventType).toBe(RepairEventType.OBSERVATION);
  });

  it("throws ValidationError for non-workable status", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase(ServiceCaseStatus.CLOSED));

    await expect(
      addRepairEvent(
        "case-1",
        { eventType: RepairEventType.NOTE, description: "Note" },
        adminActor,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws ValidationError when no technician assigned", async () => {
    const sc = makeCase(ServiceCaseStatus.IN_REPAIR);
    sc.technician = null as unknown as typeof sc.technician;
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(sc);

    await expect(
      addRepairEvent(
        "case-1",
        { eventType: RepairEventType.NOTE, description: "Note" },
        adminActor,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws NotFoundError when case missing", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);
    await expect(
      addRepairEvent("missing", { eventType: RepairEventType.NOTE, description: "x" }, adminActor),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
