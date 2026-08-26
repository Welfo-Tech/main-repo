"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import type { GstType, Quote, QuoteLineItemType, QuoteStatus } from "../../../types/quote";
import { ITEM_TYPE_LABELS, STATUS_COLORS, STATUS_LABELS, formatINR } from "../../../types/quote";

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
  const [itemForm, setItemForm] = useState<ItemForm>(emptyItem);
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

  if (loading) return <AdminLayout><div className="p-8 text-slate-400">Loading…</div></AdminLayout>;
  if (error || !quote) return (
    <AdminLayout>
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error || "Quote not found."}</div>
        <Link href="/quotes" className="mt-4 inline-block text-sm text-[#0F4C81] hover:underline">← Back to Quotes</Link>
      </div>
    </AdminLayout>
  );

  const actions = STATUS_ACTIONS[quote.status] ?? [];
  const canEdit = quote.status === "DRAFT" || quote.status === "UNDER_REVIEW";

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-5xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Link href="/quotes" className="text-xs text-slate-400 hover:text-[#0F4C81]">← Quotes</Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 font-mono">{quote.quoteNumber} <span className="text-slate-400 text-base font-normal">v{quote.version}</span></h1>
            <p className="mt-1 text-sm text-slate-500">
              <Link href={`/service-cases/${quote.caseId}`} className="text-[#0F4C81] hover:underline">{quote.case.caseNumber}</Link>
              {" · "}{quote.case.organization.name}
            </p>
          </div>
          <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_COLORS[quote.status]}`}>
            {STATUS_LABELS[quote.status]}
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-800">Line Items</h2>
            {canEdit && (
              <button
                onClick={() => setShowAddItem(!showAddItem)}
                className="rounded-lg bg-[#0F4C81] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a3560] transition"
              >{showAddItem ? "Cancel" : "+ Add Item"}</button>
            )}
          </div>

          {showAddItem && (
            <form onSubmit={handleAddItem} className="px-6 py-5 border-b border-slate-100 bg-slate-50 space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                  <select value={itemForm.itemType} onChange={e => setItemForm(f => ({ ...f, itemType: e.target.value as QuoteLineItemType }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]">
                    {ALL_TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_LABELS[t]}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
                  <input value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="e.g. Optical fiber bundle replacement"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Qty</label>
                  <input type="number" min={0.001} step={0.001} value={itemForm.quantity} onChange={e => setItemForm(f => ({ ...f, quantity: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Unit Price (₹)</label>
                  <input type="number" min={0} step={0.01} value={itemForm.unitPrice} onChange={e => setItemForm(f => ({ ...f, unitPrice: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Discount %</label>
                  <input type="number" min={0} max={100} step={0.01} value={itemForm.discountPct} onChange={e => setItemForm(f => ({ ...f, discountPct: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">GST %</label>
                  <input type="number" min={0} max={100} step={0.01} value={itemForm.taxRate} onChange={e => setItemForm(f => ({ ...f, taxRate: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">HSN Code</label>
                  <input value={itemForm.hsnCode} onChange={e => setItemForm(f => ({ ...f, hsnCode: e.target.value }))}
                    placeholder="e.g. 9018"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">GST Type</label>
                  <select value={itemForm.gstType} onChange={e => setItemForm(f => ({ ...f, gstType: e.target.value as GstType }))}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#00B4D8]">
                    <option value="CGST_SGST">CGST + SGST</option>
                    <option value="IGST">IGST</option>
                    <option value="EXEMPT">Exempt</option>
                  </select>
                </div>
              </div>
              {addItemError && <p className="text-xs text-red-600">{addItemError}</p>}
              <button type="submit" disabled={addingItem}
                className="rounded-lg bg-[#0F4C81] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0a3560] disabled:opacity-60 transition">
                {addingItem ? "Adding…" : "Add Line Item"}
              </button>
            </form>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Type</th>
                <th className="px-6 py-3 text-left font-semibold text-slate-600">Description</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">Qty</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">Unit Price</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">Disc%</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">GST%</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-600">Line Total</th>
                {canEdit && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody>
              {quote.lineItems.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-400">No line items yet. Add one above.</td></tr>
              ) : quote.lineItems.map(li => (
                <tr key={li.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-500 text-xs">{ITEM_TYPE_LABELS[li.itemType]}</td>
                  <td className="px-6 py-3 text-slate-800">{li.description}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{Number(li.quantity).toFixed(2)}</td>
                  <td className="px-6 py-3 text-right text-slate-600">{formatINR(li.unitPrice)}</td>
                  <td className="px-6 py-3 text-right text-slate-500">{Number(li.discountPct).toFixed(0)}%</td>
                  <td className="px-6 py-3 text-right text-slate-500">{Number(li.taxRate).toFixed(0)}%</td>
                  <td className="px-6 py-3 text-right font-medium text-slate-800">{formatINR(li.lineTotal)}</td>
                  {canEdit && (
                    <td className="px-6 py-3">
                      <button onClick={() => handleRemoveItem(li.id)} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200">
                <td colSpan={canEdit ? 6 : 5} className="px-6 py-3 text-right text-sm text-slate-500">Subtotal</td>
                <td className="px-6 py-3 text-right font-medium text-slate-800">{formatINR(quote.subtotal)}</td>
                {canEdit && <td />}
              </tr>
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="px-6 py-2 text-right text-sm text-slate-500">GST</td>
                <td className="px-6 py-2 text-right text-slate-600">{formatINR(quote.taxAmount)}</td>
                {canEdit && <td />}
              </tr>
              <tr className="bg-slate-50">
                <td colSpan={canEdit ? 6 : 5} className="px-6 py-3 text-right font-semibold text-slate-700">Total</td>
                <td className="px-6 py-3 text-right font-bold text-slate-900 text-base">{formatINR(quote.totalAmount)}</td>
                {canEdit && <td />}
              </tr>
            </tfoot>
          </table>
        </div>

        {actions.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-slate-800">Update Status</h2>
            {pendingStatus === "APPROVED" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Approved by (name)</label>
                <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} placeholder="Contact person who approved"
                  className="w-full max-w-xs rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]" />
              </div>
            )}
            {pendingStatus === "REJECTED" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rejection reason</label>
                <textarea rows={2} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                  className="w-full max-w-md rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]" />
              </div>
            )}
            {updateError && <p className="text-sm text-red-600">{updateError}</p>}
            <div className="flex flex-wrap gap-3">
              {actions.map(a => (
                <button
                  key={a.next}
                  onClick={() => {
                    if (a.next === "APPROVED" || a.next === "REJECTED") {
                      setPendingStatus(a.next);
                    } else {
                      handleStatusUpdate(a.next);
                    }
                  }}
                  disabled={updating}
                  className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#0F4C81] hover:text-[#0F4C81] transition disabled:opacity-60"
                >{a.label}</button>
              ))}
              {pendingStatus && (
                <button
                  onClick={() => handleStatusUpdate(pendingStatus)}
                  disabled={updating}
                  className="rounded-xl bg-[#0F4C81] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a3560] transition disabled:opacity-60"
                >{updating ? "Updating…" : `Confirm: ${STATUS_LABELS[pendingStatus]}`}</button>
              )}
            </div>
          </div>
        )}

        {quote.approvedByName && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600 mb-1">Approved</p>
            <p className="text-sm text-emerald-800">By <strong>{quote.approvedByName}</strong>{quote.approvedAt ? ` on ${new Date(quote.approvedAt).toLocaleDateString("en-IN")}` : ""}{quote.approvalMethod ? ` via ${quote.approvalMethod.toLowerCase().replace("_", " ")}` : ""}</p>
          </div>
        )}

        {quote.rejectionReason && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-red-500 mb-1">Rejection Reason</p>
            <p className="text-sm text-red-800">{quote.rejectionReason}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}