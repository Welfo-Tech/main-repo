"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../lib/api";
import type { Invoice, InvoiceStatus } from "../../types/invoice";
import { STATUS_LABELS, formatINR, paidPercent } from "../../types/invoice";

const ALL_STATUSES: InvoiceStatus[] = [
  "DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "OVERDUE", "DISPUTED", "CANCELLED",
];

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

  const btnBase: React.CSSProperties = { height: "24px", paddingInline: "var(--w-s-3)", fontSize: "var(--w-fs-eyebrow)", fontFamily: "var(--w-font-head)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", border: "1px solid var(--w-border)" };

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "var(--w-page-max)" }}>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>Invoices</h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              {loading ? "Loading…" : `${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)" }}>
            Create invoices from a Service Case detail page.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: "var(--w-s-4)" }}>
          {(["", ...ALL_STATUSES] as (InvoiceStatus | "")[]).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="font-head font-semibold uppercase"
              style={{
                ...btnBase,
                background: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-plate)",
                color: statusFilter === s ? "#fff" : "var(--w-text-2)",
                borderColor: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-border)",
              }}>
              {s === "" ? "All" : STATUS_LABELS[s as InvoiceStatus]}
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
                  {["Invoice #", "Case", "Organization", "Total", "Paid", "Status", "Due Date", ""].map(h => (
                    <th key={h} style={TH_STYLE}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No invoices found. Create one from a Service Case detail page.</td></tr>
                ) : invoices.map((inv, i) => {
                  const pct = paidPercent(inv);
                  return (
                    <tr key={inv.id} className="hover:bg-row-hover transition-colors duration-fast"
                      style={{ borderBottom: i < invoices.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                      <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontFamily: "var(--w-font-head)", fontWeight: 600, whiteSpace: "nowrap" }}>{inv.invoiceNumber}</td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <Link href={`/service-cases/${inv.caseId}`} style={{ fontSize: "var(--w-fs-cell)", color: "var(--w-link)", textDecoration: "none", fontFamily: "monospace" }}>
                          {inv.case.caseNumber}
                        </Link>
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>{inv.organization.name}</td>
                      <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500 }}>{formatINR(inv.totalAmount)}</td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <div className="flex items-center gap-2">
                          <div style={{ width: "64px", height: "4px", background: "var(--w-sunken)", border: "1px solid var(--w-border)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "var(--w-success-dot)", transition: "width var(--w-dur)" }} />
                          </div>
                          <span className="w-num" style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <StatusBadge status={inv.status} variant="row" />
                      </td>
                      <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", whiteSpace: "nowrap" }}>
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <Link href={`/invoices/${inv.id}`} style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", fontFamily: "var(--w-font-head)", fontWeight: 600, textDecoration: "none", letterSpacing: "0.04em" }}>
                          View →
                        </Link>
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
