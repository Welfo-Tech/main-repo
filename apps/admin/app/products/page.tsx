"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../lib/api";
import type { Product, ProductStatus } from "../../types/product";
import { STATUS_LABELS } from "../../types/product";
import type { ProductModel } from "../../types/product-model";
import { CATEGORY_LABELS } from "../../types/product-model";
import type { Organization } from "../../types/organization";

const ALL_STATUSES: ProductStatus[] = [
  "REGISTERED", "IN_SERVICE", "UNDER_REPAIR", "UNREGISTERED", "RETIRED", "LOST", "SCRAPPED",
];

const PRODUCT_STATUS_MAP: Record<ProductStatus, string> = {
  UNREGISTERED:  "NEUTRAL",
  REGISTERED:    "PROGRESS",
  IN_SERVICE:    "PROGRESS",
  UNDER_REPAIR:  "WAITING",
  RETIRED:       "TERMINAL",
  LOST:          "ATTENTION",
  SCRAPPED:      "TERMINAL",
};

const emptyForm = {
  serialNumber: "",
  modelId: "",
  ownerOrgId: "",
  status: "REGISTERED" as ProductStatus,
  manufactureDate: "",
  warrantyExpiry: "",
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

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");
  const [search, setSearch] = useState("");
  const [models, setModels] = useState<ProductModel[]>([]);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      const qs = params.toString();
      const data = await api.get<Product[]>(`/api/v1/products${qs ? `?${qs}` : ""}`);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function openForm() {
    setShowForm(true);
    setFormError("");
    try {
      const [m, o] = await Promise.all([
        api.get<ProductModel[]>("/api/v1/product-models?isActive=true"),
        api.get<Organization[]>("/api/v1/organizations?isActive=true"),
      ]);
      setModels(m);
      setOrgs(o);
    } catch {
      setModels([]);
      setOrgs([]);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.serialNumber.trim()) { setFormError("Serial number is required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/v1/products", {
        serialNumber: form.serialNumber.trim(),
        status: form.status,
        ...(form.modelId && { modelId: form.modelId }),
        ...(form.ownerOrgId && { ownerOrgId: form.ownerOrgId }),
        ...(form.manufactureDate && { manufactureDate: form.manufactureDate }),
        ...(form.warrantyExpiry && { warrantyExpiry: form.warrantyExpiry }),
        ...(form.notes.trim() && { notes: form.notes.trim() }),
      });
      setForm(emptyForm);
      setShowForm(false);
      await fetchProducts();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to register product");
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
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>Products</h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button onClick={() => showForm ? setShowForm(false) : openForm()} className="font-head font-semibold uppercase"
            style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Register Product"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>Register New Product</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-4)" }}>
              <div>
                <label style={labelStyle}>Serial Number *</label>
                <input required value={form.serialNumber} onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))} placeholder="WF-2024-00001" style={{ ...inputStyle, fontFamily: "monospace" }} />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductStatus }))} style={{ ...inputStyle }}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Product Model</label>
                <select value={form.modelId} onChange={e => setForm(f => ({ ...f, modelId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">No model</option>
                  {models.map(m => <option key={m.id} value={m.id}>{m.name} ({CATEGORY_LABELS[m.category]})</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Owner Organization</label>
                <select value={form.ownerOrgId} onChange={e => setForm(f => ({ ...f, ownerOrgId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">No owner</option>
                  {orgs.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Manufacture Date</label>
                <input type="date" value={form.manufactureDate} onChange={e => setForm(f => ({ ...f, manufactureDate: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Warranty Expiry</label>
                <input type="date" value={form.warrantyExpiry} onChange={e => setForm(f => ({ ...f, warrantyExpiry: e.target.value }))} style={inputStyle} />
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
                {submitting ? "Saving…" : "Register Product"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }} className="font-head font-medium uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "transparent", color: "var(--w-text-2)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap items-center gap-3" style={{ marginBottom: "var(--w-s-4)" }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by serial number…" style={{ ...inputStyle, width: "240px", flex: "none" }} />
          <div className="flex gap-2 flex-wrap">
            {(["", ...ALL_STATUSES] as (ProductStatus | "")[]).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className="font-head font-semibold uppercase"
                style={{
                  ...btnBase,
                  background: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-plate)",
                  color: statusFilter === s ? "#fff" : "var(--w-text-2)",
                  borderColor: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-border)",
                }}>
                {s === "" ? "All" : STATUS_LABELS[s as ProductStatus]}
              </button>
            ))}
          </div>
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
                  {["Serial Number", "Model", "Owner", "Status", "Warranty Expiry"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No products found.</td></tr>
                ) : products.map((p, i) => (
                  <tr key={p.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < products.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontFamily: "monospace", fontWeight: 500 }}>{p.serialNumber}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)" }}>
                      {p.model ? (
                        <span>
                          <span style={{ color: "var(--w-text-1)", fontWeight: 500 }}>{p.model.name}</span>
                          <span style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-caption)", display: "block" }}>{CATEGORY_LABELS[p.model.category]}</span>
                        </span>
                      ) : <span style={{ color: "var(--w-text-mute)" }}>—</span>}
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{p.ownerOrg?.name ?? "—"}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <StatusBadge status={PRODUCT_STATUS_MAP[p.status] ? p.status : p.status} />
                    </td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>
                      {p.warrantyExpiry ? new Date(p.warrantyExpiry).toLocaleDateString("en-IN") : "—"}
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
