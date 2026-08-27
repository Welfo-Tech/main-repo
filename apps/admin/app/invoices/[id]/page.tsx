"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import { api } from "../../../lib/api";
import type { Invoice, InvoiceStatus, PaymentMethod } from "../../../types/invoice";
import { METHOD_LABELS, STATUS_LABELS, formatINR, paidPercent } from "../../../types/invoice";

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
  whiteSpace: "nowrap" as const,
};

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

  if (loading) return <AdminLayout><div style={{ padding: "var(--w-s-6)", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</div></AdminLayout>;
  if (error && !invoice) return <AdminLayout><div style={{ padding: "var(--w-s-6)", color: "var(--w-attention-fg)", fontSize: "var(--w-fs-body)" }}>{error}</div></AdminLayout>;
  if (!invoice) return null;

  const pct = paidPercent(invoice);
  const nextStatuses = STATUS_ACTIONS[invoice.status] ?? [];
  const canRecord = !["PAID", "CANCELLED", "WRITTEN_OFF"].includes(invoice.status);
  const outstanding = Number(invoice.totalAmount) - Number(invoice.paidAmount);

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "1100px" }}>

        <div className="flex items-start justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: "var(--w-s-2)" }}>
              <Link href="/invoices" style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", textDecoration: "none" }}>Invoices</Link>
              <span style={{ color: "var(--w-text-mute)" }}>/</span>
              <span className="w-num" style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", fontFamily: "var(--w-font-head)", fontWeight: 600 }}>{invoice.invoiceNumber}</span>
              <span style={{ color: "var(--w-text-mute)" }}>·</span>
              <Link href={`/service-cases/${invoice.caseId}`} style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-link)", textDecoration: "none", fontFamily: "monospace" }}>
                {invoice.case.caseNumber}
              </Link>
            </div>
            <h1 className="w-num font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>{invoice.invoiceNumber}</h1>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>{invoice.organization.name}</p>
          </div>
          <StatusBadge status={invoice.status} variant="chip" />
        </div>

        {error && (
          <div style={{ background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", color: "var(--w-attention-fg)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--w-s-4)", marginBottom: "var(--w-s-5)" }}>
          {[
            { label: "Total Amount", value: formatINR(invoice.totalAmount), sub: `${formatINR(invoice.subtotal)} + ${formatINR(invoice.taxAmount)} GST`, color: "var(--w-text-1)" },
            { label: "Paid", value: formatINR(invoice.paidAmount), color: "var(--w-success-fg)" },
            { label: "Outstanding", value: formatINR(outstanding), sub: invoice.dueDate ? `Due ${new Date(invoice.dueDate).toLocaleDateString("en-IN")}` : undefined, color: outstanding > 0 ? "var(--w-attention-fg)" : "var(--w-text-mute)" },
          ].map(card => (
            <div key={card.label} className="bg-plate border border-border" style={{ padding: "var(--w-s-4)" }}>
              <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-2)" }}>{card.label}</p>
              <p className="w-num font-head font-semibold" style={{ fontSize: "var(--w-fs-metric)", color: card.color }}>{card.value}</p>
              {card.label === "Paid" && (
                <div className="flex items-center gap-2" style={{ marginTop: "var(--w-s-2)" }}>
                  <div style={{ flex: 1, height: "4px", background: "var(--w-sunken)", border: "1px solid var(--w-border)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--w-success-dot)", transition: "width var(--w-dur)" }} />
                  </div>
                  <span className="w-num" style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{pct}%</span>
                </div>
              )}
              {card.sub && (
                <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", marginTop: "var(--w-s-1)" }}>{card.sub}</p>
              )}
            </div>
          ))}
        </div>

        {nextStatuses.length > 0 && (
          <div className="bg-plate border border-border" style={{ padding: "var(--w-s-4)", marginBottom: "var(--w-s-5)" }}>
            <p className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", color: "var(--w-text-2)", letterSpacing: "0.09em", marginBottom: "var(--w-s-3)" }}>Status Actions</p>
            <div className="flex gap-3">
              {nextStatuses.map(s => (
                <button key={s} onClick={() => updateStatus(s)} disabled={statusBusy} className="font-head font-semibold uppercase"
                  style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", background: "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: statusBusy ? "not-allowed" : "pointer" }}>
                  Mark as {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-plate border border-border overflow-hidden" style={{ marginBottom: "var(--w-s-5)" }}>
          <div className="flex items-center border-b border-border bg-sunken" style={{ height: "var(--w-row-h)", paddingInline: "var(--w-s-4)" }}>
            <span className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", color: "var(--w-text-2)", letterSpacing: "0.09em" }}>Line Items</span>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--w-sunken)" }}>
                  {["#", "Type", "Description", "Qty", "Unit Price", "Disc%", "GST%", "Total"].map((h, hi) => (
                    <th key={h} style={{ ...TH_STYLE, textAlign: hi >= 3 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No line items yet.</td></tr>
                ) : invoice.lineItems.map((item, i) => (
                  <tr key={item.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < invoice.lineItems.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-mute)" }}>{item.sortOrder}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{item.itemType}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>{item.description}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", textAlign: "right" }}>{Number(item.quantity)}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", textAlign: "right" }}>{formatINR(item.unitPrice)}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-mute)", textAlign: "right" }}>{Number(item.discountPct)}%</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-mute)", textAlign: "right" }}>{Number(item.taxRate)}%</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500, textAlign: "right" }}>{formatINR(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--w-border)" }}>
                  <td colSpan={7} style={{ padding: "var(--w-s-2) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>Subtotal</td>
                  <td className="w-num" style={{ padding: "var(--w-s-2) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500 }}>{formatINR(invoice.subtotal)}</td>
                </tr>
                <tr>
                  <td colSpan={7} style={{ padding: "var(--w-s-2) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>GST</td>
                  <td className="w-num" style={{ padding: "var(--w-s-2) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{formatINR(invoice.taxAmount)}</td>
                </tr>
                <tr style={{ background: "var(--w-sunken)" }}>
                  <td colSpan={7} style={{ padding: "var(--w-s-3) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 600 }}>Total</td>
                  <td className="w-num" style={{ padding: "var(--w-s-3) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", fontWeight: 700 }}>{formatINR(invoice.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="bg-plate border border-border overflow-hidden" style={{ marginBottom: "var(--w-s-5)" }}>
          <div className="flex items-center justify-between border-b border-border bg-sunken" style={{ height: "var(--w-row-h)", paddingInline: "var(--w-s-4)" }}>
            <span className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", color: "var(--w-text-2)", letterSpacing: "0.09em" }}>Payments</span>
            {canRecord && (
              <button onClick={() => setShowPaymentForm(v => !v)} className="font-head font-semibold uppercase"
                style={{ height: "24px", paddingInline: "var(--w-s-3)", fontSize: "var(--w-fs-eyebrow)", background: showPaymentForm ? "transparent" : "var(--w-accent-strong)", color: showPaymentForm ? "var(--w-text-2)" : "#fff", border: showPaymentForm ? "1px solid var(--w-border)" : "none", letterSpacing: "0.06em", cursor: "pointer" }}>
                {showPaymentForm ? "Cancel" : "Record Payment"}
              </button>
            )}
          </div>

          {showPaymentForm && (
            <div style={{ padding: "var(--w-s-4)", borderBottom: "1px solid var(--w-border)", background: "var(--w-accent-tint)" }}>
              <p className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-text-2)", letterSpacing: "0.06em", marginBottom: "var(--w-s-3)" }}>Record a Payment</p>
              {paymentError && (
                <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                  {paymentError}
                </p>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--w-s-3)" }}>
                <div>
                  <label style={labelStyle}>Amount (INR) *</label>
                  <input type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))} placeholder={`Outstanding: ${outstanding.toFixed(2)}`} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Method *</label>
                  <select value={paymentForm.method} onChange={e => setPaymentForm(f => ({ ...f, method: e.target.value as PaymentMethod }))} style={{ ...inputStyle }}>
                    {ALL_METHODS.map(m => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Payment Date *</label>
                  <input type="date" value={paymentForm.paymentDate} onChange={e => setPaymentForm(f => ({ ...f, paymentDate: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Reference / UTR No.</label>
                  <input type="text" value={paymentForm.referenceNumber} onChange={e => setPaymentForm(f => ({ ...f, referenceNumber: e.target.value }))} placeholder="Cheque no., UTR, etc." style={inputStyle} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>Notes</label>
                  <input type="text" value={paymentForm.notes} onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes" style={inputStyle} />
                </div>
              </div>
              <button onClick={recordPayment} disabled={paymentBusy || !paymentForm.amount} className="font-head font-semibold uppercase"
                style={{ marginTop: "var(--w-s-3)", height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: paymentBusy ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: paymentBusy ? "not-allowed" : "pointer" }}>
                {paymentBusy ? "Saving…" : "Save Payment"}
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--w-sunken)" }}>
                  {["Date", "Method", "Amount", "Reference", "Status", "Notes", ""].map((h, hi) => (
                    <th key={h} style={{ ...TH_STYLE, textAlign: hi === 2 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoice.payments.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No payments recorded yet.</td></tr>
                ) : invoice.payments.map((pay, i) => (
                  <tr key={pay.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < invoice.payments.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", whiteSpace: "nowrap" }}>{new Date(pay.paymentDate).toLocaleDateString("en-IN")}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{METHOD_LABELS[pay.method]}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-success-fg)", fontWeight: 600, textAlign: "right" }}>{formatINR(pay.amount)}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", fontFamily: "monospace" }}>{pay.referenceNumber ?? "—"}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      <span style={{ fontSize: "var(--w-fs-badge)", background: "var(--w-neutral-tint)", color: "var(--w-neutral-fg)", border: "1px solid var(--w-neutral-edge)", padding: "2px 6px", fontFamily: "var(--w-font-body)", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                        {PAYMENT_STATUS_LABELS[pay.status] ?? pay.status}
                      </span>
                    </td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)" }}>{pay.notes ?? "—"}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                      {pay.status === "RECORDED" && (
                        <button onClick={() => verifyPayment(pay.id)} disabled={verifyingId === pay.id} className="font-head font-semibold uppercase"
                          style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-link)", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.04em" }}>
                          {verifyingId === pay.id ? "…" : "Verify"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background: "var(--w-sunken)", border: "1px solid var(--w-border)", padding: "var(--w-s-4)", fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)" }}>
          <p>Created by: {invoice.createdBy} · {new Date(invoice.createdAt).toLocaleString("en-IN")}</p>
          {invoice.paymentTerms && <p style={{ marginTop: "2px" }}>Payment terms: {invoice.paymentTerms}</p>}
          {invoice.cancellationReason && <p style={{ marginTop: "2px" }}>Cancellation reason: {invoice.cancellationReason}</p>}
        </div>
      </div>
    </AdminLayout>
  );
}
