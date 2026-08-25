"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import { STATUS_COLORS, STATUS_LABELS, formatINR, paidPercent } from "../../types/invoice";

const ALL_STATUSES: InvoiceStatus[] = [
  "DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "DISPUTED", "CANCELLED",
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("");

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      const data = await api.get<Invoice[]>(`/api/v1/invoices${qs ? `?${qs}` : ""}`);
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchInvoices(); }, [fetchInvoices]);

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <p className="text-sm text-slate-400">Create invoices from a Service Case detail page.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setStatusFilter("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === "" ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            All
          </button>
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Invoice #</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Case</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Organization</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Total</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Paid</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Due Date</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Loading…</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">No invoices found. Create one from a Service Case detail page.</td></tr>
              ) : invoices.map(inv => {
                const pct = paidPercent(inv);
                return (
                  <tr key={inv.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <Link href={`/service-cases/${inv.caseId}`} className="font-mono text-[#0F4C81] hover:underline text-xs">{inv.case.caseNumber}</Link>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{inv.organization.name}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">{formatINR(inv.totalAmount)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{pct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[inv.status]}`}>
                        {STATUS_LABELS[inv.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/invoices/${inv.id}`} className="text-[#0F4C81] text-xs font-semibold hover:underline">View →</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}