export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  INTAKE: "Intake",
  ASSIGNED: "Assigned to you",
  UNDER_ASSESSMENT: "Under assessment",
  AWAITING_QUOTE_APPROVAL: "Awaiting quote approval",
  WORK_AUTHORIZED: "Work authorised",
  IN_REPAIR: "In repair",
  QC_PENDING: "Awaiting QC",
  QC_PASSED: "QC passed",
  QC_FAILED: "QC failed",
  DISPATCH_READY: "Ready to dispatch",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
  CLOSED: "Closed",
  ON_HOLD: "On hold",
  IRREPAIRABLE: "Irreparable",
  QUOTE_REJECTED: "Quote rejected",
  CANCELLED: "Cancelled",
};

type Tone = "neutral" | "active" | "waiting" | "good" | "bad";

const TONE: Record<string, Tone> = {
  ASSIGNED: "active",
  UNDER_ASSESSMENT: "active",
  WORK_AUTHORIZED: "active",
  IN_REPAIR: "active",
  AWAITING_QUOTE_APPROVAL: "waiting",
  QC_PENDING: "waiting",
  ON_HOLD: "waiting",
  QC_PASSED: "good",
  DISPATCH_READY: "good",
  DISPATCHED: "good",
  DELIVERED: "good",
  CLOSED: "neutral",
  QC_FAILED: "bad",
  IRREPAIRABLE: "bad",
  CANCELLED: "neutral",
};

const TONE_STYLE: Record<Tone, { background: string; color: string; border: string }> = {
  neutral: { background: "var(--w-sunken)", color: "var(--w-text-2)", border: "1px solid var(--w-border)" },
  active:  { background: "var(--w-accent-tint)", color: "var(--w-ink)", border: "1px solid rgba(43,22,115,0.2)" },
  waiting: { background: "var(--w-warn-tint)", color: "#573b0c", border: "1px solid var(--w-warn-edge)" },
  good:    { background: "var(--w-brand-tint)", color: "#14492a", border: "1px solid #b6ddc2" },
  bad:     { background: "var(--w-danger-tint)", color: "var(--w-danger-fg)", border: "1px solid var(--w-danger-edge)" },
};

export function statusStyle(status: string) {
  return TONE_STYLE[TONE[status] ?? "neutral"];
}

/** Mirrors the server's technician transition map. The server is authoritative. */
export const TECH_TRANSITIONS: Record<string, string[]> = {
  ASSIGNED: ["UNDER_ASSESSMENT"],
  UNDER_ASSESSMENT: ["ON_HOLD"],
  WORK_AUTHORIZED: ["IN_REPAIR"],
  IN_REPAIR: ["QC_PENDING", "ON_HOLD"],
  QC_FAILED: ["IN_REPAIR"],
  ON_HOLD: ["UNDER_ASSESSMENT", "IN_REPAIR"],
};

export const ACTION_LABEL: Record<string, string> = {
  UNDER_ASSESSMENT: "Start assessment",
  IN_REPAIR: "Start repair",
  QC_PENDING: "Send for QC",
  ON_HOLD: "Put on hold",
};

export const EVENT_TYPES = [
  { value: "OBSERVATION", label: "Observation" },
  { value: "FAULT_IDENTIFIED", label: "Fault identified" },
  { value: "PART_REPLACED", label: "Part replaced" },
  { value: "TEST_PERFORMED", label: "Test performed" },
  { value: "CORRECTION", label: "Correction" },
  { value: "NOTE", label: "Note" },
];

export const IRREPARABLE_LABEL: Record<string, string> = {
  PROPOSED: "Irreparable — awaiting verdict",
  CONFIRMED: "Confirmed irreparable",
  SECOND_CHANCE: "Irreparable flagged — second chance granted",
  WITHDRAWN: "Irreparable flag withdrawn",
};
