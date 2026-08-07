"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { Product, ProductStatus } from "../../types/product";
import { STATUS_LABELS, STATUS_COLORS } from "../../types/product";
import type { ProductModel } from "../../types/product-model";
import { CATEGORY_LABELS } from "../../types/product-model";
import type { Organization } from "../../types/organization";

const ALL_STATUSES: ProductStatus[] = [
  "REGISTERED", "IN_SERVICE", "UNDER_REPAIR", "UNREGISTERED", "RETIRED", "LOST", "SCRAPPED",
];

const emptyForm = {
  serialNumber: "",
  modelId: "",
  ownerOrgId: "",
  status: "REGISTERED" as ProductStatus,
  manufactureDate: "",
  warrantyExpiry: "",
  notes: "",
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

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    if (!form.serialNumber.trim()) {
      setFormError("Serial number is required.");
      return;
    }
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

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Products</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${products.length} product${products.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => showForm ? setShowForm(false) : openForm()}
            className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560]"
          >
            {showForm ? "Cancel" : "+ Register Product"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <h2 className="text-lg font-semibold text-slate-800">Register New Product</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number *</label>
                <input
                  required
                  value={form.serialNumber}
                  onChange={e => setForm(f => ({ ...f, serialNumber: e.target.value }))}
                  placeholder="WF-2024-00001"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-mono outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as ProductStatus }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  {ALL_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Model</label>
                <select
                  value={form.modelId}
                  onChange={e => setForm(f => ({ ...f, modelId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">No model</option>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({CATEGORY_LABELS[m.category]})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Organization</label>
                <select
                  value={form.ownerOrgId}
                  onChange={e => setForm(f => ({ ...f, ownerOrgId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">No owner</option>
                  {orgs.map(o => (
                    <option key={o.id} value={o.id}>{o.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manufacture Date</label>
                <input
                  type="date"
                  value={form.manufactureDate}
                  onChange={e => setForm(f => ({ ...f, manufactureDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Expiry</label>
                <input
                  type="date"
                  value={form.warrantyExpiry}
                  onChange={e => setForm(f => ({ ...f, warrantyExpiry: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#0F4C81] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Register Product"}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); setFormError(""); }}
                className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by serial number…"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] w-64"
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setStatusFilter("")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === "" ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              All
            </button>
            {ALL_STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Serial Number</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Model</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Owner</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Warranty Expiry</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading…</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No products found.</td>
                </tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{p.serialNumber}</td>
                  <td className="px-6 py-4">
                    {p.model
                      ? <div>
                          <p className="font-medium text-slate-800">{p.model.name}</p>
                          <p className="text-xs text-slate-400">{CATEGORY_LABELS[p.model.category]}</p>
                        </div>
                      : <span className="text-slate-400">—</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.ownerOrg?.name ?? "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[p.status]}`}>
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {p.warrantyExpiry ? new Date(p.warrantyExpiry).toLocaleDateString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
