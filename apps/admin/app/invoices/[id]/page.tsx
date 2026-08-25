"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import type { Invoice, InvoiceStatus, PaymentMethod } from "../../../types/invoice";
import { METHOD_LABELS, STATUS_COLORS, STATUS_LABELS, formatINR, paidPercent } from "../../../types/invoice";

const STATUS_ACTIONS: Partial<Record<InvoiceStatus, InvoiceStatus[]>> = {
  DRAFT: ["ISSUED"],
  ISSUED: ["CANCELLED"],
  PARTIALLY_PAID: ["DISPUTED", "CANCELLED"],
  OVERDUE: ["DISPUTED", "WRITTEN_OFF"],
  DISPUTED: ["ISSUED", "CANCELLED"],
};

const ALL_METHODS: PaymentMethod[] = ["BANK_TRANSFER", "CHEQUE", "CASH", "UPI", "CARD"];

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  RECORDED: "Recorded",
  VERIFIED: "Verified",
  RECONCILED: "Reconciled",
  DISPUTED: "Disputed",
  REFUNDED: "Refunded",
};

interface RecordPaymentForm {
  amount: string;
  method: PaymentMethod;
  paymentDate: string;
  referenceNumber: string;
  notes: string;
}

const emptyPayment = (): RecordPaymentForm => ({
  amount: "",
  method: "BANK_TRANSFER",
  paymentDate: new Date().toISOString().substring(0, 10),
  referenceNumber: "",
  notes: "",
});

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusBusy, setStatusBusy] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState<RecordPaymentForm>(emptyPayment());
  const [paymentBusy, setPaymentBusy] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<Invoice>(`/api/v1/invoices/${id}`);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchInvoice(); }, [fetchInvoice]);

  async function updateStatus(next: InvoiceStatus) {
    if (!invoice) return;
    setStatusBusy(true);
    try {
      await api.patch(`/api/v1/invoices/${invoice.id}`, { status: next });
      await fetchInvoice();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Status update failed");
    } finally {
      setStatusBusy(false);
    }
  }

  async function recordPayment() {
    if (!invoice) return;
    setPaymentBusy(true);
    setPaymentError("");
    try {
      const body: Record<string, unknown> = {
        amount: parseFloat(paymentForm.amount),
        method: paymentForm.method,
        paymentDate: new Date(paymentForm.paymentDate).toISOString(),
      };
      if (paymentForm.referenceNumber.trim()) body.referenceNumber = paymentForm.referenceNumber.trim();
      if (paymentForm.notes.trim()) body.notes = paymentForm.notes.trim();
      await api.post(`/api/v1/invoices/${invoice.id}/payments`, body);
      setShowPaymentForm(false);
      setPaymentForm(emptyPayment());
      await fetchInvoice();
    } catch (err) {
      setPaymentError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setPaymentBusy(false);
    }
  }

  async function verifyPayment(paymentId: string) {
    setVerifyingId(paymentId);
    try {
      await api.patch(`/api/v1/invoices/${id}/payments/${paymentId}/verify`, {});
      await fetchInvoice();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setVerifyingId(null);
    }
  }

  if (loading) return <AdminLayout><div className="p-8 text-slate-400">Loading…</div></AdminLayout>;
  if (error && !invoice) return <AdminLayout><div className="p-8 text-red-600">{error}</div></AdminLayout>;
  if (!invoice) return null;

  const pct = paidPercent(invoice);
  const nextStatuses = STATUS_ACTIONS[invoice.status] ?? [];
  const canRecord = !["PAID", "CANCELLED", "WRITTEN_OFF"].includes(invoice.status);
  const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-5xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/invoices" className="text-sm text-slate-400 hover:text-slate-700">← Invoices</Link>
              <span className="text-slate-200">|</span>
              <span className="font-mono text-xs text-slate-400">
                from case{" "}
                <Link href={`/service-cases/${invoice.caseId}`} className="text-[#0F4C81] hover:underline">
                  {invoice.case.caseNumber}
                </Link>
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 font-mono">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-slate-500">{invoice.organization.name}</p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_COLORS[invoice.status]}`}>
            {STATUS_LABELS[invoice.status]}
          </span>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-slate-900">{formatINR(invoice.totalAmount)}</p>
            <p className="text-xs text-slate-400 mt-1">
              {formatINR(invoice.subtotal)} + {formatINR(invoice.taxAmount)} GST
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">Paid</p>
            <p className="text-2xl font-bold text-emerald-600">{formatINR(invoice.paidAmount)}</p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-slate-500">{pct}%</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 mb-1">Outstanding</p>
            <p className={`text-2xl font-bold ${outstanding > 0 ? "text-red-600" : "text-slate-400"}`}>
              {formatINR(outstanding)}
            </p>
            {invoice.dueDate && (
              <p className="text-xs text-slate-400 mt-1">
                Due {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
              </p>
            )}
          </div>
        </div>

        {nextStatuses.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Status Actions</p>
            <div className="flex gap-3">
              {nextStatuses.map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={statusBusy}
                  className="rounded-lg px-4 py-2 text-sm font-semibold bg-[#0F4C81] text-white hover:bg-[#0a3a63] disabled:opacity-50 transition">
                  Mark as {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-semibold text-slate-800">Line Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Qty</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Unit Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Disc%</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">GST%</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400 text-sm">No line items yet.</td></tr>
              ) : invoice.lineItems.map(item => (
                <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-400">{item.sortOrder}</td>
                  <td className="px-6 py-3 text-slate-500">{item.itemType}</td>
                  <td className="px-6 py-3 text-slate-700">{item.description}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{Number(item.quantity)}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{formatINR(item.unitPrice)}</td>
                  <td className="px-6 py-3 text-right text-slate-500">{Number(item.discountPct)}%</td>
                  <td className="px-6 py-3 text-right text-slate-500">{Number(item.taxRate)}%</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-800">{formatINR(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-slate-200 bg-slate-50">
              <tr>
                <td colSpan={7} className="px-6 py-2 text-right text-xs text-slate-500 font-medium">Subtotal</td>
                <td className="px-6 py-2 text-right text-sm font-semibold text-slate-700">{formatINR(invoice.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={7} className="px-6 py-2 text-right text-xs text-slate-500 font-medium">GST</td>
                <td className="px-6 py-2 text-right text-sm font-semibold text-slate-700">{formatINR(invoice.taxAmount)}</td>
              </tr>
              <tr>
                <td colSpan={7} className="px-6 py-3 text-right text-sm font-bold text-slate-800">Total</td>
                <td className="px-6 py-3 text-right text-base font-bold text-slate-900">{formatINR(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Payments</h2>
            {canRecord && (
              <button onClick={() => setShowPaymentForm(v => !v)}
                className="rounded-lg px-4 py-1.5 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition">
                {showPaymentForm ? "Cancel" : "Record Payment"}
              </button>
            )}
          </div>

          {showPaymentForm && (
            <div className="px-6 py-5 border-b border-slate-100 bg-emerald-50 space-y-4">
              <p className="text-sm font-semibold text-emerald-800">Record a payment</p>
              {paymentError && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{paymentError}</div>}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Amount (INR) *</label>
                  <input type="number" min="0.01" step="0.01"
                    value={paymentForm.amount}
                    onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder={`Outstanding: ${outstanding.toFixed(2)}`}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Method *</label>
                  <select value={paymentForm.method}
                    onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value as PaymentMethod }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {ALL_METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Payment Date *</label>
                  <input type="date" value={paymentForm.paymentDate}
                    onChange={e => setPaymentForm(f => ({ ...f, paymentDate: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-600">Reference / UTR No.</label>
                  <input type="text" value={paymentForm.referenceNumber}
                    onChange={e => setPaymentForm(f => ({ ...f, referenceNumber: e.target.value }))}
                    placeholder="Cheque no., UTR, etc."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-slate-600">Notes</label>
                  <input type="text" value={paymentForm.notes}
                    onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional notes"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <button onClick={recordPayment} disabled={paymentBusy || !paymentForm.amount}
                className="rounded-lg px-5 py-2 text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition">
                {paymentBusy ? "Saving…" : "Save Payment"}
              </button>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Method</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500">Notes</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoice.payments.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-400">No payments recorded yet.</td></tr>
              ) : invoice.payments.map(pay => (
                <tr key={pay.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-600">{new Date(pay.paymentDate).toLocaleDateString("en-IN")}</td>
                  <td className="px-6 py-3 text-slate-600">{METHOD_LABELS[pay.method]}</td>
                  <td className="px-6 py-3 text-right font-semibold text-emerald-700">{formatINR(pay.amount)}</td>
                  <td className="px-6 py-3 text-slate-500 font-mono text-xs">{pay.referenceNumber ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600">
                      {PAYMENT_STATUS_LABELS[pay.status] ?? pay.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-400 text-xs">{pay.notes ?? "—"}</td>
                  <td className="px-6 py-3">
                    {pay.status === "RECORDED" && (
                      <button onClick={() => verifyPayment(pay.id)} disabled={verifyingId === pay.id}
                        className="text-xs font-semibold text-[#0F4C81] hover:underline disabled:opacity-50">
                        {verifyingId === pay.id ? "…" : "Verify"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-xs text-slate-400 space-y-1">
          <p>Created by: {invoice.createdBy} · {new Date(invoice.createdAt).toLocaleString("en-IN")}</p>
          {invoice.paymentTerms && <p>Payment terms: {invoice.paymentTerms}</p>}
          {invoice.cancellationReason && <p>Cancellation reason: {invoice.cancellationReason}</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
