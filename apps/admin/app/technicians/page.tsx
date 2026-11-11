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

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  employeeId: "",
  phone: "",
  specializations: "",
};

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      await api.post("/api/v1/technicians", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        employeeId: form.employeeId.trim(),
        ...(form.phone.trim() && { phone: form.phone.trim() }),
        ...(form.specializations.trim() && {
          specializations: form.specializations.split(",").map(s => s.trim()).filter(Boolean),
        }),
      });
      setForm(EMPTY_FORM);
      setShowForm(false);
      await fetchTechnicians();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create technician");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setForm(EMPTY_FORM);
    setFormError("");
  }

  return (
    <AdminLayout>
      <div style={{ padding: "var(--w-s-5) var(--w-s-6)" }}>

        <div className="flex items-center justify-between" style={{ marginBottom: "var(--w-s-5)" }}>
          <h1 className="font-head font-semibold" style={{ fontSize: "var(--w-fs-page)", color: "var(--w-text-1)" }}>
            Technicians
          </h1>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", fontFamily: "var(--w-font-head)" }}>
              {technicians.length} total
            </span>
            <button
              onClick={() => { setShowForm(v => !v); setFormError(""); }}
              className="font-head font-semibold uppercase"
              style={{
                height: "var(--w-control-h)",
                paddingInline: "var(--w-s-4)",
                fontSize: "var(--w-fs-label)",
                letterSpacing: "0.06em",
                background: showForm ? "var(--w-surface)" : "var(--w-accent-strong)",
                color: showForm ? "var(--w-text-2)" : "#fff",
                border: showForm ? "1px solid var(--w-border)" : "none",
                cursor: "pointer",
              }}
            >
              {showForm ? "Cancel" : "+ Add Technician"}
            </button>
          </div>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddSubmit}
            style={{
              background: "var(--w-plate)",
              border: "1px solid var(--w-border)",
              padding: "var(--w-s-5)",
              marginBottom: "var(--w-s-5)",
            }}
          >
            <p className="font-head font-semibold uppercase" style={{ fontSize: "var(--w-fs-eyebrow)", letterSpacing: "0.09em", color: "var(--w-text-2)", marginBottom: "var(--w-s-4)" }}>
              New Technician
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--w-s-4)", marginBottom: "var(--w-s-4)" }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input
                  style={inputStyle}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ravi Kumar"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="ravi@welfo.local"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Password *</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  minLength={8}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Employee ID *</label>
                <input
                  style={inputStyle}
                  value={form.employeeId}
                  onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))}
                  placeholder="EMP-001"
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  style={inputStyle}
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91-98765-43210"
                />
              </div>
              <div>
                <label style={labelStyle}>Specializations</label>
                <input
                  style={inputStyle}
                  value={form.specializations}
                  onChange={e => setForm(f => ({ ...f, specializations: e.target.value }))}
                  placeholder="fiber-optic-repair, endoscope-cleaning"
                />
                <span style={{ fontSize: "var(--w-fs-caption)", color: "var(--w-text-mute)", marginTop: "4px", display: "block" }}>
                  Comma-separated
                </span>
              </div>
            </div>

            {formError && (
              <p style={{ color: "var(--w-attention-fg)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", padding: "var(--w-s-2) var(--w-s-3)", fontSize: "var(--w-fs-body)", marginBottom: "var(--w-s-4)" }}>
                {formError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="font-head font-semibold uppercase"
                style={{
                  height: "var(--w-control-h)",
                  paddingInline: "var(--w-s-4)",
                  fontSize: "var(--w-fs-label)",
                  letterSpacing: "0.06em",
                  background: "var(--w-accent-strong)",
                  color: "#fff",
                  border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.6 : 1,
                }}
              >
                {submitting ? "Creating…" : "Create Technician"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="font-head font-semibold uppercase"
                style={{
                  height: "var(--w-control-h)",
                  paddingInline: "var(--w-s-3)",
                  fontSize: "var(--w-fs-label)",
                  letterSpacing: "0.06em",
                  background: "transparent",
                  color: "var(--w-text-2)",
                  border: "1px solid var(--w-border)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

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
        ) : technicians.length === 0 ? (
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
                {technicians.map(tech => (
                  <tr key={tech.id} style={{ background: "var(--w-surface)" }}>
                    <td style={TD_STYLE}>
                      <span style={{ fontFamily: "monospace", fontSize: "var(--w-fs-cell)", color: "var(--w-text-1)", fontWeight: 600 }}>
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
