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

  useEffect(() => { fetchCase(); }, [fetchCase]);

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

        <div className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
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
        </div>

        {sc.intakeCondition && (
          <div className="bg-plate border border-border" style={{ padding: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
            <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-2)" }}>
              Intake Condition
            </p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)", whiteSpace: "pre-wrap" }}>{sc.intakeCondition}</p>
          </div>
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
          <div className="bg-plate border border-border" style={{ padding: "var(--w-s-5)" }}>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-subsection)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>Update Status</h2>
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
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
