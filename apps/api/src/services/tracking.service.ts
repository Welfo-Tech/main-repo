import { prisma } from "@repo/db";

export interface TimelineStep {
  key: string;
  label: string;
  state: "done" | "current" | "upcoming";
  at: Date | null;
}

export interface TrackingResult {
  found: boolean;
  reference?: string;
  instrument?: string;
  serialNumber?: string;
  submittedAt?: Date;
  caseNumber?: string | null;
  headline?: string;
  timeline?: TimelineStep[];
}

const CASE_PROGRESS: Record<string, number> = {
  INTAKE: 2,
  ASSIGNED: 3,
  UNDER_ASSESSMENT: 3,
  AWAITING_QUOTE_APPROVAL: 4,
  WORK_AUTHORIZED: 4,
  IN_REPAIR: 5,
  QC_PENDING: 6,
  QC_FAILED: 5,
  QC_PASSED: 6,
  DISPATCH_READY: 7,
  DISPATCHED: 7,
  CLOSED: 8,
  CANCELLED: 8,
  ON_HOLD: 4,
};

const STEPS = [
  { key: "received", label: "Request received" },
  { key: "acknowledged", label: "Reviewed by our team" },
  { key: "case_opened", label: "Service case opened" },
  { key: "assigned", label: "Assigned to a technician" },
  { key: "assessed", label: "Assessed and quoted" },
  { key: "in_repair", label: "In repair" },
  { key: "qc", label: "Quality check" },
  { key: "dispatched", label: "On its way back" },
  { key: "closed", label: "Completed" },
];

function buildTimeline(
  reached: number,
  submittedAt: Date,
  caseCreatedAt: Date | null,
  closedAt: Date | null,
): TimelineStep[] {
  return STEPS.map((s, i) => {
    let at: Date | null = null;
    if (i === 0) at = submittedAt;
    else if (i === 2 && caseCreatedAt) at = caseCreatedAt;
    else if (i === STEPS.length - 1 && closedAt) at = closedAt;

    const state: TimelineStep["state"] =
      i < reached ? "done" : i === reached ? "current" : "upcoming";
    return { ...s, state, at };
  });
}

export async function trackRequest(
  reference: string,
  email: string,
): Promise<TrackingResult> {
  const inquiry = await prisma.webInquiry.findUnique({
    where: { inquiryNumber: reference.trim().toUpperCase() },
    select: {
      inquiryNumber: true,
      submitterEmail: true,
      serialNumber: true,
      status: true,
      submittedAt: true,
      convertedCaseId: true,
      product: { select: { model: { select: { name: true } } } },
    },
  });

  if (!inquiry) return { found: false };
  if (inquiry.submitterEmail.toLowerCase() !== email.trim().toLowerCase()) {
    return { found: false };
  }

  let reached = inquiry.status === "PENDING" ? 0 : 1;
  let caseNumber: string | null = null;
  let caseCreatedAt: Date | null = null;
  let closedAt: Date | null = null;
  let headline = "We have your request and will be in touch shortly.";

  if (inquiry.convertedCaseId) {
    const sc = await prisma.serviceCase.findUnique({
      where: { id: inquiry.convertedCaseId },
      select: {
        caseNumber: true,
        status: true,
        createdAt: true,
        closedAt: true,
        assignedTechnicianId: true,
      },
    });

    if (sc) {
      caseNumber = sc.caseNumber;
      caseCreatedAt = sc.createdAt;
      closedAt = sc.closedAt;
      reached = CASE_PROGRESS[sc.status] ?? 2;
      if (reached === 2 && sc.assignedTechnicianId) reached = 3;

      headline =
        sc.status === "CLOSED"
          ? "This repair is complete."
          : sc.status === "CANCELLED"
            ? "This case was closed without repair. Please contact us if that is unexpected."
            : "Your instrument is with our service team.";
    }
  }

  return {
    found: true,
    reference: inquiry.inquiryNumber,
    instrument: inquiry.product.model?.name ?? "Registered instrument",
    serialNumber: inquiry.serialNumber,
    submittedAt: inquiry.submittedAt,
    caseNumber,
    headline,
    timeline: buildTimeline(reached, inquiry.submittedAt, caseCreatedAt, closedAt),
  };
}
