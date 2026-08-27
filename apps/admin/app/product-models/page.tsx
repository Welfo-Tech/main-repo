"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { ProductModel, ProductCategory } from "../../types/product-model";
import { CATEGORY_LABELS } from "../../types/product-model";

const ALL_CATEGORIES: ProductCategory[] = ["ENDOSCOPE", "FIBER_OPTIC", "IMAGING_DEVICE", "OTHER"];

const emptyForm = { name: "", category: "" as ProductCategory | "", manufacturer: "Welfo", description: "" };

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

export default function ProductModelsPage() {
  const [models, setModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | "">("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (categoryFilter) params.set("category", categoryFilter);
      const qs = params.toString();
      const data = await api.get<ProductModel[]>(`/api/v1/product-models${qs ? `?${qs}` : ""}`);
      setModels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load product models");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => { fetchModels(); }, [fetchModels]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category) { setFormError("Name and category are required."); return; }
    setSubmitting(true);
    setFormError("");
    try {
      await api.post("/api/v1/product-models", {
        name: form.name.trim(),
        category: form.category,
        ...(form.manufacturer.trim() && { manufacturer: form.manufacturer.trim() }),
        ...(form.description.trim() && { description: form.description.trim() }),
      });
      setForm(emptyForm);
      setShowForm(false);
      await fetchModels();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create model");
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
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
              Product Models
            </h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>Device model catalog</p>
          </div>
          <button onClick={() => { setShowForm(!showForm); setFormError(""); }} className="font-head font-semibold uppercase"
            style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
            {showForm ? "Cancel" : "+ Add Model"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>New Product Model</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-4)" }}>
              <div>
                <label style={labelStyle}>Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Olympus CF-HQ190" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category *</label>
                <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))} style={{ ...inputStyle }}>
                  <option value="">Select category…</option>
                  {ALL_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Manufacturer</label>
                <input value={form.manufacturer} onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))} placeholder="e.g. Olympus" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" style={inputStyle} />
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
                {submitting ? "Saving…" : "Create Model"}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }} className="font-head font-medium uppercase"
                style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "transparent", color: "var(--w-text-2)", border: "1px solid var(--w-border)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: "var(--w-s-4)" }}>
          {(["", ...ALL_CATEGORIES] as (ProductCategory | "")[]).map(c => (
            <button key={c} onClick={() => setCategoryFilter(c)} className="font-head font-semibold uppercase"
              style={{
                ...btnBase,
                background: categoryFilter === c ? "var(--w-accent-strong)" : "var(--w-plate)",
                color: categoryFilter === c ? "#fff" : "var(--w-text-2)",
                borderColor: categoryFilter === c ? "var(--w-accent-strong)" : "var(--w-border)",
              }}>
              {c === "" ? "All" : CATEGORY_LABELS[c as ProductCategory]}
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
                  {["Name", "Category", "Manufacturer", "Description", "Status"].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</td></tr>
                ) : models.length === 0 ? (
                  <tr><td colSpan={5} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No product models found.</td></tr>
                ) : models.map((m, i) => (
                  <tr key={m.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < models.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500 }}>{m.name}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <span style={{ fontSize: "var(--w-fs-badge)", background: "var(--w-neutral-tint)", color: "var(--w-neutral-fg)", border: "1px solid var(--w-neutral-edge)", padding: "2px 6px", fontFamily: "var(--w-font-body)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {CATEGORY_LABELS[m.category]}
                      </span>
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{m.manufacturer}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{m.description ?? "—"}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <span className="flex items-center gap-1">
                        <span style={{ width: "8px", height: "8px", borderRadius: "var(--w-radius-full)", background: m.isActive ? "var(--w-success-dot)" : "var(--w-neutral-dot)", display: "inline-block" }} />
                        <span style={{ fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{m.isActive ? "Active" : "Inactive"}</span>
                      </span>
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
