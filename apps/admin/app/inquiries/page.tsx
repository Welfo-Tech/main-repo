"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../lib/api";
import type { WebInquiry, WebInquiryStatus } from "../../types/inquiry";
import { STATUS_LABELS, URGENCY_COLORS, URGENCY_LABELS } from "../../types/inquiry";

const ALL_STATUSES: WebInquiryStatus[] = ["PENDING", "ACKNOWLEDGED", "CONVERTED", "CLOSED"];

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

const TD_STYLE: React.CSSProperties = {
  padding: "var(--w-s-2) var(--w-s-3)",
  fontSize: "var(--w-fs-cell)",
  fontFamily: "var(--w-font-body)",
  color: "var(--w-text-1)",
  borderBottom: "1px solid var(--w-border)",
  verticalAlign: "top",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<WebInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<WebInquiryStatus | "">("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const url = `/api/v1/inquiries${params.toString() ? "?" + params.toString() : ""}`;
      const data = await api.get<WebInquiry[]>(url);
      setInquiries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  async function handleStatusChange(id: string, status: WebInquiryStatus) {
    setUpdatingId(id);
    try {
      await api.patch(`/api/v1/inquiries/${id}`, { status });
      await fetchInquiries();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = inquiries.filter(i => i.status === "PENDING").length;

  const actionBtn: React.CSSProperties = {
    height: "24px",
    paddingInline: "var(--w-s-3)",
    fontSize: "var(--w-fs-eyebrow)",
    fontFamily: "var(--w-font-head)",
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    border: "1px solid var(--w-border)",
    background: "var(--w-plate)",
    color: "var(--w-text-2)",
  };

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "var(--w-page-max)" }}>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <div>
            <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
              Web Inquiries
            </h1>
            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", marginTop: "var(--w-s-1)" }}>
              {loading ? "Loading…" : `${inquiries.length} total${pendingCount > 0 ? ` · ${pendingCount} pending` : ""}`}
            </p>
          </div>
          <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)" }}>
            Submitted from welfoendovision.com
          </p>
        </div>

        <div className="flex gap-2 flex-wrap" style={{ marginBottom: "var(--w-s-4)" }}>
          {(["", ...ALL_STATUSES] as (WebInquiryStatus | "")[]).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="font-head font-semibold uppercase"
              style={{
                height: "var(--w-control-h)",
                paddingInline: "var(--w-s-3)",
                fontSize: "var(--w-fs-label)",
                letterSpacing: "0.06em",
                border: `1px solid ${statusFilter === s ? "var(--w-accent-strong)" : "var(--w-border)"}`,
                background: statusFilter === s ? "var(--w-accent-tint)" : "transparent",
                color: statusFilter === s ? "var(--w-accent-strong)" : "var(--w-text-2)",
                cursor: "pointer",
              }}
            >
              {s === "" ? "All" : STATUS_LABELS[s as WebInquiryStatus]}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>Loading…</p>
        ) : inquiries.length === 0 ? (
          <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No inquiries yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--w-border)" }}>
              <thead>
                <tr style={{ background: "var(--w-plate)" }}>
                  <th style={TH_STYLE}>Inquiry #</th>
                  <th style={TH_STYLE}>From</th>
                  <th style={TH_STYLE}>Organization</th>
                  <th style={TH_STYLE}>Product</th>
                  <th style={TH_STYLE}>Urgency</th>
                  <th style={TH_STYLE}>Received</th>
                  <th style={TH_STYLE}>Status</th>
                  <th style={TH_STYLE}></th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inq => (
                  <>
                    <tr key={inq.id} style={{ background: "var(--w-surface)" }}>
                      <td style={{ ...TD_STYLE, fontFamily: "var(--w-font-head)", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {inq.inquiryNumber}
                      </td>
                      <td style={TD_STYLE}>
                        <div style={{ fontWeight: 500 }}>{inq.submitterName}</div>
                        <div style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{inq.submitterEmail}</div>
                        {inq.submitterPhone && (
                          <div style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>{inq.submitterPhone}</div>
                        )}
                      </td>
                      <td style={TD_STYLE}>
                        <div>{inq.organizationName}</div>
                        {inq.city && (
                          <div style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)" }}>{inq.city}</div>
                        )}
                      </td>
                      <td style={TD_STYLE}>
                        <div>{inq.productModel}</div>
                        {inq.serialNumber && (
                          <div style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)", fontFamily: "monospace" }}>
                            {inq.serialNumber}
                          </div>
                        )}
                      </td>
                      <td style={TD_STYLE}>
                        <span className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: URGENCY_COLORS[inq.urgency], display: "inline-block" }} />
                          <span style={{ fontSize: "var(--w-fs-caption)" }}>{URGENCY_LABELS[inq.urgency]}</span>
                        </span>
                      </td>
                      <td style={{ ...TD_STYLE, color: "var(--w-text-2)", whiteSpace: "nowrap" }}>
                        {new Date(inq.submittedAt).toLocaleDateString("en-IN")}
                      </td>
                      <td style={TD_STYLE}>
                        <StatusBadge status={inq.status} variant="row" />
                      </td>
                      <td style={TD_STYLE}>
                        <div className="flex items-center gap-2" style={{ whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                            style={actionBtn}
                          >
                            {expandedId === inq.id ? "Hide" : "Details"}
                          </button>
                          {inq.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(inq.id, "ACKNOWLEDGED")}
                              disabled={updatingId === inq.id}
                              style={{ ...actionBtn, background: "var(--w-accent-strong)", color: "#fff", borderColor: "var(--w-accent-strong)" }}
                            >
                              Acknowledge
                            </button>
                          )}
                          {inq.status === "ACKNOWLEDGED" && (
                            <>
                              <button
                                onClick={() => handleStatusChange(inq.id, "CONVERTED")}
                                disabled={updatingId === inq.id}
                                style={{ ...actionBtn, background: "var(--w-success-tint)", color: "var(--w-success-fg)", borderColor: "var(--w-success-edge)" }}
                              >
                                Mark Converted
                              </button>
                              <button
                                onClick={() => handleStatusChange(inq.id, "CLOSED")}
                                disabled={updatingId === inq.id}
                                style={actionBtn}
                              >
                                Close
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === inq.id && (
                      <tr key={`${inq.id}-detail`} style={{ background: "var(--w-sunken)" }}>
                        <td colSpan={8} style={{ ...TD_STYLE, padding: "var(--w-s-4)" }}>
                          <p className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", letterSpacing: "0.09em", color: "var(--w-text-2)", marginBottom: "var(--w-s-2)" }}>
                            Reported Problem
                          </p>
                          <p style={{ fontSize: "var(--w-fs-body)", color: "var(--w-text-1)", lineHeight: 1.6, marginBottom: "var(--w-s-3)" }}>
                            {inq.reportedProblem}
                          </p>
                          {inq.purchaseDate && (
                            <p style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>
                              Purchased: {new Date(inq.purchaseDate).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
