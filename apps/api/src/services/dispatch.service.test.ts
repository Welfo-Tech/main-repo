import { DispatchDirection, DispatchStatus, ServiceCaseStatus, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError, ValidationError } from "../lib/errors.js";
import * as dispatchRepo from "../repositories/dispatch.repository.js";
import * as caseRepo from "../repositories/service-case.repository.js";
import { createCaseDispatch, listDispatches, updateCaseDispatch } from "./dispatch.service.js";

vi.mock("../repositories/dispatch.repository.js");
vi.mock("../repositories/service-case.repository.js");

const actor = { id: "user-1", role: UserRole.ADMIN };

function makeCase() {
  return {
    id: "case-1",
    caseNumber: "WFC-2026-0001",
    type: "REPAIR" as const,
    status: ServiceCaseStatus.DISPATCH_READY,
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
    product: { id: "p1", serialNumber: "WF-001", model: { id: "m1", name: "CF-HQ190L", category: "ENDOSCOPE" as const } },
    technician: null,
    ticket: null,
  };
}

const mockDispatch = {
  id: "dispatch-1",
  caseId: "case-1",
  direction: DispatchDirection.OUTBOUND,
  courierName: "BlueDart",
  trackingNumber: "BD123456",
  dispatchDate: new Date("2026-08-27"),
  expectedDelivery: new Date("2026-08-29"),
  actualDelivery: null,
  fromAddress: null,
  toAddress: null,
  conditionNotes: null,
  status: DispatchStatus.PENDING,
};

beforeEach(() => vi.clearAllMocks());

describe("listDispatches", () => {
  it("returns dispatches for a valid case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase());
    vi.mocked(dispatchRepo.findDispatchesByCaseId).mockResolvedValue([mockDispatch]);

    const result = await listDispatches("case-1", actor);
    expect(result).toHaveLength(1);
    expect(result[0]!.trackingNumber).toBe("BD123456");
  });

  it("throws NotFoundError when case missing", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);
    await expect(listDispatches("missing", actor)).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("createCaseDispatch", () => {
  it("creates a dispatch for a valid case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase());
    vi.mocked(dispatchRepo.createDispatch).mockResolvedValue(mockDispatch);

    const result = await createCaseDispatch(
      "case-1",
      { direction: DispatchDirection.OUTBOUND, courierName: "BlueDart", trackingNumber: "BD123456" },
      actor,
    );
    expect(result.direction).toBe(DispatchDirection.OUTBOUND);
  });

  it("throws NotFoundError when case missing", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(null);
    await expect(
      createCaseDispatch("missing", { direction: DispatchDirection.OUTBOUND }, actor),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("updateCaseDispatch", () => {
  it("allows valid status transition", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase());
    vi.mocked(dispatchRepo.findDispatchById).mockResolvedValue(mockDispatch);
    vi.mocked(dispatchRepo.updateDispatch).mockResolvedValue({
      ...mockDispatch,
      status: DispatchStatus.DISPATCHED,
    });

    const result = await updateCaseDispatch("case-1", "dispatch-1", { status: DispatchStatus.DISPATCHED }, actor);
    expect(result.status).toBe(DispatchStatus.DISPATCHED);
  });

  it("throws ValidationError for invalid status transition", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase());
    vi.mocked(dispatchRepo.findDispatchById).mockResolvedValue(mockDispatch);

    await expect(
      updateCaseDispatch("case-1", "dispatch-1", { status: DispatchStatus.DELIVERED }, actor),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("throws NotFoundError when dispatch belongs to different case", async () => {
    vi.mocked(caseRepo.findCaseById).mockResolvedValue(makeCase());
    vi.mocked(dispatchRepo.findDispatchById).mockResolvedValue({
      ...mockDispatch,
      caseId: "other-case",
    });

    await expect(
      updateCaseDispatch("case-1", "dispatch-1", { status: DispatchStatus.DISPATCHED }, actor),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
