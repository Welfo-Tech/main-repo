"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { Organization } from "../../types/organization";
import type { Ticket, TicketStatus, TicketUrgency } from "../../types/ticket";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  URGENCY_COLORS,
  URGENCY_LABELS,
} from "../../types/ticket";

const ALL_STATUSES: TicketStatus[] = [
  "OPEN",
  "INTAKE_RECEIVED",
  "CONVERTED",
  "REJECTED",
  "DEFERRED",
];

const ALL_URGENCIES: TicketUrgency[] = ["LOW", "NORMAL", "HIGH", "CRITICAL"];

const emptyForm = {
  organizationId: "",
  reportedProblem: "",
  urgency: "NORMAL" as TicketUrgency,
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

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

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
    if (!form.organizationId) {
      setFormError("Organization is required.");
      return;
    }
    if (!form.reportedProblem.trim()) {
      setFormError("Problem description is required.");
      return;
    }
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

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Tickets</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${tickets.length} ticket${tickets.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => (showForm ? setShowForm(false) : openForm())}
            className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560]"
          >
            {showForm ? "Cancel" : "+ Open Ticket"}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
          >
            <h2 className="text-lg font-semibold text-slate-800">Open New Ticket</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm((f) => ({ ...f, urgency: e.target.value as TicketUrgency }))}
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                >
                  {ALL_URGENCIES.map((u) => (
                    <option key={u} value={u}>
                      {URGENCY_LABELS[u]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Problem Description *
                </label>
                <textarea
                  rows={3}
                  value={form.reportedProblem}
                  onChange={(e) => setForm((f) => ({ ...f, reportedProblem: e.target.value }))}
                  placeholder="Describe the issue reported by the customer…"
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
                {submitting ? "Saving…" : "Open Ticket"}
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
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Ticket #</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Organization</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Problem</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Urgency</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Opened</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading…
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">
                      {t.ticketNumber}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{t.organization.name}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                      {t.reportedProblem}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${URGENCY_COLORS[t.urgency]}`}
                      >
                        {URGENCY_LABELS[t.urgency]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[t.status]}`}
                      >
                        {STATUS_LABELS[t.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(t.createdAt).toLocaleDateString("en-IN")}
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