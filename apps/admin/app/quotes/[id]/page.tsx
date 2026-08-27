"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import StatusBadge from "../../../components/common/StatusBadge";
import { api } from "../../../lib/api";
import type { GstType, Quote, QuoteLineItemType, QuoteStatus } from "../../../types/quote";
import { ITEM_TYPE_LABELS, STATUS_LABELS, formatINR } from "../../../types/quote";

const STATUS_ACTIONS: Partial<Record<QuoteStatus, { label: string; next: QuoteStatus }[]>> = {
  DRAFT: [{ label: "Submit for Review", next: "UNDER_REVIEW" }],
  UNDER_REVIEW: [
    { label: "Mark as Sent", next: "SENT" },
    { label: "Back to Draft", next: "DRAFT" },
  ],
  SENT: [
    { label: "Mark Approved", next: "APPROVED" },
    { label: "Mark Rejected", next: "REJECTED" },
    { label: "Mark Expired", next: "EXPIRED" },
  ],
};

const ALL_TYPES: QuoteLineItemType[] = ["LABOR", "PART", "SHIPPING", "OTHER"];

interface ItemForm {
  itemType: QuoteLineItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
  taxRate: number;
  hsnCode: string;
  gstType: GstType;
}

const emptyItem = (): ItemForm => ({
  itemType: "LABOR",
  description: "",
  quantity: 1,
  unitPrice: 0,
  discountPct: 0,
  taxRate: 18,
  hsnCode: "",
  gstType: "CGST_SGST",
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

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingStatus, setPendingStatus] = useState<QuoteStatus | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem());
  const [addingItem, setAddingItem] = useState(false);
  const [addItemError, setAddItemError] = useState("");

  const fetchQuote = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<Quote>(`/api/v1/quotes/${id}`);
      setQuote(data);
      setPendingStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load quote");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchQuote(); }, [fetchQuote]);

  async function handleStatusUpdate(next: QuoteStatus) {
    setUpdating(true);
    setUpdateError("");
    try {
      await api.patch(`/api/v1/quotes/${id}`, {
        status: next,
        ...(next === "APPROVED" && approvedBy ? { approvedByName: approvedBy, approvedAt: new Date().toISOString(), approvalMethod: "IN_PERSON" } : {}),
        ...(next === "REJECTED" && rejectionReason ? { rejectionReason } : {}),
      });
      await fetchQuote();
      setApprovedBy("");
      setRejectionReason("");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  }

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemForm.description.trim()) { setAddItemError("Description is required."); return; }
    setAddingItem(true);
    setAddItemError("");
    try {
      await api.post(`/api/v1/quotes/${id}/line-items`, {
        itemType: itemForm.itemType,
        description: itemForm.description.trim(),
        quantity: itemForm.quantity,
        unitPrice: itemForm.unitPrice,
        discountPct: itemForm.discountPct,
        taxRate: itemForm.taxRate,
        ...(itemForm.hsnCode.trim() ? { hsnCode: itemForm.hsnCode.trim() } : {}),
        gstType: itemForm.gstType,
      });
      setItemForm(emptyItem());
      setShowAddItem(false);
      await fetchQuote();
    } catch (err) {
      setAddItemError(err instanceof Error ? err.message : "Failed to add item");
    } finally {
      setAddingItem(false);
    }
  }

  async function handleRemoveItem(itemId: string) {
    try {
      await api.del(`/api/v1/quotes/${id}/line-items/${itemId}`);
      await fetchQuote();
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to remove item");
    }
  }

  if (loading) return <AdminLayout><div style={{ padding: "var(--w-s-6)", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</div></AdminLayout>;
  if (error || !quote) return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-6)" }}>
        <p style={{ color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "var(--w-fs-body)" }}>{error || "Quote not found."}</p>
        <Link href="/quotes" style={{ display: "inline-block", marginTop: "var(--w-s-4)", color: "var(--w-link)", fontSize: "var(--w-fs-body)", textDecoration: "none" }}>← Back to Quotes</Link>
      </div>
    </AdminLayout>
  );

  const actions = STATUS_ACTIONS[quote.status] ?? [];
  const canEdit = quote.status === "DRAFT" || quote.status === "UNDER_REVIEW";

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "1100px" }}>

        <div className="flex items-start justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: "var(--w-s-2)" }}>
              <Link href="/quotes" style={{ color: "var(--w-link)", fontSize: "var(--w-fs-caption)", textDecoration: "none" }}>Quotes</Link>
              <span style={{ color: "var(--w-text-mute)" }}>/</span>
              <span className="w-num" style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", fontFamily: "var(--w-font-head)", fontWeight: 600 }}>{quote.quoteNumber}</span>
            </div>
            <h1 className="w-num font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
              {quote.quoteNumber} <span style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-mute)", fontWeight: 400 }}>v{quote.version}</span>
            </h1>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              <Link href={`/service-cases/${quote.caseId}`} style={{ color: "var(--w-link)", textDecoration: "none" }}>{quote.case.caseNumber}</Link>
              {" · "}{quote.case.organization.name}
            </p>
          </div>
          <StatusBadge status={quote.status} variant="chip" />
        </div>

        <div className="bg-plate border border-border overflow-hidden" style={{ marginBottom: "var(--w-s-5)" }}>
          <div className="flex items-center justify-between border-b border-border bg-sunken" style={{ height: "var(--w-row-h)", paddingInline: "var(--w-s-4)" }}>
            <span className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", color: "var(--w-text-2)", letterSpacing: "0.09em" }}>Line Items</span>
            {canEdit && (
              <button onClick={() => setShowAddItem(!showAddItem)} className="font-head font-semibold uppercase"
                style={{ height: "24px", paddingInline: "var(--w-s-3)", fontSize: "var(--w-fs-eyebrow)", background: "var(--w-accent-strong)", color: "#fff", border: "none", letterSpacing: "0.06em", cursor: "pointer" }}>
                {showAddItem ? "Cancel" : "+ Add Item"}
              </button>
            )}
          </div>

          {showAddItem && (
            <form onSubmit={handleAddItem} style={{ padding: "var(--w-s-4)", borderBottom: "1px solid var(--w-border)", background: "var(--w-sunken)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--w-s-3)" }}>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select value={itemForm.itemType} onChange={e => setItemForm(f => ({ ...f, itemType: e.target.value as QuoteLineItemType }))} style={{ ...inputStyle }}>
                    {ALL_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "span 3" }}>
                  <label style={labelStyle}>Description *</label>
                  <input value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Optical fiber bundle replacement" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Qty</label>
                  <input type="number" min={0.001} step={0.001} value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Unit Price (₹)</label>
                  <input type="number" min={0} step={0.01} value={itemForm.unitPrice} onChange={e => setItemForm(f => ({ ...f, unitPrice: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Discount %</label>
                  <input type="number" min={0} max={100} step={0.01} value={itemForm.discountPct} onChange={e => setItemForm(f => ({ ...f, discountPct: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GST %</label>
                  <input type="number" min={0} max={100} step={0.01} value={itemForm.taxRate} onChange={e => setItemForm(f => ({ ...f, taxRate: Number(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>HSN Code</label>
                  <input value={itemForm.hsnCode} onChange={e => setItemForm(f => ({ ...f, hsnCode: e.target.value }))} placeholder="e.g. 9018" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>GST Type</label>
                  <select value={itemForm.gstType} onChange={e => setItemForm(f => ({ ...f, gstType: e.target.value as GstType }))} style={{ ...inputStyle }}>
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="IGST">IGST</option>
                    <option value="EXEMPT">Exempt</option>
                  </select>
                </div>
              </div>
              {addItemError && (
                <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginTop: "var(--w-s-2)" }}>
                  {addItemError}
                </p>
              )}
              <button type="submit" disabled={addingItem} className="font-head font-semibold uppercase"
                style={{ marginTop: "var(--w-s-3)", height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: addingItem ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: addingItem ? "not-allowed" : "pointer" }}>
                {addingItem ? "Adding…" : "Add Line Item"}
              </button>
            </form>
          )}

          <div className="overflow-x-auto">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--w-sunken)" }}>
                  <th style={{ ...TH_STYLE, textAlign: "left" }}>Type</th>
                  <th style={{ ...TH_STYLE, textAlign: "left" }}>Description</th>
                  <th style={{ ...TH_STYLE, textAlign: "right" }}>Qty</th>
                  <th style={{ ...TH_STYLE, textAlign: "right" }}>Unit Price</th>
                  <th style={{ ...TH_STYLE, textAlign: "right" }}>Disc%</th>
                  <th style={{ ...TH_STYLE, textAlign: "right" }}>GST%</th>
                  <th style={{ ...TH_STYLE, textAlign: "right" }}>Line Total</th>
                  {canEdit && <th style={TH_STYLE} />}
                </tr>
              </thead>
              <tbody>
                {quote.lineItems.length === 0 ? (
                  <tr><td colSpan={canEdit ? 8 : 7} style={{ padding: "var(--w-s-6)", textAlign: "center", color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No line items yet. Add one above.</td></tr>
                ) : quote.lineItems.map((li, i) => (
                  <tr key={li.id} className="hover:bg-row-hover transition-colors duration-fast"
                    style={{ borderBottom: i < quote.lineItems.length - 1 ? "1px solid var(--w-border-soft)" : undefined }}>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{ITEM_TYPE_LABELS[li.itemType]}</td>
                    <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>{li.description}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", textAlign: "right" }}>{Number(li.quantity).toFixed(2)}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)", textAlign: "right" }}>{formatINR(li.unitPrice)}</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-mute)", textAlign: "right" }}>{Number(li.discountPct).toFixed(0)}%</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-mute)", textAlign: "right" }}>{Number(li.taxRate).toFixed(0)}%</td>
                    <td className="w-num" style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500, textAlign: "right" }}>{formatINR(li.lineTotal)}</td>
                    {canEdit && (
                      <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                        <button onClick={() => handleRemoveItem(li.id)} style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-dot)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--w-font-head)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          Remove
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ borderTop: "2px solid var(--w-border)" }}>
                  <td colSpan={canEdit ? 6 : 5} style={{ padding: "var(--w-s-3) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>Subtotal</td>
                  <td className="w-num" style={{ padding: "var(--w-s-3) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 500 }}>{formatINR(quote.subtotal)}</td>
                  {canEdit && <td />}
                </tr>
                <tr>
                  <td colSpan={canEdit ? 6 : 5} style={{ padding: "var(--w-s-2) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>GST</td>
                  <td className="w-num" style={{ padding: "var(--w-s-2) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>{formatINR(quote.taxAmount)}</td>
                  {canEdit && <td />}
                </tr>
                <tr style={{ background: "var(--w-sunken)" }}>
                  <td colSpan={canEdit ? 6 : 5} style={{ padding: "var(--w-s-3) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 600 }}>Total</td>
                  <td className="w-num" style={{ padding: "var(--w-s-3) var(--w-s-3)", textAlign: "right", fontSize: "var(--w-fs-section)", color: "var(--w-text-1)", fontWeight: 700 }}>{formatINR(quote.totalAmount)}</td>
                  {canEdit && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {actions.length > 0 && (
          <div className="bg-plate border border-border" style={{ padding: "var(--w-s-5)", marginBottom: "var(--w-s-5)" }}>
            <h2 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-subsection)", color: "var(--w-text-1)", marginBottom: "var(--w-s-4)" }}>Update Status</h2>

            {pendingStatus === "APPROVED" && (
              <div style={{ marginBottom: "var(--w-s-3)" }}>
                <label style={{ ...labelStyle, display: "block", marginBottom: "var(--w-s-1)" }}>Approved by (name)</label>
                <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Contact person who approved" style={{ ...inputStyle, maxWidth: "300px" }} />
              </div>
            )}

            {pendingStatus === "REJECTED" && (
              <div style={{ marginBottom: "var(--w-s-3)" }}>
                <label style={{ ...labelStyle, display: "block", marginBottom: "var(--w-s-1)" }}>Rejection reason</label>
                <textarea rows={2} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} style={{ ...inputStyle, height: "auto", padding: "var(--w-s-2)", maxWidth: "400px" }} />
              </div>
            )}

            {updateError && (
              <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", marginBottom: "var(--w-s-3)" }}>
                {updateError}
              </p>
            )}

            <div className="flex flex-wrap gap-3">
              {actions.map(a => (
                <button key={a.next}
                  onClick={() => {
                    if (a.next === "APPROVED" || a.next === "REJECTED") { setPendingStatus(a.next); }
                    else { handleStatusUpdate(a.next); }
                  }}
                  disabled={updating}
                  className="font-head font-semibold uppercase"
                  style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-4)", border: "1px solid var(--w-border)", background: "transparent", color: "var(--w-text-2)", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: "pointer" }}>
                  {a.label}
                </button>
              ))}
              {pendingStatus && (
                <button onClick={() => handleStatusUpdate(pendingStatus)} disabled={updating} className="font-head font-semibold uppercase"
                  style={{ height: "var(--w-control-h)", paddingInline: "var(--w-s-5)", background: updating ? "var(--w-text-mute)" : "var(--w-accent-strong)", color: "#fff", border: "none", fontSize: "var(--w-fs-label)", letterSpacing: "0.06em", cursor: updating ? "not-allowed" : "pointer" }}>
                  {updating ? "Updating…" : `Confirm: ${STATUS_LABELS[pendingStatus]}`}
                </button>
              )}
            </div>
          </div>
        )}

        {quote.approvedByName && (
          <div style={{ background: "var(--w-success-tint)", border: "1px solid var(--w-success-edge)", padding: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
            <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-success-fg)", letterSpacing: "0.06em", marginBottom: "var(--w-s-1)" }}>Approved</p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-success-fg)" }}>
              By <strong>{quote.approvedByName}</strong>
              {quote.approvedAt ? ` on ${new Date(quote.approvedAt).toLocaleDateString("en-IN")}` : ""}
              {quote.approvalMethod ? ` via ${quote.approvalMethod.toLowerCase().replace("_", " ")}` : ""}
            </p>
          </div>
        )}

        {quote.rejectionReason && (
          <div style={{ background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-4)" }}>
            <p className="font-head font-medium uppercase" style={{ fontSize: "var(--w-fs-label)", color: "var(--w-attention-fg)", letterSpacing: "0.06em", marginBottom: "var(--w-s-1)" }}>Rejection Reason</p>
            <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-attention-fg)" }}>{quote.rejectionReason}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
