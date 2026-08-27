"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../lib/api";
import type { Technician } from "../../types/technician";

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
  textAlign: "left",
  whiteSpace: "nowrap" as const,
};

const TD_STYLE: React.CSSProperties = {
  padding: "0 var(--w-s-3)",
  height: "var(--w-row-h)",
  fontSize: "var(--w-fs-cell)",
  fontFamily: "var(--w-font-body)",
  color: "var(--w-text-1)",
  borderBottom: "1px solid var(--w-border)",
};

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const fetchTechnicians = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (activeFilter !== "") params.set("isActive", activeFilter);
      const url = `/api/v1/technicians${params.toString() ? "?" + params.toString() : ""}`;
      const data = await api.get<Technician[]>(url);
      setTechnicians(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load technicians");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => { fetchTechnicians(); }, [fetchTechnicians]);

  const visible = technicians;

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)" }}>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
            Technicians
          </h1>
          <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", fontFamily: "var(--w-font-head)" }}>
            {technicians.length} total
          </span>
        </div>

        <div className="flex items-center gap-3" style={{ marginBottom: "var(--w-s-4)" }}>
          {(["", "true", "false"] as const).map(v => (
            <button
              key={v}
              onClick={() => setActiveFilter(v)}
              className="font-head font-semibold uppercase"
              style={{
                height: "var(--w-control-h)",
                paddingInline: "var(--w-s-3)",
                fontSize: "var(--w-fs-label)",
                letterSpacing: "0.06em",
                border: `1px solid ${activeFilter === v ? "var(--w-accent-strong)" : "var(--w-border)"}`,
                background: activeFilter === v ? "var(--w-accent-tint)" : "transparent",
                color: activeFilter === v ? "var(--w-accent-strong)" : "var(--w-text-2)",
                cursor: "pointer",
              }}
            >
              {v === "" ? "All" : v === "true" ? "Active" : "Inactive"}
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
        ) : visible.length === 0 ? (
          <p style={{ color: "var(--w-text-mute)", fontSize: "var(--w-fs-body)" }}>No technicians found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid var(--w-border)" }}>
              <thead>
                <tr style={{ background: "var(--w-plate)" }}>
                  <th style={TH_STYLE}>Employee ID</th>
                  <th style={TH_STYLE}>Name</th>
                  <th style={TH_STYLE}>Email</th>
                  <th style={TH_STYLE}>Phone</th>
                  <th style={TH_STYLE}>Specializations</th>
                  <th style={TH_STYLE}>Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map(tech => (
                  <tr key={tech.id} style={{ background: "var(--w-surface)" }}>
                    <td style={TD_STYLE}>
                      <span className="w-num font-head font-semibold" style={{ fontFamily: "monospace", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)" }}>
                        {tech.employeeId}
                      </span>
                    </td>
                    <td style={{ ...TD_STYLE, fontWeight: 500, color: "var(--w-text-1)" }}>
                      {tech.user.name}
                    </td>
                    <td style={{ ...TD_STYLE, color: "var(--w-text-2)" }}>
                      {tech.user.email}
                    </td>
                    <td style={{ ...TD_STYLE, color: "var(--w-text-2)" }}>
                      {tech.phone ?? <span style={{ color: "var(--w-text-mute)" }}>—</span>}
                    </td>
                    <td style={TD_STYLE}>
                      {tech.specializations.length > 0 ? (
                        <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-2)" }}>
                          {tech.specializations.join(", ")}
                        </span>
                      ) : (
                        <span style={{ color: "var(--w-text-mute)" }}>—</span>
                      )}
                    </td>
                    <td style={TD_STYLE}>
                      <StatusBadge status={tech.isActive ? "ACTIVE" : "INACTIVE"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
