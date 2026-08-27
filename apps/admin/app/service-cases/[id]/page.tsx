"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import PriorityBar from "../../../components/common/PriorityBar";
import { api } from "../../../lib/api";
import type { ServiceCase, ServiceCaseStatus } from "../../../types/service-case";
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from "../../../types/service-case";
import type {
  DispatchRecord,
  DispatchStatus,
  RepairEvent,
  RepairEventType,
  Technician,
} from "../../../types/technician";
import {
  DISPATCH_STATUS_LABELS,
  DISPATCH_STATUS_TRANSITIONS,
  REPAIR_EVENT_LABELS,
} from "../../../types/technician";

const STATUS_TRANSITIONS: Record<ServiceCaseStatus, ServiceCaseStatus[]> = {
  DRAFT: ["INTAKE", "CANCELLED"],
  INTAKE: ["ASSIGNED", "ON_HOLD", "CANCELLED"],
  ASSIGNED: ["UNDER_ASSESSMENT", "ON_HOLD", "CANCELLED"],
  UNDER_ASSESSMENT: ["AWAITING_QUOTE_APPROVAL", "WORK_AUTHORIZED", "IRREPAIRABLE", "ON_HOLD", "CANCELLED"],
  AWAITING_QUOTE_APPROVAL: ["WORK_AUTHORIZED", "QUOTE_REJECTED", "ON_HOLD", "CANCELLED"],
  WORK_AUTHORIZED: ["IN_REPAIR", "ON_HOLD", "CANCELLED"],
  IN_REPAIR: ["QC_PENDING", "ON_HOLD"],
  QC_PENDING: ["QC_PASSED", "QC_FAILED"],
  QC_PASSED: ["DISPATCH_READY"],
  QC_FAILED: ["IN_REPAIR", "IRREPAIRABLE"],
  DISPATCH_READY: ["DISPATCHED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: ["CLOSED"],
  CLOSED: [],
  ON_HOLD: ["ASSIGNED", "IN_REPAIR", "CANCELLED"],
  IRREPAIRABLE: ["CLOSED"],
  QUOTE_REJECTED: ["CANCELLED", "CLOSED"],
  CANCELLED: [],
};

const WORKABLE_STATUSES = new Set([
  "ASSIGNED", "UNDER_ASSESSMENT", "WORK_AUTHORIZED", "IN_REPAIR", "QC_PENDING", "QC_FAILED",
]);

const inputStyle: React.CSSProperties = {
  height: "var(--w-control-h)",
  padding: "0 var(--w-s-2)",
  fontSize: "var(--w-fs-body)",
  fontFamily: "var(--w-font-body)",
  border: "1px solid var(--w-border)",
  background: "var(--w-sunken)",
  color: "var(--w-text-1)",
  borderRadius: "var(--w-radius)",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--w-fs-label)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--w-text-2)",
  display: "block",
  marginBottom: "var(--w-s-1)",
};

const sectionHeadStyle: React.CSSProperties = {
  fontSize: "var(--w-fs-subsection)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 600,
  color: "var(--w-text-1)",
  marginBottom: "var(--w-s-4)",
};

function FieldGroup({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "2px" }}>
        {label}
      </p>
      <div style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)", fontWeight: 500 }}>
        {value ?? <span style={{ color: "var(--w-text-mute)" }}>—</span>}
      </div>
    </div>
  );
}

function SectionPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
      {children}
    </div>
  );
}

function RepairEventTypeBadge({ type }: { type: RepairEventType }) {
  const COLOR_MAP: Record<RepairEventType, string> = {
    OBSERVATION:      "var(--w-neutral-fg)",
    FAULT_IDENTIFIED: "var(--w-attention-fg)",
    PART_REPLACED:    "var(--w-progress-fg)",
    TEST_PERFORMED:   "var(--w-progress-fg)",
    CORRECTION:       "var(--w-success-fg)",
    NOTE:             "var(--w-text-2)",
  };
  return (
    <span className="font-head font-semibold uppercase" style={{
      fontSize: "var(--w-fs-eyebrow)",
      letterSpacing: "0.06em",
      color: COLOR_MAP[type] ?? "var(--w-text-2)",
    }}>
      {REPAIR_EVENT_LABELS[type]}
    </span>
  );
}

export default function ServiceCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sc, setSc] = useState<ServiceCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ServiceCaseStatus | "">("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [holdReason, setHoldReason] = useState("");

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [assignReason, setAssignReason] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");

  const [repairEvents, setRepairEvents] = useState<RepairEvent[]>([]);
  const [repairLoading, setRepairLoading] = useState(false);
  const [newEventType, setNewEventType] = useState<RepairEventType>("OBSERVATION");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [addingEvent, setAddingEvent] = useState(false);
  const [addEventError, setAddEventError] = useState("");

  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [newDispatch, setNewDispatch] = useState({ direction: "INBOUND" as "INBOUND" | "OUTBOUND", courierName: "", trackingNumber: "", conditionNotes: "" });
  const [addingDispatch, setAddingDispatch] = useState(false);
  const [addDispatchError, setAddDispatchError] = useState("");

  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<ServiceCase>(`/api/v1/service-cases/${id}`);
      setSc(data);
      setSelectedStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchRepairEvents = useCallback(async () => {
    setRepairLoading(true);
    try {
      const data = await api.get<RepairEvent[]>(`/api/v1/service-cases/${id}/repair-events`);
      setRepairEvents(data);
    } catch {
      // non-critical, silently fail
    } finally {
      setRepairLoading(false);
    }
  }, [id]);

  const fetchDispatches = useCallback(async () => {
    setDispatchLoading(true);
    try {
      const data = await api.get<DispatchRecord[]>(`/api/v1/service-cases/${id}/dispatches`);
      setDispatches(data);
    } catch {
      // non-critical
    } finally {
      setDispatchLoading(false);
    }
  }, [id]);

  const fetchTechnicians = useCallback(async () => {
    try {
      const data = await api.get<Technician[]>("/api/v1/technicians?isActive=true");
      setTechnicians(data);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchCase();
    fetchRepairEvents();
    fetchDispatches();
    fetchTechnicians();
  }, [fetchCase, fetchRepairEvents, fetchDispatches, fetchTechnicians]);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;
    setUpdating(true);
    setUpdateError("");
    try {
      await api.patch(`/api/v1/service-cases/${id}`, {
        status: selectedStatus,
        ...(selectedStatus === "CANCELLED" && cancellationReason ? { cancellationReason } : {}),
        ...(selectedStatus === "ON_HOLD" && holdReason ? { holdReason } : {}),
      });
      await fetchCase();
      setCancellationReason("");
      setHoldReason("");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTechId) return;
    setAssigning(true);
    setAssignError("");
    try {
      await api.post(`/api/v1/service-cases/${id}/assign`, {
        technicianId: selectedTechId,
        ...(assignReason ? { reason: assignReason } : {}),
      });
      await fetchCase();
      setSelectedTechId("");
      setAssignReason("");
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : "Failed to assign technician");
    } finally {
      setAssigning(false);
    }
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!newEventDesc.trim()) return;
    setAddingEvent(true);
    setAddEventError("");
    try {
      await api.post(`/api/v1/service-cases/${id}/repair-events`, {
        eventType: newEventType,
        description: newEventDesc.trim(),
      });
      setNewEventDesc("");
      setNewEventType("OBSERVATION");
      await fetchRepairEvents();
    } catch (err) {
      setAddEventError(err instanceof Error ? err.message : "Failed to add event");
    } finally {
      setAddingEvent(false);
    }
  }

  async function handleAddDispatch(e: React.FormEvent) {
    e.preventDefault();
    setAddingDispatch(true);
    setAddDispatchError("");
    try {
      await api.post(`/api/v1/service-cases/${id}/dispatches`, {
        direction: newDispatch.direction,
        ...(newDispatch.courierName ? { courierName: newDispatch.courierName } : {}),
        ...(newDispatch.trackingNumber ? { trackingNumber: newDispatch.trackingNumber } : {}),
        ...(newDispatch.conditionNotes ? { conditionNotes: newDispatch.conditionNotes } : {}),
      });
      setNewDispatch({ direction: "INBOUND", courierName: "", trackingNumber: "", conditionNotes: "" });
      setShowDispatchForm(false);
      await fetchDispatches();
    } catch (err) {
      setAddDispatchError(err instanceof Error ? err.message : "Failed to create dispatch");
    } finally {
      setAddingDispatch(false);
    }
  }

  async function handleUpdateDispatch(dispatchId: string, status: DispatchStatus) {
    try {
      await api.patch(`/api/v1/service-cases/${id}/dispatches/${dispatchId}`, { status });
      await fetchDispatches();
    } catch {
      // silently fail for now, page will re-fetch on next action
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div style={{ padding: "var(--w-s-6)", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</div>
      </AdminLayout>
    );
  }

  if (error || !sc) {
    return (
      <AdminLayout>
        <div style={{ padding: "var(--w-s-6)" }}>
          <p style={{ color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "var(--w-fs-body)" }}>
            {error || "Case not found."}
          </p>
          <Link href="/service-cases" style={{ display: "inline-block", marginTop: "var(--w-s-4)", color: "var(--w-link)", fontSize: "var(--w-fs-body)", textDecoration: "none" }}>
            ← Back to Service Cases
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[sc.status] ?? [];
  const isWorkable = WORKABLE_STATUSES.has(sc.status);

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "960px" }}>

        <div className="flex items-center gap-2" style={{ marginBottom: "var(--w-s-4)" }}>
          <Link href="/service-cases" style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", textDecoration: "none" }}>Service Cases</Link>
          <span style={{ color: "var(--w-text-mute)" }}>/</span>
          <span className="w-num" style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", fontFamily: "var(--w-font-head)", fontWeight: 600 }}>{sc.caseNumber}</span>
        </div>

        <div className="flex items-start justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <h1 className="w-num font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)", fontFamily: "monospace" }}>
              {sc.caseNumber}
            </h1>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>{TYPE_LABELS[sc.type]}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge status={sc.status} variant="chip" />
            <PriorityBar priority={sc.priority} showLabel />
          </div>
        </div>

        <SectionPanel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--w-s-4)" }}>
            <FieldGroup label="Organization" value={sc.organization.name} />
            <FieldGroup label="Product" value={
              <span className="w-num" style={{ fontFamily: "monospace" }}>
                {sc.product.serialNumber}{sc.product.model ? ` · ${sc.product.model.name}` : ""}
              </span>
            } />
            <FieldGroup label="Contact" value={sc.contact ? `${sc.contact.name}${sc.contact.phone ? ` · ${sc.contact.phone}` : ""}` : null} />
            <FieldGroup label="Technician" value={sc.technician?.user.name ?? null} />
            <FieldGroup label="Billable" value={sc.isBillable ? "Yes" : "No"} />
            <FieldGroup label="SLA Deadline" value={sc.slaDeadline ? new Date(sc.slaDeadline).toLocaleDateString("en-IN") : null} />
            {sc.ticket && <FieldGroup label="From Ticket" value={sc.ticket.ticketNumber} />}
            <FieldGroup label="Opened" value={new Date(sc.createdAt).toLocaleDateString("en-IN")} />
            {sc.closedAt && <FieldGroup label="Closed" value={new Date(sc.closedAt).toLocaleDateString("en-IN")} />}
          </div>
        </SectionPanel>

        {sc.intakeCondition && (
          <SectionPanel>
            <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-2)" }}>
              Intake Condition
            </p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)", whiteSpace: "pre-wrap" }}>{sc.intakeCondition}</p>
          </SectionPanel>
        )}

        {sc.holdReason && (
          <div style={{ background: "var(--w-waiting-tint)", border: "1px solid var(--w-waiting-edge)", padding: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
            <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-waiting-fg)", letterSpacing: "0.06em", marginBottom: "var(--w-s-2)" }}>Hold Reason</p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-waiting-fg)" }}>{sc.holdReason}</p>
          </div>
        )}

        {sc.cancellationReason && (
          <div style={{ background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
            <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-attention-fg)", letterSpacing: "0.06em", marginBottom: "var(--w-s-2)" }}>Cancellation Reason</p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-attention-fg)" }}>{sc.cancellationReason}</p>
          </div>
        )}

        {nextStatuses.length > 0 && (
          <SectionPanel>
            <h2 style={sectionHeadStyle}>Update Status</h2>
            <form onSubmit={handleStatusUpdate}>
              <div className="flex flex-wrap gap-2" style={{ marginBottom: "var(--w-s-3)" }}>
                {nextStatuses.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s === selectedStatus ? "" : s)}
                    className="font-head font-semibold uppercase"
                    style={{
                      height: "var(--w-control-h)",
                      paddingInline: "var(--w-s-4)",
                      fontSize: "var(--w-fs-label)",
                      letterSpacing: "0.06em",
                      border: `1px solid ${selectedStatus === s ? "var(--w-accent-strong)" : "var(--w-border)"}`,
                      background: selectedStatus === s ? "var(--w-accent-strong)" : "transparent",
                      color: selectedStatus === s ? "#fff" : "var(--w-text-2)",
                      cursor: "pointer",
                      transition: "all var(--w-dur-fast)",
                    }}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>

              {selectedStatus === "CANCELLED" && (
                <div style={{ marginBottom: "var(--w-s-3)" }}>
                  <label style={labelStyle}>Cancellation Reason</label>
                  <textarea rows={2} value={cancellationReason} onChange={e => setCancellationReason(e.target.value)} placeholder="Why is this case being cancelled?" style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)" }} />
                </div>
              )}

              {selectedStatus === "ON_HOLD" && (
                <div style={{ marginBottom: "var(--w-s-3)" }}>
                  <label style={labelStyle}>Hold Reason</label>
                  <textarea rows={2} value={holdReason} onChange={e => setHoldReason(e.target.value)} placeholder="Why is this case being put on hold?" style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)" }} />
                </div>
              )}

              {updateError && (
                <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                  {updateError}
                </p>
              )}

              {selectedStatus && (
                <button type="submit" disabled={updating} className="font-head font-semibold uppercase"
                  style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: updating ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: updating ? "not-allowed" : "pointer" }}>
                  {updating ? "Updating…" : `Move to ${STATUS_LABELS[selectedStatus]}`}
                </button>
              )}
            </form>
          </SectionPanel>
        )}

        <SectionPanel>
          <h2 style={sectionHeadStyle}>Technician Assignment</h2>
          {sc.technician && (
            <div style={{ marginBottom: "var(--w-s-4)", padding: "var(--w-s-3) var(--w-s-4)", background: "var(--w-progress-tint)", border: "1px solid var(--w-progress-edge)" }}>
              <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-progress-fg)", letterSpacing: "0.06em", marginBottom: "2px" }}>Current Technician</p>
              <p style={{ fontSize: "var(--w-fs-body)", fontWeight: 600, color: "var(--w-text-1)" }}>{sc.technician.user.name}</p>
            </div>
          )}
          <form onSubmit={handleAssign}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
              <div>
                <label style={labelStyle}>{sc.technician ? "Reassign To" : "Assign To"}</label>
                <select
                  value={selectedTechId}
                  onChange={e => setSelectedTechId(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="">Select technician…</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>{t.user.name} ({t.employeeId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Reason (optional)</label>
                <input type="text" value={assignReason} onChange={e => setAssignReason(e.target.value)} placeholder="Why this technician?" style={inputStyle} />
              </div>
            </div>
            {assignError && (
              <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                {assignError}
              </p>
            )}
            <button type="submit" disabled={assigning || !selectedTechId} className="font-head font-semibold uppercase"
              style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: (assigning || !selectedTechId) ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: (assigning || !selectedTechId) ? "not-allowed" : "pointer" }}>
              {assigning ? "Assigning…" : sc.technician ? "Reassign" : "Assign"}
            </button>
          </form>
        </SectionPanel>

        <SectionPanel>
          <h2 style={sectionHeadStyle}>Repair Log</h2>

          {repairLoading ? (
            <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>Loading events…</p>
          ) : repairEvents.length === 0 ? (
            <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>No repair events logged yet.</p>
          ) : (
            <div style={{ marginBottom: "var(--w-s-5)" }}>
              {repairEvents.map((ev, i) => (
                <div
                  key={ev.id}
                  style={{
                    padding: "var(--w-s-3) var(--w-s-4)",
                    borderBottom: i < repairEvents.length - 1 ? "1px solid var(--w-border)" : undefined,
                  }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-1)" }}>
                    <RepairEventTypeBadge type={ev.eventType} />
                    <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", fontFamily: "var(--w-font-head)" }}>
                      {new Date(ev.eventAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                      {" · "}
                      {ev.technician.user.name}
                    </span>
                  </div>
                  <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)", whiteSpace: "pre-wrap" }}>{ev.description}</p>
                </div>
              ))}
            </div>
          )}

          {isWorkable && (
            <form onSubmit={handleAddEvent} style={{ borderTop: repairEvents.length > 0 ? "1px solid var(--w-border)" : undefined, paddingTop: repairEvents.length > 0 ? "var(--w-s-4)" : undefined }}>
              <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-3)" }}>Log New Event</p>
              <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                <div>
                  <label style={labelStyle}>Event Type</label>
                  <select value={newEventType} onChange={e => setNewEventType(e.target.value as RepairEventType)} style={{ ...inputStyle, cursor: "pointer" }}>
                    {(Object.keys(REPAIR_EVENT_LABELS) as RepairEventType[]).map(t => (
                      <option key={t} value={t}>{REPAIR_EVENT_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Description</label>
                  <textarea
                    rows={3}
                    value={newEventDesc}
                    onChange={e => setNewEventDesc(e.target.value)}
                    placeholder="Describe what was observed, done, or noted…"
                    style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)", resize: "vertical" }}
                  />
                </div>
              </div>
              {addEventError && (
                <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                  {addEventError}
                </p>
              )}
              <button type="submit" disabled={addingEvent || !newEventDesc.trim()} className="font-head font-semibold uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: (addingEvent || !newEventDesc.trim()) ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: (addingEvent || !newEventDesc.trim()) ? "not-allowed" : "pointer" }}>
                {addingEvent ? "Logging…" : "Log Event"}
              </button>
            </form>
          )}

          {!isWorkable && repairEvents.length === 0 && (
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", fontStyle: "italic" }}>
              Repair events can be logged when the case is Assigned, Under Assessment, Work Authorized, In Repair, QC Pending, or QC Failed.
            </p>
          )}
        </SectionPanel>

        <SectionPanel>
          <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-4)" }}>
            <h2 style={{ ...sectionHeadStyle, marginBottom: 0 }}>Dispatches</h2>
            {!showDispatchForm && (
              <button
                onClick={() => setShowDispatchForm(true)}
                className="font-head font-semibold uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", border: "1px solid var(--w-border)", background: "transparent", color: "var(--w-text-2)", cursor: "pointer" }}
              >
                + Add Dispatch
              </button>
            )}
          </div>

          {dispatchLoading ? (
            <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading dispatches…</p>
          ) : dispatches.length === 0 ? (
            <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)", marginBottom: showDispatchForm ? "var(--w-s-4)" : undefined }}>No dispatch records yet.</p>
          ) : (
            <div style={{ marginBottom: "var(--w-s-4)", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--w-border)" }}>
                <thead>
                  <tr style={{ background: "var(--w-sunken)" }}>
                    {["Direction", "Status", "Courier", "Tracking", "Dispatched", "Expected", "Delivered", "Actions"].map(h => (
                      <th key={h} style={{ fontSize: "var(--w-fs-eyebrow)", fontFamily: "var(--w-font-head)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--w-text-2)", padding: "0 var(--w-s-3)", height: "var(--w-row-h)", borderBottom: "1px solid var(--w-border)", textAlign: "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map(d => {
                    const nextStatuses = DISPATCH_STATUS_TRANSITIONS[d.status] ?? [];
                    return (
                      <tr key={d.id}>
                        <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", borderBottom: "1px solid var(--w-border)", whiteSpace: "nowrap" }}>
                          <span className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", letterSpacing: "0.06em", color: d.direction === "INBOUND" ? "var(--w-progress-fg)" : "var(--w-success-fg)" }}>
                            {d.direction}
                          </span>
                        </td>
                        <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", borderBottom: "1px solid var(--w-border)" }}>
                          <StatusBadge status={d.status} />
                        </td>
                        <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", borderBottom: "1px solid var(--w-border)" }}>
                          {d.courierName ?? <span style={{ color: "var(--w-text-mute)" }}>—</span>}
                        </td>
                        <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", borderBottom: "1px solid var(--w-border)" }}>
                          {d.trackingNumber
                            ? <span className="w-num" style={{ fontFamily: "monospace", fontSize: "var(--w-fs-cell)" }}>{d.trackingNumber}</span>
                            : <span style={{ color: "var(--w-text-mute)" }}>—</span>}
                        </td>
                        {[d.dispatchDate, d.expectedDelivery, d.actualDelivery].map((dt, i) => (
                          <td key={i} style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", borderBottom: "1px solid var(--w-border)", whiteSpace: "nowrap" }}>
                            {dt ? new Date(dt).toLocaleDateString("en-IN") : <span style={{ color: "var(--w-text-mute)" }}>—</span>}
                          </td>
                        ))}
                        <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", borderBottom: "1px solid var(--w-border)" }}>
                          <div className="flex gap-1">
                            {nextStatuses.map(ns => (
                              <button
                                key={ns}
                                onClick={() => handleUpdateDispatch(d.id, ns)}
                                className="font-head font-semibold uppercase"
                                style={{ height: "24px", paddingInline: "var(--w-s-2)", fontSize: "10px", letterSpacing: "0.06em", border: "1px solid var(--w-border)", background: "transparent", color: "var(--w-text-2)", cursor: "pointer" }}
                              >
                                {DISPATCH_STATUS_LABELS[ns]}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {showDispatchForm && (
            <form onSubmit={handleAddDispatch} style={{ borderTop: dispatches.length > 0 ? "1px solid var(--w-border)" : undefined, paddingTop: dispatches.length > 0 ? "var(--w-s-4)" : undefined }}>
              <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-3)" }}>New Dispatch Record</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                <div>
                  <label style={labelStyle}>Direction</label>
                  <select value={newDispatch.direction} onChange={e => setNewDispatch(p => ({ ...p, direction: e.target.value as "INBOUND" | "OUTBOUND" }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    <option value="INBOUND">Inbound (Customer → Welfo)</option>
                    <option value="OUTBOUND">Outbound (Welfo → Customer)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Courier Name</label>
                  <input type="text" value={newDispatch.courierName} onChange={e => setNewDispatch(p => ({ ...p, courierName: e.target.value }))} placeholder="e.g. DTDC, BlueDart" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Tracking Number</label>
                  <input type="text" value={newDispatch.trackingNumber} onChange={e => setNewDispatch(p => ({ ...p, trackingNumber: e.target.value }))} placeholder="AWB / consignment number" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: "var(--w-s-3)" }}>
                <label style={labelStyle}>Condition Notes</label>
                <textarea rows={2} value={newDispatch.conditionNotes} onChange={e => setNewDispatch(p => ({ ...p, conditionNotes: e.target.value }))} placeholder="Packaging condition, visible damage, special notes…" style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)" }} />
              </div>
              {addDispatchError && (
                <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                  {addDispatchError}
                </p>
              )}
              <div className="flex gap-2">
                <button type="submit" disabled={addingDispatch} className="font-head font-semibold uppercase"
                  style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: addingDispatch ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: addingDispatch ? "not-allowed" : "pointer" }}>
                  {addingDispatch ? "Creating…" : "Create Record"}
                </button>
                <button type="button" onClick={() => setShowDispatchForm(false)} className="font-head font-semibold uppercase"
                  style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", border: "1px solid var(--w-border)", background: "transparent", color: "var(--w-text-2)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </SectionPanel>

      </div>
    </AdminLayout>
  );
}
