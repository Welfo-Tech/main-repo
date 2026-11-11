"use client";

import { useState } from "react";
import { CONTACT } from "../lib/content";
import { type PortalQuote, decideQuote, formatINR } from "../lib/api";

const cell: React.CSSProperties = {
  padding: "var(--w-s-3)",
  fontSize: "15px",
  borderBottom: "1px solid var(--w-border-soft)",
  verticalAlign: "top",
};

const head: React.CSSProperties = {
  ...cell,
  fontFamily: "var(--w-font-head)",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--w-text-2)",
  textAlign: "left",
  borderBottom: "1px solid var(--w-border)",
};

export default function QuotePanel({
  data,
  reference,
  email,
  onDecided,
}: {
  data: PortalQuote;
  reference: string;
  email: string;
  onDecided: () => void;
}) {
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [showDecline, setShowDecline] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState<"APPROVE" | "REJECT" | null>(null);

  const q = data.quote;
  if (!q) return null;

  const settled = q.status !== "SENT";

  async function decide(decision: "APPROVE" | "REJECT") {
    setBusy(decision);
    setError("");
    try {
      await decideQuote({
        ref: reference,
        email,
        decision,
        approverName: name.trim(),
        ...(decision === "REJECT" && reason.trim() ? { reason: reason.trim() } : {}),
      });
      setDone(decision);
      onDecided();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not record your decision");
    } finally {
      setBusy("");
    }
  }

  return (
    <section
      style={{
        marginTop: "var(--w-s-5)",
        background: "var(--w-plate)",
        border: "1px solid var(--w-border)",
        borderRadius: "var(--w-radius-lg)",
        overflow: "hidden",
      }}
    >
      <div style={{ background: "var(--w-ink-gradient)", color: "var(--w-text-invert)", padding: "var(--w-s-4) var(--w-s-5)" }}>
        <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>Your quote</p>
        <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", color: "var(--w-text-invert)", marginTop: "4px" }}>
          {q.quoteNumber}
          {q.version > 1 && <span style={{ fontSize: "16px", opacity: 0.8 }}> · revision {q.version}</span>}
        </h2>
        {data.instrument && (
          <p style={{ fontSize: "15px", color: "var(--w-text-invert-2)", marginTop: "var(--w-s-1)" }}>
            {data.instrument.model ?? "Your instrument"} · {data.instrument.serialNumber}
          </p>
        )}
      </div>

      <div style={{ padding: "var(--w-s-5)" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "460px" }}>
            <thead>
              <tr>
                <th style={head}>Item</th>
                <th style={{ ...head, textAlign: "right" }}>Qty</th>
                <th style={{ ...head, textAlign: "right" }}>Unit</th>
                <th style={{ ...head, textAlign: "right" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {q.lineItems.map((li, i) => (
                <tr key={i}>
                  <td style={cell}>{li.description}</td>
                  <td style={{ ...cell, textAlign: "right" }}>{Number(li.quantity)}</td>
                  <td style={{ ...cell, textAlign: "right", whiteSpace: "nowrap" }}>{formatINR(li.unitPrice)}</td>
                  <td style={{ ...cell, textAlign: "right", whiteSpace: "nowrap", fontWeight: 500 }}>{formatINR(li.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <dl style={{ marginTop: "var(--w-s-4)", display: "grid", gap: "var(--w-s-2)", maxWidth: "320px", marginLeft: "auto" }}>
          {[
            ["Subtotal", q.subtotal],
            ["GST", q.taxAmount],
          ].map(([label, v]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", color: "var(--w-text-2)" }}>
              <dt>{label}</dt>
              <dd>{formatINR(v!)}</dd>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "19px",
              fontWeight: 700,
              fontFamily: "var(--w-font-head)",
              borderTop: "2px solid var(--w-border)",
              paddingTop: "var(--w-s-2)",
            }}
          >
            <dt>Total</dt>
            <dd>{formatINR(q.totalAmount)}</dd>
          </div>
        </dl>

        {q.terms && (
          <p style={{ marginTop: "var(--w-s-4)", fontSize: "14px", color: "var(--w-text-2)", lineHeight: 1.6 }}>
            {q.terms}
          </p>
        )}

        {done ? (
          <p
            className="w-eyebrow"
            style={{
              marginTop: "var(--w-s-5)",
              background: done === "APPROVE" ? "var(--w-success-tint)" : "var(--w-sunken)",
              border: `1px solid ${done === "APPROVE" ? "var(--w-success-edge)" : "var(--w-border)"}`,
              color: done === "APPROVE" ? "var(--w-success-fg)" : "var(--w-text-2)",
              padding: "var(--w-s-3) var(--w-s-4)",
              letterSpacing: "0.04em",
            }}
          >
            {done === "APPROVE"
              ? "Thank you — approved. Our team will confirm and begin work."
              : "Recorded. We will be in touch to discuss the options."}
          </p>
        ) : settled ? (
          <p style={{ marginTop: "var(--w-s-5)", fontSize: "15px", color: "var(--w-text-2)" }}>
            {q.status === "APPROVED"
              ? `Approved${q.approvedByName ? ` by ${q.approvedByName}` : ""}${q.approvedAt ? ` on ${new Date(q.approvedAt).toLocaleDateString("en-IN")}` : ""}. Nothing further is needed from you.`
              : "This quote has been closed. Call us if you would like it revisited."}
          </p>
        ) : (
          <div style={{ marginTop: "var(--w-s-5)", paddingTop: "var(--w-s-5)", borderTop: "1px solid var(--w-border-soft)" }}>
            <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.6, marginBottom: "var(--w-s-4)" }}>
              No work begins until you approve. Enter your name to confirm the decision is yours.
            </p>

            <div className="w-field" style={{ marginBottom: "var(--w-s-4)", maxWidth: "340px" }}>
              <label className="w-label" htmlFor="approver">Your name *</label>
              <input
                id="approver"
                className="w-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Dr. Anand Mehta"
              />
            </div>

            {showDecline && (
              <div className="w-field" style={{ marginBottom: "var(--w-s-4)" }}>
                <label className="w-label" htmlFor="declineReason">Why are you declining? (optional)</label>
                <textarea
                  id="declineReason"
                  className="w-textarea"
                  style={{ minHeight: "90px" }}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Over budget for this quarter"
                />
              </div>
            )}

            {error && (
              <p role="alert" style={{ background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", color: "var(--w-attention-fg)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "15px", marginBottom: "var(--w-s-4)" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-3)" }}>
              <button
                className="w-btn w-btn--primary"
                disabled={busy !== "" || name.trim().length < 2}
                onClick={() => decide("APPROVE")}
              >
                {busy === "APPROVE" ? "Recording…" : "Approve this quote"}
              </button>
              <button
                className="w-btn w-btn--outline"
                disabled={busy !== "" || (showDecline && name.trim().length < 2)}
                onClick={() => (showDecline ? decide("REJECT") : setShowDecline(true))}
              >
                {busy === "REJECT" ? "Recording…" : showDecline ? "Confirm decline" : "Decline"}
              </button>
            </div>

            <p className="w-hint" style={{ marginTop: "var(--w-s-4)" }}>
              Questions first? Call{" "}
              <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
                {CONTACT.phone}
              </a>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
