"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { ProductModel, ProductCategory } from "../../types/product-model";
import { CATEGORY_LABELS } from "../../types/product-model";

const ALL_CATEGORIES: ProductCategory[] = ["ENDOSCOPE", "FIBER_OPTIC", "IMAGING_DEVICE", "OTHER"];

const emptyForm = { name: "", category: "" as ProductCategory | "", manufacturer: "Welfo", description: "" };

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

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.category) {
      setFormError("Name and category are required.");
      return;
    }
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

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Product Models</h1>
            <p className="mt-1 text-sm text-slate-500">Device model catalog</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(""); }}
            className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560]"
          >
            {showForm ? "Cancel" : "+ Add Model"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <h2 className="text-lg font-semibold text-slate-800">New Product Model</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Olympus CF-HQ190"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  required
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value as ProductCategory }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">Select category…</option>
                  {ALL_CATEGORIES.map(c => (
                    <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Manufacturer</label>
                <input
                  value={form.manufacturer}
                  onChange={e => setForm(f => ({ ...f, manufacturer: e.target.value }))}
                  placeholder="e.g. Olympus"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description"
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
                {submitting ? "Saving…" : "Create Model"}
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

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCategoryFilter("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${categoryFilter === "" ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All
          </button>
          {ALL_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c === categoryFilter ? "" : c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${categoryFilter === c ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Category</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Manufacturer</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Description</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading…</td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">No product models found.</td>
                </tr>
              ) : models.map(m => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{m.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {CATEGORY_LABELS[m.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{m.manufacturer}</td>
                  <td className="px-6 py-4 text-slate-500">{m.description ?? "—"}</td>
                  <td className="px-6 py-4">
                    {m.isActive
                      ? <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">Active</span>
                      : <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Inactive</span>
                    }
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
