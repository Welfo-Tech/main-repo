import { ServiceCaseStatus, UserRole } from "@repo/db";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, ValidationError } from "../lib/errors.js";
import * as attachmentRepo from "../repositories/attachment.repository.js";
import * as techRepo from "../repositories/technician.repository.js";
import * as caseService from "./service-case.service.js";
import {
  advanceCaseStatus,
  allowedTransitionsFor,
  proposeIrreparable,
  ruleOnIrreparable,
} from "./technician-workbench.service.js";

vi.mock("../repositories/attachment.repository.js");
vi.mock("../repositories/technician.repository.js");
vi.mock("./service-case.service.js");

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: { serviceCase: { update: vi.fn(), groupBy: vi.fn() } },
}));
vi.mock("@repo/db", async importOriginal => ({
  ...(await importOriginal<typeof import("@repo/db")>()),
  prisma: prismaMock,
}));

const techActor = { id: "tech-user-1", role: UserRole.TECHNICIAN };
const adminActor = { id: "admin-1", role: UserRole.ADMIN };

const mockTech = {
  id: "tech-1",
  employeeId: "EMP-001",
  phone: null,
  specializations: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: "tech-user-1", name: "Ravi Sharma", email: "tech@welfo.local" },
};

function caseWith(over: Record<string, unknown> = {}) {
  return {
    id: "case-1",
    caseNumber: "WFC-2026-0001",
    status: ServiceCaseStatus.IN_REPAIR,
    irreparableState: null,
    technician: { id: "tech-1", user: { id: "tech-user-1", name: "Ravi Sharma" } },
    ...over,
  } as never;
}

const photo = {
  id: "att-1",
  entityType: "ServiceCase",
  entityId: "case-1",
  category: "DIAGNOSIS_PHOTO" as const,
  fileUrl: "https://s/p.jpg",
  fileName: "p.jpg",
  mimeType: "image/jpeg",
  fileSizeBytes: null,
  uploadedAt: new Date(),
  uploader: { id: "tech-user-1", name: "Ravi Sharma", role: UserRole.TECHNICIAN },
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.serviceCase.update.mockResolvedValue({ id: "case-1" });
});

describe("allowedTransitionsFor", () => {
  it("lets a technician start assessment and repair", () => {
    expect(allowedTransitionsFor(ServiceCaseStatus.ASSIGNED)).toContain("UNDER_ASSESSMENT");
    expect(allowedTransitionsFor(ServiceCaseStatus.WORK_AUTHORIZED)).toContain("IN_REPAIR");
    expect(allowedTransitionsFor(ServiceCaseStatus.IN_REPAIR)).toContain("QC_PENDING");
  });

  it("never lets a technician reach commercial or terminal states", () => {
    const everything = Object.values(ServiceCaseStatus).flatMap(allowedTransitionsFor);
    for (const forbidden of ["WORK_AUTHORIZED", "QC_PASSED", "DISPATCHED", "CLOSED", "CANCELLED", "IRREPAIRABLE"]) {
      expect(everything).not.toContain(forbidden);
    }
  });
});

describe("advanceCaseStatus", () => {
  it("allows a permitted transition", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ status: ServiceCaseStatus.IN_REPAIR }),
    );
    await advanceCaseStatus("case-1", ServiceCaseStatus.QC_PENDING, undefined, techActor);
    expect(prismaMock.serviceCase.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "QC_PENDING" }) }),
    );
  });

  it("refuses a transition outside the map", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ status: ServiceCaseStatus.IN_REPAIR }),
    );
    await expect(
      advanceCaseStatus("case-1", ServiceCaseStatus.CLOSED, undefined, techActor),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.serviceCase.update).not.toHaveBeenCalled();
  });

  it("requires a reason when putting a case on hold", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ status: ServiceCaseStatus.IN_REPAIR }),
    );
    await expect(
      advanceCaseStatus("case-1", ServiceCaseStatus.ON_HOLD, "   ", techActor),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("proposeIrreparable", () => {
  it("requires at least one diagnosis photo as evidence", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(caseWith());
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTech);
    vi.mocked(attachmentRepo.findCaseAttachments).mockResolvedValue([]);

    await expect(
      proposeIrreparable("case-1", "Objective lens shattered beyond repair", techActor),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(prismaMock.serviceCase.update).not.toHaveBeenCalled();
  });

  it("records the proposal when evidence exists", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(caseWith());
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTech);
    vi.mocked(attachmentRepo.findCaseAttachments).mockResolvedValue([photo]);

    await proposeIrreparable("case-1", "Objective lens shattered beyond repair", techActor);

    expect(prismaMock.serviceCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          irreparableState: "PROPOSED",
          irreparableProposedBy: "tech-1",
        }),
      }),
    );
  });

  it("refuses a second proposal while one is pending", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ irreparableState: "PROPOSED" }),
    );
    vi.mocked(techRepo.findTechnicianByUserId).mockResolvedValue(mockTech);

    await expect(
      proposeIrreparable("case-1", "Still broken, same as before", techActor),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

describe("ruleOnIrreparable", () => {
  it("confirming makes the case irreparable", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ irreparableState: "PROPOSED" }),
    );

    await ruleOnIrreparable("case-1", "CONFIRMED", "Agreed, beyond economic repair", adminActor);

    expect(prismaMock.serviceCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ irreparableState: "CONFIRMED", status: "IRREPAIRABLE" }),
      }),
    );
  });

  it("a second chance resumes repair while the flag stands", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ irreparableState: "PROPOSED" }),
    );

    await ruleOnIrreparable("case-1", "SECOND_CHANCE", "Try a donor lens", adminActor);

    expect(prismaMock.serviceCase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ irreparableState: "SECOND_CHANCE", status: "IN_REPAIR" }),
      }),
    );
  });

  it("a technician cannot rule on their own proposal", async () => {
    await expect(
      ruleOnIrreparable("case-1", "CONFIRMED", undefined, techActor),
    ).rejects.toBeInstanceOf(ForbiddenError);
    expect(prismaMock.serviceCase.update).not.toHaveBeenCalled();
  });

  it("refuses a verdict when nothing was proposed", async () => {
    vi.mocked(caseService.requireCaseForActor).mockResolvedValue(
      caseWith({ irreparableState: null }),
    );
    await expect(
      ruleOnIrreparable("case-1", "CONFIRMED", undefined, adminActor),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
