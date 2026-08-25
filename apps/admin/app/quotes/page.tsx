"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";
import type { Quote, QuoteStatus } from "../../types/quote";
import { STATUS_COLORS, STATUS_LABELS, formatINR } from "../../types/quote";

const ALL_STATUSES: QuoteStatus[] = [
  "DRAFT", "UNDER_REVIEW", "SENT", "APPROVED", "REJECTED", "EXPIRED",
];

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "">("");

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const qs = params.toString();
      const data = await api.get<Quote[]>(`/api/v1/quotes${qs ? `?${qs}` : ""}`);
      setQuotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quotes");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Quotes</h1>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading…" : `${quotes.length} quote${quotes.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <p className="text-sm text-slate-400">Create quotes from a Service Case detail page.</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === "" ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >All</button>
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s === statusFilter ? "" : s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "bg-[#0F4C81] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >{STATUS_LABELS[s]}</button>
          ))}
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Quote #</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Case</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Organization</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Ver.</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Total</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-slate-600">Created</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">Loading…</td></tr>
              ) : quotes.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-12 text-center text-slate-400">No quotes found. Open a Service Case and create a quote from there.</td></tr>
              ) : quotes.map(q => (
                <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-mono font-medium text-slate-900">{q.quoteNumber}</td>
                  <td className="px-6 py-4">
                    <Link href={`/service-cases/${q.caseId}`} className="font-mono text-[#0F4C81] hover:underline text-xs">{q.case.caseNumber}</Link>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{q.case.organization.name}</td>
                  <td className="px-6 py-4 text-slate-500">v{q.version}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{formatINR(q.totalAmount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLORS[q.status]}`}>
                      {STATUS_LABELS[q.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(q.createdAt).toLocaleDateString("en-IN")}</td>
                  <td className="px-6 py-4">
                    <Link href={`/quotes/${q.id}`} className="text-[#0F4C81] text-xs font-semibold hover:underline">View →</Link>
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