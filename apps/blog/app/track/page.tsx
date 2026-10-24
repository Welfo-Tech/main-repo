"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT } from "../../lib/content";
import { type TrackingResult, trackRequest } from "../../lib/api";

function fmt(d: string | null | undefined) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function TrackPage() {
  const [ref, setRef] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await trackRequest(ref.trim(), email.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not look that up right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-canvas)", minHeight: "70vh" }}>
      <div className="w-shell" style={{ maxWidth: "720px" }}>
        <p className="w-eyebrow">Track a repair</p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", marginTop: "var(--w-s-2)", marginBottom: "var(--w-s-3)" }}>
          Where is my instrument?
        </h1>
        <p style={{ fontSize: "17px", color: "var(--w-text-2)", lineHeight: 1.65, marginBottom: "var(--w-s-6)", maxWidth: "58ch" }}>
          Enter the reference number from your request and the email you used. We ask for both
          so nobody else can look up your repair.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ background: "var(--w-plate)", border: "1px solid var(--w-border)", padding: "var(--w-s-5)" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: "var(--w-s-4)" }}>
            <div className="w-field">
              <label className="w-label" htmlFor="ref">Reference number *</label>
              <input
                id="ref"
                className="w-input"
                value={ref}
                onChange={e => setRef(e.target.value)}
                placeholder="WFI-2026-0001"
                autoComplete="off"
                required
              />
            </div>
            <div className="w-field">
              <label className="w-label" htmlFor="temail">Email used *</label>
              <input
                id="temail"
                type="email"
                className="w-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !ref.trim() || !email.trim()}
            className="w-btn w-btn--primary"
            style={{ marginTop: "var(--w-s-4)" }}
          >
            {loading ? "Looking up…" : "Track my repair"}
          </button>
        </form>

        {error && (
          <p role="alert" style={{ marginTop: "var(--w-s-4)", background: "var(--w-attention-tint)", border: "1px solid var(--w-attention-edge)", color: "var(--w-attention-fg)", padding: "var(--w-s-3) var(--w-s-4)", fontSize: "15px" }}>
            {error}
          </p>
        )}

        {result && result.found === false && (
          <div
            style={{
              marginTop: "var(--w-s-5)",
              background: "var(--w-plate)",
              border: "1px solid var(--w-border)",
              padding: "var(--w-s-5)",
            }}
          >
            <h2 style={{ fontSize: "20px", marginBottom: "var(--w-s-2)" }}>We could not find that</h2>
            <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.65 }}>
              Check the reference number and that the email matches the one used when the request
              was submitted. If it still will not come up, call{" "}
              <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
                {CONTACT.phone}
              </a>{" "}
              and we will look it up for you.
            </p>
          </div>
        )}

        {result && result.found && result.timeline && (
          <div style={{ marginTop: "var(--w-s-5)", background: "var(--w-plate)", border: "1px solid var(--w-border)", padding: "var(--w-s-5)" }}>
            <div style={{ borderBottom: "1px solid var(--w-border-soft)", paddingBottom: "var(--w-s-4)", marginBottom: "var(--w-s-5)" }}>
              <p className="w-eyebrow" style={{ marginBottom: "var(--w-s-1)" }}>{result.reference}</p>
              <h2 style={{ fontSize: "clamp(20px, 3vw, 26px)", marginBottom: "var(--w-s-2)" }}>
                {result.headline}
              </h2>
              <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(180px, 100%), 1fr))", gap: "var(--w-s-3)", marginTop: "var(--w-s-3)" }}>
                <div>
                  <dt className="w-label">Instrument</dt>
                  <dd style={{ fontSize: "15px" }}>{result.instrument}</dd>
                </div>
                <div>
                  <dt className="w-label">Serial number</dt>
                  <dd style={{ fontSize: "15px", fontFamily: "monospace" }}>{result.serialNumber}</dd>
                </div>
                {result.caseNumber && (
                  <div>
                    <dt className="w-label">Case number</dt>
                    <dd style={{ fontSize: "15px", fontFamily: "var(--w-font-head)", fontWeight: 600 }}>{result.caseNumber}</dd>
                  </div>
                )}
              </dl>
            </div>

            <ol style={{ listStyle: "none", display: "grid", gap: 0 }}>
              {result.timeline.map((step, i) => {
                const done = step.state === "done";
                const current = step.state === "current";
                const last = i === result.timeline!.length - 1;
                return (
                  <li key={step.key} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "var(--w-s-4)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span
                        aria-hidden
                        style={{
                          width: "14px",
                          height: "14px",
                          borderRadius: "50%",
                          marginTop: "5px",
                          background: done ? "var(--w-brand)" : current ? "var(--w-accent-strong)" : "var(--w-sunken)",
                          border: `2px solid ${done ? "var(--w-brand)" : current ? "var(--w-accent-strong)" : "var(--w-border-strong, #b7b7ba)"}`,
                          flexShrink: 0,
                        }}
                      />
                      {!last && (
                        <span
                          aria-hidden
                          style={{
                            width: "2px",
                            flex: 1,
                            minHeight: "26px",
                            background: done ? "var(--w-brand)" : "var(--w-border)",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ paddingBottom: last ? 0 : "var(--w-s-4)" }}>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: current ? 600 : 500,
                          color: step.state === "upcoming" ? "var(--w-text-mute)" : "var(--w-text-1)",
                          fontFamily: "var(--w-font-head)",
                        }}
                      >
                        {step.label}
                        {current && (
                          <span
                            style={{
                              marginLeft: "var(--w-s-2)",
                              fontSize: "11px",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              color: "var(--w-accent-strong)",
                              border: "1px solid var(--w-accent-strong)",
                              padding: "2px 6px",
                            }}
                          >
                            Now
                          </span>
                        )}
                      </p>
                      {fmt(step.at) && (
                        <p style={{ fontSize: "14px", color: "var(--w-text-mute)" }}>{fmt(step.at)}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            <p style={{ fontSize: "14px", color: "var(--w-text-mute)", marginTop: "var(--w-s-5)", lineHeight: 1.6 }}>
              Questions about this repair? Call{" "}
              <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
                {CONTACT.phone}
              </a>{" "}
              quoting {result.reference}.
            </p>
          </div>
        )}

        <p style={{ marginTop: "var(--w-s-6)", fontSize: "15px", color: "var(--w-text-2)" }}>
          Not raised a request yet?{" "}
          <Link href="/product-support" style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
            Start one here
          </Link>.
        </p>
      </div>
    </section>
  );
}
