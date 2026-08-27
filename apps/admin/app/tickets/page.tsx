"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PriorityBar from "../../components/common/PriorityBar";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../lib/api";
import type { Organization } from "../../types/organization";
import type { Ticket, TicketStatus, TicketUrgency } from "../../types/ticket";
import { STATUS_LABELS, URGENCY_LABELS } from "../../types/ticket";

const ALL_STATUSES: TicketStatus[] = ["OPEN", "INTAKE_RECEIVED", "CONVERTED", "REJECTED", "DEFERRED"];
const ALL_URGENCIES: TicketUrgency[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

const emptyForm = { organizationId: "", reportedProblem: "", urgency: "NORMAL" as TicketUrgency };

const TICKET_STATUS_TO_CATEGORY: Record<TicketStatus, string> = {
  OPEN: "OPEN",
  INTAKE_RECEIVED: "PENDING",
  CONVERTED: "CONVERTED",
  REJECTED: "REJECTED",
  DEFERRED: "ON_HOLD",
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

const TH_STYLE: React.CSSProperties = {
  fontSize: "var(--w-fs-eyebrow)",
  fontFamily: "var(--w-font-head)",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.09em",
  color: "var(--w-text-2)",
  padding: "0 var(--w-s-3)",
  height: "var(--w-row-h)",
  borderBottom: "1px solid var(--w-border)",
  textAlign: "left",
  whiteSpace: "nowrap" as const,
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "">("");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      const data = await api.get<Ticket[]>(`/api/v1/tickets${qs ? `?${qs}` : ""}`);
      setTickets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  async function openForm() {
    setShowForm(true);
    setFormError("");
    try {
      const data = await api.get<Organization[]>("/api/v1/organizations?isActive=true");
      setOrgs(data);
    } catch {
      setOrgs([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organizationId) { setFormError("Organization is required."); return; }
    if (!form.reportedProblem.trim()) { setFormError("Problem description is required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/v1/tickets", {
        organizationId: form.organizationId,
        reportedProblem: form.reportedProblem.trim(),
        urgency: form.urgency,
      });
      setForm(emptyForm);
      setShowForm(false);
      await fetchTickets();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to open ticket");
    } finally {
      setSubmitting(false);
    }
  }

  const btnBase: React.CSSProperties = { height: "24px", paddingInline: "var(--w-s-3)", fontSize: "var(--w-fs-eyebrow)", fontFamily: "var(--w-font-head)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", border: "1px solid var(--w-border)" };

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "var(--w-page-max)" }}>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>Tickets</h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              {loading ? "Loading…" : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={() => showForm ? setShowForm(false) : openForm()} className="font-head font-semibold uppercase"
            style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Open Ticket"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>Open New Ticket</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-4)" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Organization *</label>
                <select value={form.organizationId} onChange={e => setForm(f => ({ ...f, organizationId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">Select organization…</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Urgency</label>
                <select value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value as TicketUrgency }))} style={{ ...inputStyle }}>
                  {ALL_URGENCIES.map(u => <option key={u} value={u}>{URGENCY_LABELS[u]}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Problem Description *</label>
                <textarea rows={3} value={form.reportedProblem} onChange={e => setForm(f => ({ ...f, reportedProblem: e.target.value }))} placeholder="Describe the issue reported by the customer…" style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)" }} />
              </div>
            </div>
            {formError && (
              <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginTop: "var(--w-s-3)" }}>
                {formError}
              </p>
            )}
            <div className="flex gap-3" style={{ marginTop: "var(--w-s-4)" }}>
              <button type="submit" disabled={submitting} className="font-head font-semibold uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: submitting ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Saving…" : "Open Ticket"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }} className="font-head font-medium uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "transparent", color: "var(--w-text-2)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: "var(--w-s-4)" }}>
          {(["", ...ALL_STATUSES] as (TicketStatus | "")[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="font-head font-semibold uppercase"
              style={{
                ...btnBase,
                background: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-plate)",
                color: statusFilter === s ? "#fff" : "var(--w-text-2)",
                borderColor: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-border)",
              }}>
              {s === "" ? "All" : STATUS_LABELS[s as TicketStatus]}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", color: "var(--w-attention-fg)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>
            {error}
          </div>
        )}

        <div className="bg-plate border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--w-sunken)" }}>
                  {["Ticket #", "Organization", "Problem", "Urgency", "Status", "Opened"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</td></tr>
                ) : tickets.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No tickets found.</td></tr>
                ) : tickets.map((t, i) => (
                  <tr key={t.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < tickets.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-link)", fontFamily: "var(--w-font-head)", fontWeight: 600, whiteSpace: "nowrap" }}>{t.ticketNumber}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>{t.organization.name}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.reportedProblem}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <PriorityBar priority={t.urgency} showLabel />
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <StatusBadge status={TICKET_STATUS_TO_CATEGORY[t.status]} variant="row" />
                    </td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", whiteSpace: "nowrap" }}>
                      {new Date(t.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
