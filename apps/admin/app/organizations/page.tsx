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

const TIER_COLORS: Record<OrganizationTier, string> = {
  STANDARD: "bg-slate-100 text-slate-600",
  PREMIUM: "bg-blue-50 text-blue-700",
  ENTERPRISE: "bg-teal-50 text-teal-700",
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

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.type) {
      setFormError("Name and type are required.");
      return;
    }
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

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Organizations</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${orgs.length} organization${orgs.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setFormError(""); }}
            className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560]"
          >
            {showForm ? "Cancel" : "+ Add Organization"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <h2 className="text-lg font-semibold text-slate-800">New Organization</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Apollo Hospitals Delhi"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                <select
                  required
                  value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value as OrganizationType }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">Select type…</option>
                  {Object.entries(TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tier</label>
                <select
                  value={form.tier}
                  onChange={e => setForm(f => ({ ...f, tier: e.target.value as OrganizationTier }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  <option value="">Standard (default)</option>
                  {Object.entries(TIER_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payment Terms (days)</label>
                <input
                  type="number"
                  min={0}
                  max={365}
                  value={form.paymentTermsDays}
                  onChange={e => setForm(f => ({ ...f, paymentTermsDays: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                <input
                  value={form.gstNumber}
                  onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                <input
                  value={form.panNumber}
                  onChange={e => setForm(f => ({ ...f, panNumber: e.target.value }))}
                  placeholder="AAAAA0000A"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                  placeholder="https://example.com"
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
                {submitting ? "Saving…" : "Create Organization"}
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

        <div className="flex flex-wrap gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] w-60"
          />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as OrganizationType | "")}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-[#00B4D8]"
          >
            <option value="">All types</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
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
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Name</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Type</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Tier</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">GST Number</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Payment Terms</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">Loading…</td>
                </tr>
              ) : orgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">No organizations found.</td>
                </tr>
              ) : orgs.map(org => (
                <tr key={org.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{org.name}</td>
                  <td className="px-6 py-4 text-slate-600">{TYPE_LABELS[org.type]}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${TIER_COLORS[org.tier]}`}>
                      {TIER_LABELS[org.tier]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{org.gstNumber ?? "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{org.paymentTermsDays} days</td>
                  <td className="px-6 py-4">
                    {org.isActive
                      ? <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">Active</span>
                      : <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">Inactive</span>
                    }
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/organizations/${org.id}`)}
                      className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                    >
                      View
                    </button>
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
