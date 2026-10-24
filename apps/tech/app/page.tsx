"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { type CaseRow, type TechProfile, api, getToken } from "../lib/api";
import { IRREPARABLE_LABEL, STATUS_LABEL, statusStyle } from "../lib/status";

const OPEN_STATES = new Set([
  "ASSIGNED", "UNDER_ASSESSMENT", "AWAITING_QUOTE_APPROVAL",
  "WORK_AUTHORIZED", "IN_REPAIR", "QC_PENDING", "QC_FAILED", "ON_HOLD",
]);

export default function CasesPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<TechProfile | null>(null);
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [me, list] = await Promise.all([
        api.get<TechProfile>("/api/v1/technicians/me"),
        api.get<CaseRow[]>("/api/v1/service-cases"),
      ]);
      setProfile(me);
      setCases(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load your cases");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) { router.replace("/login"); return; }
    load();
  }, [load, router]);

  const open = cases.filter(c => OPEN_STATES.has(c.status));
  const done = cases.filter(c => !OPEN_STATES.has(c.status));
  const shown = showDone ? done : open;

  return (
    <>
      <TopBar subtitle={profile ? profile.name : undefined} />

      <main className="shell" style={{ paddingBlock: "var(--w-s-5)" }}>
        <h1 style={{ fontSize: "22px", color: "var(--w-ink)", marginBottom: "var(--w-s-1)" }}>
          Your cases
        </h1>
        <p className="hint" style={{ marginBottom: "var(--w-s-4)" }}>
          {loading ? "Loading…" : `${open.length} open · ${done.length} finished`}
          {profile ? ` · ${profile.employeeId}` : ""}
        </p>

        <div style={{ display: "flex", gap: "var(--w-s-2)", marginBottom: "var(--w-s-4)" }}>
          {[
            { k: false, label: `Open (${open.length})` },
            { k: true, label: `Finished (${done.length})` },
          ].map(t => (
            <button
              key={String(t.k)}
              onClick={() => setShowDone(t.k)}
              style={{
                flex: 1,
                minHeight: "42px",
                borderRadius: "var(--w-radius)",
                border: `1px solid ${showDone === t.k ? "var(--w-ink)" : "var(--w-border)"}`,
                background: showDone === t.k ? "var(--w-ink)" : "var(--w-plate)",
                color: showDone === t.k ? "#fff" : "var(--w-text-2)",
                fontWeight: 600,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p role="alert" className="alert alert--danger" style={{ marginBottom: "var(--w-s-4)" }}>{error}</p>}

        {loading ? (
          <p className="hint">Loading…</p>
        ) : shown.length === 0 ? (
          <div className="card" style={{ textAlign: "center", paddingBlock: "var(--w-s-6)" }}>
            <p style={{ color: "var(--w-text-2)" }}>
              {showDone ? "Nothing finished yet." : "No cases assigned to you right now."}
            </p>
          </div>
        ) : (
          <ul style={{ listStyle: "none", display: "grid", gap: "var(--w-s-3)" }}>
            {shown.map(c => {
              const s = statusStyle(c.status);
              const flagged = c.irreparableState === "PROPOSED" || c.irreparableState === "SECOND_CHANCE";
              return (
                <li key={c.id}>
                  <Link href={`/cases/${c.id}`} className="card" style={{ display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--w-s-3)", marginBottom: "var(--w-s-2)" }}>
                      <span style={{ fontWeight: 700, color: "var(--w-ink)" }}>{c.caseNumber}</span>
                      <span className="pill" style={s}>{STATUS_LABEL[c.status] ?? c.status}</span>
                    </div>

                    <p style={{ fontSize: "15px", fontWeight: 500 }}>
                      {c.product.model?.name ?? "Instrument"}
                    </p>
                    <p className="hint" style={{ fontFamily: "monospace" }}>{c.product.serialNumber}</p>
                    <p className="hint" style={{ marginTop: "var(--w-s-1)" }}>{c.organization.name}</p>

                    {flagged && (
                      <p
                        className="pill"
                        style={{
                          marginTop: "var(--w-s-2)",
                          background: "var(--w-danger-tint)",
                          color: "var(--w-danger-fg)",
                          border: "1px solid var(--w-danger-edge)",
                        }}
                      >
                        {IRREPARABLE_LABEL[c.irreparableState!]}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
