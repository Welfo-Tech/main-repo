import { prisma } from "@repo/db";
import { config } from "../config.js";
import { queueMail } from "../lib/mailer.js";
import { logger } from "../logger.js";

async function technicianContact(technicianId: string) {
  const tech = await prisma.technician.findUnique({
    where: { id: technicianId },
    select: { user: { select: { name: true, email: true } } },
  });
  return tech?.user ?? null;
}

async function staffEmails(): Promise<string[]> {
  const staff = await prisma.user.findMany({
    where: { isActive: true, role: { in: ["ADMIN", "OPERATIONS"] } },
    select: { email: true },
  });
  return staff.map(s => s.email);
}

function caseUrl(caseId: string) {
  return `${config.APP_TECH_URL.replace(/\/$/, "")}/cases/${caseId}`;
}

/**
 * Every notify* function swallows its own errors. A failed email must never
 * roll back the assignment or verdict that triggered it.
 */
function safely(label: string, fn: () => Promise<void>) {
  void fn().catch(err => logger.warn({ err, label }, "notification failed"));
}

export function notifyCaseAssigned(caseId: string, caseNumber: string, technicianId: string) {
  safely("case-assigned", async () => {
    const who = await technicianContact(technicianId);
    if (!who) return;

    queueMail({
      to: who.email,
      subject: `New case assigned — ${caseNumber}`,
      heading: `${caseNumber} has been assigned to you`,
      lines: [
        `Hello ${who.name},`,
        "A service case has been assigned to you. Open it to see the instrument, the reported fault and any photos the customer sent.",
      ],
      action: { label: "Open the case", url: caseUrl(caseId) },
    });
  });
}

export function notifyStatusChanged(
  caseId: string,
  caseNumber: string,
  technicianId: string | null,
  status: string,
) {
  if (!technicianId) return;

  // Only states the technician must act on. Anything else is noise, and a
  // technician who gets mail for their own entries stops reading them.
  const actionable: Record<string, { subject: string; line: string }> = {
    WORK_AUTHORIZED: {
      subject: "Work authorised",
      line: "The quote was approved and repair work is authorised. You can begin.",
    },
    QC_FAILED: {
      subject: "QC failed — rework needed",
      line: "This case did not pass quality check and has come back to you.",
    },
  };

  const entry = actionable[status];
  if (!entry) return;

  safely("status-changed", async () => {
    const who = await technicianContact(technicianId);
    if (!who) return;

    queueMail({
      to: who.email,
      subject: `${entry.subject} — ${caseNumber}`,
      heading: `${caseNumber}: ${entry.subject.toLowerCase()}`,
      lines: [`Hello ${who.name},`, entry.line],
      action: { label: "Open the case", url: caseUrl(caseId) },
    });
  });
}

export function notifyIrreparableProposed(
  caseId: string,
  caseNumber: string,
  technicianName: string,
  reason: string,
) {
  safely("irreparable-proposed", async () => {
    for (const email of await staffEmails()) {
      queueMail({
        to: email,
        subject: `Irreparable proposed — ${caseNumber}`,
        heading: `${technicianName} has flagged ${caseNumber} as irreparable`,
        lines: [
          `Reason given: ${reason}`,
          "Diagnosis photos are attached to the case. Review them and either confirm the verdict or give the instrument a chance.",
        ],
        action: { label: "Review the case", url: caseUrl(caseId) },
      });
    }
  });
}

export function notifyIrreparableVerdict(
  caseId: string,
  caseNumber: string,
  technicianId: string | null,
  verdict: "CONFIRMED" | "SECOND_CHANCE",
  note: string | null,
) {
  if (!technicianId) return;

  safely("irreparable-verdict", async () => {
    const who = await technicianContact(technicianId);
    if (!who) return;

    const confirmed = verdict === "CONFIRMED";
    queueMail({
      to: who.email,
      subject: confirmed
        ? `Irreparable confirmed — ${caseNumber}`
        : `Second chance granted — ${caseNumber}`,
      heading: confirmed
        ? `${caseNumber} is confirmed irreparable`
        : `${caseNumber} has been given a second chance`,
      lines: [
        `Hello ${who.name},`,
        confirmed
          ? "Your assessment was confirmed. No further repair work is needed on this instrument."
          : "Your irreparable assessment stands on the record, but we would like one more attempt before writing the instrument off.",
        ...(note ? [`Note from the office: ${note}`] : []),
      ],
      action: { label: "Open the case", url: caseUrl(caseId) },
    });
  });
}

export function notifyQcPending(caseId: string, caseNumber: string, technicianName: string) {
  safely("qc-pending", async () => {
    for (const email of await staffEmails()) {
      queueMail({
        to: email,
        subject: `Ready for QC — ${caseNumber}`,
        heading: `${technicianName} has finished work on ${caseNumber}`,
        lines: ["The case is now awaiting quality check."],
        action: { label: "Open the case", url: caseUrl(caseId) },
      });
    }
  });
}
