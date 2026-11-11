"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { Organization } from "../../types/organization";
import { OrganizationType, OrganizationTier } from "../../types/organization";

const TYPE_LABELS: Record<OrganizationType, string> = {
  HOSPITAL: "Hospital",
  CLINIC: "Clinic",
  DISTRIBUTOR: "Distributor",
  DEALER: "Dealer",
  SERVICE_PARTNER: "Service Partner",
};

const TIER_LABELS: Record<OrganizationTier, string> = {
  STANDARD: "Standard",
  PREMIUM: "Premium",
  ENTERPRISE: "Enterprise",
};

const TIER_STYLES: Record<OrganizationTier, { bg: string; fg: string; edge: string }> = {
  STANDARD: { bg: "var(--w-neutral-tint)", fg: "var(--w-neutral-fg)", edge: "var(--w-neutral-edge)" },
  PREMIUM:  { bg: "var(--w-progress-tint)", fg: "var(--w-progress-fg)", edge: "var(--w-progress-edge)" },
  ENTERPRISE: { bg: "var(--w-success-tint)", fg: "var(--w-success-fg)", edge: "var(--w-success-edge)" },
};

const emptyForm = {
  name: "",
  type: "" as OrganizationType | "",
  tier: "" as OrganizationTier | "",
  gstNumber: "",
  panNumber: "",
  paymentTermsDays: "30",
  website: "",
  notes: "",
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

export default function OrganizationsPage() {
  const router = useRouter();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrganizationType | "">("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (typeFilter) params.set("type", typeFilter);
      const qs = params.toString();
      const data = await api.get<Organization[]>(`/api/v1/organizations${qs ? `?${qs}` : ""}`);
      setOrgs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load organizations");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.type) { setFormError("Name and type are required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/v1/organizations", {
        name: form.name.trim(),
        type: form.type,
        ...(form.tier && { tier: form.tier }),
        ...(form.gstNumber.trim() && { gstNumber: form.gstNumber.trim() }),
        ...(form.panNumber.trim() && { panNumber: form.panNumber.trim() }),
        ...(form.paymentTermsDays && { paymentTermsDays: parseInt(form.paymentTermsDays, 10) }),
        ...(form.website.trim() && { website: form.website.trim() }),
        ...(form.notes.trim() && { notes: form.notes.trim() }),
      });
      setForm(emptyForm);
      setShowForm(false);
      await fetchOrgs();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create organization");
    } finally {
      setSubmitting(false);
    }
  }

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

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "var(--w-page-max)" }}>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
              Organizations
            </h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              {loading ? "Loading…" : `${orgs.length} organization${orgs.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(""); }}
            className="font-head font-semibold uppercase"
            style={{
              height: "var(--w-control-h)",
              paddingInline: "var(--w-s-4)",
              background: "var(--w-accent-strong)",
              color: "#fff",
              border: "none",
              fontSize: "var(--w-fs-label)",
              letterSpacing: "0.06em",
              cursor: "pointer",
              borderRadius: "var(--w-radius)",
            }}
          >
            {showForm ? "Cancel" : "+ Add Organization"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-plate border border-border"
            style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}
          >
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>
              New Organization
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-4)" }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Apollo Hospitals Delhi" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Type *</label>
                <select required value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as OrganizationType }))} style={{ ...inputStyle }}>
                  <option value="">Select type…</option>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tier</label>
                <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value as OrganizationTier }))} style={{ ...inputStyle }}>
                  <option value="">Standard (default)</option>
                  {Object.entries(TIER_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Payment Terms (days)</label>
                <input type="number" min={0} max={365} value={form.paymentTermsDays} onChange={e => setForm(f => ({ ...f, paymentTermsDays: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>GST Number</label>
                <input value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))} placeholder="22AAAAA0000A1Z5" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>PAN Number</label>
                <input value={form.panNumber} onChange={e => setForm(f => ({ ...f, panNumber: e.target.value }))} placeholder="AAAAA0000A" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Website</label>
                <input type="url" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Notes</label>
                <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)" }} />
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
                {submitting ? "Saving…" : "Create Organization"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }} className="font-head font-medium uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "transparent", color: "var(--w-text-2)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-3" style={{ marginBottom: "var(--w-s-4)" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…" style={{ ...inputStyle, width: "220px", flex: "none" }} />
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as OrganizationType | "")} style={{ ...inputStyle, width: "auto", flex: "none" }}>
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
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
                  {["Name", "Type", "Tier", "GST No.", "Payment Terms", "Status", ""].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</td></tr>
                ) : orgs.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No organizations found.</td></tr>
                ) : orgs.map((org, i) => {
                  const ts = TIER_STYLES[org.tier];
                  return (
                    <tr key={org.id} className="hover:bg-row-hover transition-colors duration-fast"
                      style={{ borderBottom: i < orgs.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500 }}>
                        {org.name}
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>
                        {TYPE_LABELS[org.type]}
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <span style={{ background: ts.bg, color: ts.fg, border: `1px solid ${ts.edge}`, fontSize: "var(--w-fs-badge)", fontFamily: "var(--w-font-body)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", padding: "2px 6px" }}>
                          {TIER_LABELS[org.tier]}
                        </span>
                      </td>
                      <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", fontFamily: "monospace" }}>
                        {org.gstNumber ?? "—"}
                      </td>
                      <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>
                        {org.paymentTermsDays != null ? `${org.paymentTermsDays} days` : "—"}
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <span className="flex items-center gap-1">
                          <span style={{ width: "8px", height: "8px", borderRadius: "var(--w-radius-full)", background: org.isActive ? "var(--w-success-dot)" : "var(--w-neutral-dot)", display: "inline-block" }} />
                          <span style={{ fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{org.isActive ? "Active" : "Inactive"}</span>
                        </span>
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <button onClick={() => router.push(`/organizations/${org.id}`)} className="font-head font-medium uppercase"
                          style={{ height: "24px", paddingInline: "var(--w-s-3)", background: "transparent", color: "var(--w-link)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-caption)", letterSpacing: "0.04em", cursor: "pointer" }}>
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
