"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { api } from "../../lib/api";

interface Stats {
  openCases: number;
  pendingQuotes: number;
  unpaidInvoices: number;
  totalOrganizations: number;
}

interface Case {
  id: string;
  caseNumber: string;
  status: string;
  priority: string;
  product?: { serialNumber: string };
  organization?: { name: string };
  createdAt: string;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  OPEN:                 { label: "Open",            color: "var(--w-progress-dot)" },
  IN_PROGRESS:          { label: "In Progress",     color: "var(--w-progress-dot)" },
  PENDING_PARTS:        { label: "Pending Parts",   color: "var(--w-waiting-dot)" },
  WAITING_FOR_CUSTOMER: { label: "Wait — Customer", color: "var(--w-waiting-dot)" },
  ESCALATED:            { label: "Escalated",       color: "var(--w-attention-dot)" },
};

const PRIO_COLOR: Record<string, string> = {
  CRITICAL: "var(--w-prio-critical)",
  HIGH:     "var(--w-prio-high)",
  NORMAL:   "var(--w-prio-normal)",
  LOW:      "var(--w-prio-low)",
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div
      className="bg-plate border border-border"
      style={{ padding: "var(--w-s-4) var(--w-s-5)" }}
    >
      <p
        className="font-head font-semibold uppercase"
        style={{
          fontSize: "var(--w-fs-eyebrow)",
          color: "var(--w-text-2)",
          letterSpacing: "0.09em",
          marginBottom: "var(--w-s-2)",
        }}
      >
        {label}
      </p>
      <p
        className="font-head font-semibold w-num"
        style={{ fontSize: "var(--w-fs-metric)", color: "var(--w-text-1)" }}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cases, quotes, invoices, orgs] = await Promise.all([
          api.get<Case[]>("/api/v1/service-cases?limit=10"),
          api.get<unknown[]>("/api/v1/quotes?status=UNDER_REVIEW"),
          api.get<unknown[]>("/api/v1/invoices?status=OVERDUE"),
          api.get<unknown[]>("/api/v1/organizations"),
        ]);
        setStats({
          openCases: cases.length,
          pendingQuotes: quotes.length,
          unpaidInvoices: invoices.length,
          totalOrganizations: orgs.length,
        });
        setRecentCases(cases);
      } catch {
        setStats({ openCases: 0, pendingQuotes: 0, unpaidInvoices: 0, totalOrganizations: 0 });
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)", maxWidth: "var(--w-page-max)" }}>
        <h1
          className="font-head font-semibold"
          style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)", marginBottom: "var(--w-s-5)" }}
        >
          Dashboard
        </h1>

        {loading ? (
          <p style={{ color: "var(--w-text-2)", fontSize: "var(--w-fs-body)" }}>Loading…</p>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "var(--w-s-4)",
                marginBottom: "var(--w-s-6)",
              }}
            >
              <StatCard label="Open Cases" value={stats?.openCases ?? 0} />
              <StatCard label="Pending Quotes" value={stats?.pendingQuotes ?? 0} />
              <StatCard label="Overdue Invoices" value={stats?.unpaidInvoices ?? 0} />
              <StatCard label="Organizations" value={stats?.totalOrganizations ?? 0} />
            </div>

            <div className="bg-plate border border-border">
              <div
                className="border-b border-border bg-sunken flex items-center"
                style={{ height: "var(--w-row-h)", paddingInline: "var(--w-s-4)" }}
              >
                <span
                  className="font-head font-semibold uppercase"
                  style={{ fontSize: "var(--w-fs-eyebrow)", color: "var(--w-text-2)", letterSpacing: "0.09em" }}
                >
                  Recent Service Cases
                </span>
              </div>
              <div className="overflow-x-auto">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--w-sunken)" }}>
                      {["Case #", "Organization", "Serial No.", "Priority", "Status", "Created"].map((h) => (
                        <th
                          key={h}
                          className="font-head font-semibold uppercase text-left"
                          style={{
                            fontSize: "var(--w-fs-eyebrow)",
                            color: "var(--w-text-2)",
                            letterSpacing: "0.09em",
                            padding: "0 var(--w-s-3)",
                            height: "var(--w-row-h)",
                            borderBottom: "1px solid var(--w-border)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentCases.map((c, i) => {
                      const prioColor = PRIO_COLOR[c.priority] ?? "var(--w-prio-normal)";
                      const statusCfg = STATUS_LABEL[c.status];
                      return (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: i < recentCases.length - 1 ? "1px solid var(--w-border-soft)" : undefined,
                          }}
                          className="hover:bg-row-hover transition-colors duration-fast"
                        >
                          <td
                            className="w-num font-head font-medium"
                            style={{ fontSize: "var(--w-fs-cell)", padding: "0 var(--w-s-3)", height: "var(--w-row-h)", color: "var(--w-link)", whiteSpace: "nowrap" }}
                          >
                            {c.caseNumber}
                          </td>
                          <td style={{ fontSize: "var(--w-fs-cell)", padding: "0 var(--w-s-3)", height: "var(--w-row-h)", color: "var(--w-text-1)" }}>
                            {c.organization?.name ?? "—"}
                          </td>
                          <td className="w-num" style={{ fontSize: "var(--w-fs-cell)", padding: "0 var(--w-s-3)", height: "var(--w-row-h)", color: "var(--w-text-2)" }}>
                            {c.product?.serialNumber ?? "—"}
                          </td>
                          <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                            <span className="flex items-center gap-1">
                              {[0, 1, 2].map((bi) => {
                                const fills = { CRITICAL: 3, HIGH: 2, NORMAL: 1, LOW: 0 } as Record<string, number>;
                                const fill = fills[c.priority] ?? 1;
                                return (
                                  <span
                                    key={bi}
                                    style={{
                                      display: "inline-block",
                                      width: "4px",
                                      height: bi === 0 ? "8px" : bi === 1 ? "11px" : "14px",
                                      background: bi < fill ? prioColor : "var(--w-neutral-edge)",
                                      borderRadius: "1px",
                                    }}
                                  />
                                );
                              })}
                            </span>
                          </td>
                          <td style={{ padding: "0 var(--w-s-3)", height: "var(--w-row-h)" }}>
                            <span className="flex items-center gap-1">
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "var(--w-radius-full)",
                                  background: statusCfg?.color ?? "var(--w-neutral-dot)",
                                  display: "inline-block",
                                  flexShrink: 0,
                                }}
                              />
                              <span style={{ fontSize: "var(--w-fs-cell)", color: "var(--w-text-2)" }}>
                                {statusCfg?.label ?? c.status}
                              </span>
                            </span>
                          </td>
                          <td className="w-num" style={{ fontSize: "var(--w-fs-cell)", padding: "0 var(--w-s-3)", height: "var(--w-row-h)", color: "var(--w-text-2)", whiteSpace: "nowrap" }}>
                            {new Date(c.createdAt).toLocaleDateString("en-IN")}
                          </td>
                        </tr>
                      );
                    })}
                    {recentCases.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "var(--w-s-6)",
                            textAlign: "center",
                            fontSize: "var(--w-fs-body)",
                            color: "var(--w-text-mute)",
                          }}
                        >
                          No cases found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
