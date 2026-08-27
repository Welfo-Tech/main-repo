"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import PriorityBar from "../../components/common/PriorityBar";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../lib/api";
import type { Organization } from "../../types/organization";
import type { Product } from "../../types/product";
import type { CasePriority, ServiceCase, ServiceCaseStatus, ServiceCaseType } from "../../types/service-case";
import { PRIORITY_LABELS, STATUS_LABELS, TYPE_LABELS } from "../../types/service-case";

const ALL_STATUSES: ServiceCaseStatus[] = [
  "INTAKE", "ASSIGNED", "UNDER_ASSESSMENT", "AWAITING_QUOTE_APPROVAL",
  "WORK_AUTHORIZED", "IN_REPAIR", "QC_PENDING", "QC_PASSED", "QC_FAILED",
  "DISPATCH_READY", "DISPATCHED", "DELIVERED", "CLOSED", "ON_HOLD", "CANCELLED",
];

const ALL_TYPES: ServiceCaseType[] = ["REPAIR", "SPARE_DEPLOYMENT", "INSPECTION", "WARRANTY_CLAIM"];
const ALL_PRIORITIES: CasePriority[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

const emptyForm = { organizationId: "", productId: "", type: "REPAIR" as ServiceCaseType, priority: "NORMAL" as CasePriority, intakeCondition: "", isBillable: true };

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

export default function ServiceCasesPage() {
  const [cases, setCases] = useState<ServiceCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceCaseStatus | "">("");
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      const data = await api.get<ServiceCase[]>(`/api/v1/service-cases${qs ? `?${qs}` : ""}`);
      setCases(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load service cases");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  async function openForm() {
    setShowForm(true);
    setFormError("");
    try {
      const [o, p] = await Promise.all([
        api.get<Organization[]>("/api/v1/organizations?isActive=true"),
        api.get<Product[]>("/api/v1/products"),
      ]);
      setOrgs(o);
      setProducts(p);
    } catch {
      setOrgs([]);
      setProducts([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.organizationId) { setFormError("Organization is required."); return; }
    if (!form.productId) { setFormError("Product is required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      const created = await api.post<ServiceCase>("/api/v1/service-cases", {
        organizationId: form.organizationId,
        productId: form.productId,
        type: form.type,
        priority: form.priority,
        isBillable: form.isBillable,
        ...(form.intakeCondition.trim() && { intakeCondition: form.intakeCondition.trim() }),
      });
      setForm(emptyForm);
      setShowForm(false);
      window.location.href = `/service-cases/${created.id}`;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to open service case");
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
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>Service Cases</h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              {loading ? "Loading…" : `${cases.length} case${cases.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={() => showForm ? setShowForm(false) : openForm()} className="font-head font-semibold uppercase"
            style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Open Case"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>Open New Service Case</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-4)" }}>
              <div>
                <label style={labelStyle}>Organization *</label>
                <select value={form.organizationId} onChange={e => setForm(f => ({ ...f, organizationId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">Select organization…</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Product *</label>
                <select value={form.productId} onChange={e => setForm(f => ({ ...f, productId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">Select product…</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.serialNumber}{p.model ? ` — ${p.model.name}` : ""}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Case Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as ServiceCaseType }))} style={{ ...inputStyle }}>
                  {ALL_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as CasePriority }))} style={{ ...inputStyle }}>
                  {ALL_PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Intake Condition</label>
                <textarea rows={2} value={form.intakeCondition} onChange={e => setForm(f => ({ ...f, intakeCondition: e.target.value }))} placeholder="Physical condition of the device on intake…" style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)" }} />
              </div>
              <div style={{ gridColumn: "1 / -1" }} className="flex items-center gap-2">
                <input id="isBillable" type="checkbox" checked={form.isBillable} onChange={e => setForm(f => ({ ...f, isBillable: e.target.checked }))} />
                <label htmlFor="isBillable" style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)", cursor: "pointer" }}>Billable to customer</label>
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
                {submitting ? "Saving…" : "Open Case"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }} className="font-head font-medium uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "transparent", color: "var(--w-text-2)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: "var(--w-s-4)" }}>
          {(["", ...ALL_STATUSES] as (ServiceCaseStatus | "")[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="font-head font-semibold uppercase"
              style={{
                ...btnBase,
                background: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-plate)",
                color: statusFilter === s ? "#fff" : "var(--w-text-2)",
                borderColor: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-border)",
              }}>
              {s === "" ? "All" : STATUS_LABELS[s as ServiceCaseStatus]}
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
                  {["Case #", "Type", "Organization", "Product", "Priority", "Status", "Opened", ""].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</td></tr>
                ) : cases.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No service cases found.</td></tr>
                ) : cases.map((sc, i) => (
                  <tr key={sc.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < cases.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-link)", fontFamily: "var(--w-font-head)", fontWeight: 600, whiteSpace: "nowrap" }}>
                      {sc.caseNumber}
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{TYPE_LABELS[sc.type]}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>{sc.organization.name}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)" }}>
                      <span className="w-num" style={{ color: "var(--w-text-1)", fontFamily: "monospace" }}>{sc.product.serialNumber}</span>
                      {sc.product.model && <span style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-caption)", display: "block" }}>{sc.product.model.name}</span>}
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <PriorityBar priority={sc.priority} showLabel />
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <StatusBadge status={sc.status} variant="row" />
                    </td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", whiteSpace: "nowrap" }}>
                      {new Date(sc.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <Link href={`/service-cases/${sc.id}`} style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", fontFamily: "var(--w-font-head)", fontWeight: 600, textDecoration: "none", letterSpacing: "0.04em" }}>
                        View →
                      </Link>
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
