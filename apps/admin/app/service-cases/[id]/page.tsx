"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../../components/layout/AdminLayout";
import { api } from "../../../lib/api";
import type { ServiceCase, ServiceCaseStatus } from "../../../types/service-case";
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  TYPE_LABELS,
} from "../../../types/service-case";

const STATUS_TRANSITIONS: Record<ServiceCaseStatus, ServiceCaseStatus[]> = {
  DRAFT: ["INTAKE", "CANCELLED"],
  INTAKE: ["ASSIGNED", "ON_HOLD", "CANCELLED"],
  ASSIGNED: ["UNDER_ASSESSMENT", "ON_HOLD", "CANCELLED"],
  UNDER_ASSESSMENT: ["AWAITING_QUOTE_APPROVAL", "WORK_AUTHORIZED", "IRREPAIRABLE", "ON_HOLD", "CANCELLED"],
  AWAITING_QUOTE_APPROVAL: ["WORK_AUTHORIZED", "QUOTE_REJECTED", "ON_HOLD", "CANCELLED"],
  WORK_AUTHORIZED: ["IN_REPAIR", "ON_HOLD", "CANCELLED"],
  IN_REPAIR: ["QC_PENDING", "ON_HOLD"],
  QC_PENDING: ["QC_PASSED", "QC_FAILED"],
  QC_PASSED: ["DISPATCH_READY"],
  QC_FAILED: ["IN_REPAIR", "IRREPAIRABLE"],
  DISPATCH_READY: ["DISPATCHED"],
  DISPATCHED: ["DELIVERED"],
  DELIVERED: ["CLOSED"],
  CLOSED: [],
  ON_HOLD: ["ASSIGNED", "IN_REPAIR", "CANCELLED"],
  IRREPAIRABLE: ["CLOSED"],
  QUOTE_REJECTED: ["CANCELLED", "CLOSED"],
  CANCELLED: [],
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value ?? "—"}</p>
    </div>
  );
}

export default function ServiceCaseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [sc, setSc] = useState<ServiceCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ServiceCaseStatus | "">("");
  const [cancellationReason, setCancellationReason] = useState("");
  const [holdReason, setHoldReason] = useState("");

  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.get<ServiceCase>(`/api/v1/service-cases/${id}`);
      setSc(data);
      setSelectedStatus("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load case");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCase();
  }, [fetchCase]);

  async function handleStatusUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStatus) return;
    setUpdating(true);
    setUpdateError("");
    try {
      await api.patch(`/api/v1/service-cases/${id}`, {
        status: selectedStatus,
        ...(selectedStatus === "CANCELLED" && cancellationReason
          ? { cancellationReason }
          : {}),
        ...(selectedStatus === "ON_HOLD" && holdReason ? { holdReason } : {}),
      });
      await fetchCase();
      setCancellationReason("");
      setHoldReason("");
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8 text-slate-400">Loading…</div>
      </AdminLayout>
    );
  }

  if (error || !sc) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error || "Case not found."}
          </div>
          <Link href="/service-cases" className="mt-4 inline-block text-sm text-[#0F4C81] hover:underline">
            ← Back to Service Cases
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const nextStatuses = STATUS_TRANSITIONS[sc.status] ?? [];

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-4xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <Link href="/service-cases" className="text-xs text-slate-400 hover:text-[#0F4C81]">
              ← Service Cases
            </Link>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 font-mono">
              {sc.caseNumber}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{TYPE_LABELS[sc.type]}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-semibold ${STATUS_COLORS[sc.status]}`}
            >
              {STATUS_LABELS[sc.status]}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${PRIORITY_COLORS[sc.priority]}`}
            >
              {PRIORITY_LABELS[sc.priority]} priority
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-3">
          <Field label="Organization" value={sc.organization.name} />
          <Field
            label="Product"
            value={
              <span className="font-mono">
                {sc.product.serialNumber}
                {sc.product.model ? ` · ${sc.product.model.name}` : ""}
              </span>
            }
          />
          <Field
            label="Contact"
            value={sc.contact ? `${sc.contact.name}${sc.contact.phone ? ` · ${sc.contact.phone}` : ""}` : null}
          />
          <Field
            label="Technician"
            value={sc.technician ? sc.technician.user.name : null}
          />
          <Field label="Billable" value={sc.isBillable ? "Yes" : "No"} />
          <Field
            label="SLA Deadline"
            value={
              sc.slaDeadline
                ? new Date(sc.slaDeadline).toLocaleDateString("en-IN")
                : null
            }
          />
          {sc.ticket && (
            <Field label="From Ticket" value={sc.ticket.ticketNumber} />
          )}
          <Field
            label="Opened"
            value={new Date(sc.createdAt).toLocaleDateString("en-IN")}
          />
          {sc.closedAt && (
            <Field
              label="Closed"
              value={new Date(sc.closedAt).toLocaleDateString("en-IN")}
            />
          )}
        </div>

        {sc.intakeCondition && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">
              Intake Condition
            </p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{sc.intakeCondition}</p>
          </div>
        )}

        {sc.holdReason && (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-orange-500 mb-2">
              Hold Reason
            </p>
            <p className="text-sm text-orange-800">{sc.holdReason}</p>
          </div>
        )}

        {sc.cancellationReason && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <p className="text-xs font-medium uppercase tracking-wide text-red-500 mb-2">
              Cancellation Reason
            </p>
            <p className="text-sm text-red-800">{sc.cancellationReason}</p>
          </div>
        )}

        {nextStatuses.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Update Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s === selectedStatus ? "" : s)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold border transition ${
                      selectedStatus === s
                        ? "bg-[#0F4C81] text-white border-[#0F4C81]"
                        : "border-slate-300 text-slate-600 hover:border-[#0F4C81] hover:text-[#0F4C81]"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>

              {selectedStatus === "CANCELLED" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Cancellation Reason
                  </label>
                  <textarea
                    rows={2}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Why is this case being cancelled?"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
              )}

              {selectedStatus === "ON_HOLD" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Hold Reason
                  </label>
                  <textarea
                    rows={2}
                    value={holdReason}
                    onChange={(e) => setHoldReason(e.target.value)}
                    placeholder="Why is this case being put on hold?"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8]"
                  />
                </div>
              )}

              {updateError && <p className="text-sm text-red-600">{updateError}</p>}

              {selectedStatus && (
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-xl bg-[#0F4C81] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a3560] disabled:opacity-60"
                >
                  {updating ? "Updating…" : `Move to ${STATUS_LABELS[selectedStatus]}`}
                </button>
              )}
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
