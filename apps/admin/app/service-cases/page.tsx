"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { Organization } from "../../types/organization";
import type { Product } from "../../types/product";
import type {
  CasePriority,
  ServiceCase,
  ServiceCaseStatus,
  ServiceCaseType,
} from "../../types/service-case";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "../../types/service-case";

const ALL_STATUSES: ServiceCaseStatus[] = [
  "INTAKE",
  "ASSIGNED",
  "UNDER_ASSESSMENT",
  "AWAITING_QUOTE_APPROVAL",
  "WORK_AUTHORIZED",
  "IN_REPAIR",
  "QC_PENDING",
  "QC_PASSED",
  "QC_FAILED",
  "DISPATCH_READY",
  "DISPATCHED",
  "DELIVERED",
  "CLOSED",
  "ON_HOLD",
  "CANCELLED",
];

const ALL_TYPES: ServiceCaseType[] = [
  "REPAIR",
  "SPARE_DEPLOYMENT",
  "INSPECTION",
  "WARRANTY_CLAIM",
];

const ALL_PRIORITIES: CasePriority[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

const emptyForm = {
  organizationId: "",
  productId: "",
  type: "REPAIR" as ServiceCaseType,
  priority: "NORMAL" as CasePriority,
  intakeCondition: "",
  isBillable: true,
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

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

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
    if (!form.organizationId) {
      setFormError("Organization is required.");
      return;
    }
    if (!form.productId) {
      setFormError("Product is required.");
      return;
    }
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

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Service Cases</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${cases.length} case${cases.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => (showForm ? setShowForm(false) : openForm())}
            className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560]"
          >
            {showForm ? "Cancel" : "+ Open Case"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <h2 className="text-lg font-semibold text-slate-800">Open New Service Case</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Organization *
                </label>
                <select
                  value={form.organizationId}
                  onChange={(e) => setForm((f) => ({ ...f, organizationId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">Select organization…</option>
                  {orgs.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Product *
                </label>
                <select
                  value={form.productId}
                  onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">Select product…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.serialNumber}
                      {p.model ? ` — ${p.model.name}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as ServiceCaseType }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  {ALL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as CasePriority }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  {ALL_PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Intake Condition
                </label>
                <textarea
                  rows={2}
                  value={form.intakeCondition}
                  onChange={(e) => setForm((f) => ({ ...f, intakeCondition: e.target.value }))}
                  placeholder="Physical condition of the device on intake…"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <input
                  id="isBillable"
                  type="checkbox"
                  checked={form.isBillable}
                  onChange={(e) => setForm((f) => ({ ...f, isBillable: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#0F4C81]"
                />
                <label htmlFor="isBillable" className="text-sm font-medium text-slate-700">
                  Billable to customer
                </label>
              </div>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-[#0F4C81] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560] disabled:opacity-60"
              >
                {submitting ? "Saving…" : "Open Case"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setForm(emptyForm);
                  setFormError("");
                }}
                className="rounded-xl border border-slate-300 px-6 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === ""
                ? "bg-[#0F4C81] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s
                  ? "bg-[#0F4C81] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Case #</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Organization</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Product</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Priority</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Opened</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    No service cases found.
                  </td>
                </tr>
              ) : (
                cases.map((sc) => (
                  <tr
                    key={sc.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {sc.caseNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{TYPE_LABELS[sc.type]}</td>
                    <td className="px-6 py-4 text-slate-700">{sc.organization.name}</td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-slate-800">{sc.product.serialNumber}</p>
                      {sc.product.model && (
                        <p className="text-xs text-slate-400">{sc.product.model.name}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_COLORS[sc.priority]}`}
                      >
                        {PRIORITY_LABELS[sc.priority]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[sc.status]}`}
                      >
                        {STATUS_LABELS[sc.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(sc.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/service-cases/${sc.id}`}
                        className="text-[#0F4C81] text-xs font-semibold hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}