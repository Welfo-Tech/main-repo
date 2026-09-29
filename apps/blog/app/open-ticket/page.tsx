"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT } from "../../lib/content";
import { submitInquiry } from "../../lib/api";

const URGENCY_OPTIONS = [
  { value: "LOW", label: "Low — no rush" },
  { value: "NORMAL", label: "Normal — within a few weeks" },
  { value: "HIGH", label: "High — affecting our schedule" },
  { value: "CRITICAL", label: "Critical — theatre is blocked" },
];

const EMPTY = {
  submitterName: "",
  submitterEmail: "",
  submitterPhone: "",
  organizationName: "",
  city: "",
  productModel: "",
  serialNumber: "",
  purchaseDate: "",
  reportedProblem: "",
  urgency: "NORMAL",
};

const STEPS = ["Your details", "The instrument", "Review"];

export default function OpenTicketPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [inquiryNumber, setInquiryNumber] = useState("");

  function set<K extends keyof typeof EMPTY>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  const stepOneValid =
    form.submitterName.trim() !== "" &&
    form.submitterEmail.trim() !== "" &&
    form.organizationName.trim() !== "";

  const stepTwoValid =
    form.productModel.trim() !== "" && form.reportedProblem.trim().length >= 10;

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    try {
      const result = await submitInquiry({
        submitterName: form.submitterName.trim(),
        submitterEmail: form.submitterEmail.trim().toLowerCase(),
        organizationName: form.organizationName.trim(),
        productModel: form.productModel.trim(),
        reportedProblem: form.reportedProblem.trim(),
        urgency: form.urgency,
        ...(form.submitterPhone.trim() && { submitterPhone: form.submitterPhone.trim() }),
        ...(form.city.trim() && { city: form.city.trim() }),
        ...(form.serialNumber.trim() && { serialNumber: form.serialNumber.trim() }),
        ...(form.purchaseDate && { purchaseDate: form.purchaseDate }),
      });
      setInquiryNumber(result.inquiryNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (inquiryNumber) {
    return (
      <section style={{ paddingBlock: "var(--w-s-9)", background: "var(--w-canvas)", minHeight: "60vh" }}>
        <div className="w-shell" style={{ maxWidth: "640px" }}>
          <div style={{ background: "var(--w-plate)", border: "1px solid var(--w-border)", padding: "var(--w-s-7) var(--w-s-6)" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                background: "var(--w-success-tint)",
                border: "1px solid var(--w-success-edge)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "var(--w-s-4)",
              }}
            >
              <span style={{ color: "var(--w-success-fg)", fontSize: "22px", lineHeight: 1 }}>&#10003;</span>
            </div>

            <h1 style={{ fontSize: "clamp(26px, 4vw, 34px)", marginBottom: "var(--w-s-3)" }}>
              Ticket received
            </h1>
            <p style={{ fontSize: "16px", color: "var(--w-text-2)", lineHeight: 1.65, marginBottom: "var(--w-s-5)" }}>
              Your reference number is below. Keep it for your records — quote it when you call
              or email us about this instrument.
            </p>

            <div
              style={{
                background: "var(--w-canvas)",
                border: "1px solid var(--w-border)",
                padding: "var(--w-s-4) var(--w-s-5)",
                marginBottom: "var(--w-s-5)",
              }}
            >
              <p className="w-eyebrow" style={{ marginBottom: "var(--w-s-1)" }}>Reference number</p>
              <p
                style={{
                  fontFamily: "var(--w-font-head)",
                  fontSize: "30px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {inquiryNumber}
              </p>
            </div>

            <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.65, marginBottom: "var(--w-s-5)" }}>
              Our team will review this and contact you on the details you provided, usually
              within one working day. If it is urgent, call us directly on{" "}
              <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
                {CONTACT.phone}
              </a>.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-3)" }}>
              <Link href="/" className="w-btn w-btn--outline">Back to home</Link>
              <button
                onClick={() => { setForm(EMPTY); setInquiryNumber(""); setStep(0); }}
                className="w-btn w-btn--outline"
              >
                Submit another
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-canvas)" }}>
      <div className="w-shell" style={{ maxWidth: "760px" }}>
        <p className="w-eyebrow">Repair request</p>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 44px)", marginTop: "var(--w-s-2)", marginBottom: "var(--w-s-3)" }}>
          Open a ticket
        </h1>
        <p style={{ fontSize: "17px", color: "var(--w-text-2)", lineHeight: 1.65, marginBottom: "var(--w-s-6)", maxWidth: "60ch" }}>
          Tell us who you are and what has gone wrong. You do not need an account, and you do
          not need to know the exact model — describe it as best you can.
        </p>

        <ol
          style={{
            listStyle: "none",
            display: "flex",
            gap: "var(--w-s-2)",
            marginBottom: "var(--w-s-6)",
            flexWrap: "wrap",
          }}
        >
          {STEPS.map((label, i) => (
            <li key={label} style={{ display: "flex", alignItems: "center", gap: "var(--w-s-2)" }}>
              <span
                style={{
                  width: "26px",
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--w-font-head)",
                  fontSize: "14px",
                  fontWeight: 600,
                  background: i <= step ? "var(--w-accent-strong)" : "transparent",
                  color: i <= step ? "#fff" : "var(--w-text-mute)",
                  border: `1px solid ${i <= step ? "var(--w-accent-strong)" : "var(--w-border)"}`,
                }}
              >
                {i + 1}
              </span>
              <span
                style={{
                  fontFamily: "var(--w-font-head)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: i <= step ? "var(--w-text-1)" : "var(--w-text-mute)",
                  marginRight: "var(--w-s-3)",
                }}
              >
                {label}
              </span>
            </li>
          ))}
        </ol>

        <div style={{ background: "var(--w-plate)", border: "1px solid var(--w-border)", padding: "var(--w-s-6)" }}>
          {step === 0 && (
            <div style={{ display: "grid", gap: "var(--w-s-4)" }}>
              <div className="w-field">
                <label className="w-label" htmlFor="name">Your name *</label>
                <input
                  id="name"
                  className="w-input"
                  value={form.submitterName}
                  onChange={e => set("submitterName", e.target.value)}
                  placeholder="Dr. Anand Mehta"
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--w-s-4)" }}>
                <div className="w-field">
                  <label className="w-label" htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    className="w-input"
                    value={form.submitterEmail}
                    onChange={e => set("submitterEmail", e.target.value)}
                    placeholder="anand@hospital.com"
                    required
                  />
                </div>
                <div className="w-field">
                  <label className="w-label" htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="tel"
                    className="w-input"
                    value={form.submitterPhone}
                    onChange={e => set("submitterPhone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--w-s-4)" }}>
                <div className="w-field">
                  <label className="w-label" htmlFor="org">Hospital or clinic *</label>
                  <input
                    id="org"
                    className="w-input"
                    value={form.organizationName}
                    onChange={e => set("organizationName", e.target.value)}
                    placeholder="Apollo Hospitals"
                    required
                  />
                </div>
                <div className="w-field">
                  <label className="w-label" htmlFor="city">City</label>
                  <input
                    id="city"
                    className="w-input"
                    value={form.city}
                    onChange={e => set("city", e.target.value)}
                    placeholder="Dehradun"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ display: "grid", gap: "var(--w-s-4)" }}>
              <div className="w-field">
                <label className="w-label" htmlFor="model">What is the instrument? *</label>
                <input
                  id="model"
                  className="w-input"
                  value={form.productModel}
                  onChange={e => set("productModel", e.target.value)}
                  placeholder="30 degree laparoscope, 10mm"
                  required
                />
                <span className="w-hint">A description is fine if you do not have the exact model name.</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--w-s-4)" }}>
                <div className="w-field">
                  <label className="w-label" htmlFor="serial">Serial number</label>
                  <input
                    id="serial"
                    className="w-input"
                    value={form.serialNumber}
                    onChange={e => set("serialNumber", e.target.value)}
                    placeholder="If marked on the instrument"
                  />
                </div>
                <div className="w-field">
                  <label className="w-label" htmlFor="purchased">Approximate purchase date</label>
                  <input
                    id="purchased"
                    type="date"
                    className="w-input"
                    value={form.purchaseDate}
                    onChange={e => set("purchaseDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="w-field">
                <label className="w-label" htmlFor="problem">What has gone wrong? *</label>
                <textarea
                  id="problem"
                  className="w-textarea"
                  value={form.reportedProblem}
                  onChange={e => set("reportedProblem", e.target.value)}
                  placeholder="Describe what you are seeing — dark image, broken fibers, fogging, a crack, loss of angle. Anything helps."
                  required
                />
                <span className="w-hint">
                  {form.reportedProblem.trim().length < 10
                    ? `At least 10 characters (${form.reportedProblem.trim().length} so far).`
                    : "Thanks — that is enough to get started."}
                </span>
              </div>

              <div className="w-field">
                <label className="w-label" htmlFor="urgency">How urgent is it?</label>
                <select
                  id="urgency"
                  className="w-select"
                  value={form.urgency}
                  onChange={e => set("urgency", e.target.value)}
                >
                  {URGENCY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="w-eyebrow" style={{ marginBottom: "var(--w-s-4)" }}>Check before sending</p>
              <dl style={{ display: "grid", gap: "1px", background: "var(--w-border)", border: "1px solid var(--w-border)" }}>
                {[
                  ["Name", form.submitterName],
                  ["Email", form.submitterEmail],
                  ["Phone", form.submitterPhone || "—"],
                  ["Hospital or clinic", form.organizationName],
                  ["City", form.city || "—"],
                  ["Instrument", form.productModel],
                  ["Serial number", form.serialNumber || "—"],
                  ["Purchase date", form.purchaseDate || "—"],
                  ["Urgency", URGENCY_OPTIONS.find(o => o.value === form.urgency)?.label ?? form.urgency],
                  ["Problem", form.reportedProblem],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      background: "var(--w-plate)",
                      padding: "var(--w-s-3) var(--w-s-4)",
                      display: "grid",
                      gridTemplateColumns: "minmax(140px, 1fr) 2fr",
                      gap: "var(--w-s-4)",
                    }}
                  >
                    <dt className="w-label" style={{ marginTop: "2px" }}>{label}</dt>
                    <dd style={{ fontSize: "15px", color: "var(--w-text-1)", lineHeight: 1.55, overflowWrap: "anywhere" }}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {error && (
            <p
              role="alert"
              style={{
                marginTop: "var(--w-s-4)",
                background: "var(--w-attention-tint)",
                border: "1px solid var(--w-attention-edge)",
                color: "var(--w-attention-fg)",
                padding: "var(--w-s-3) var(--w-s-4)",
                fontSize: "15px",
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              marginTop: "var(--w-s-6)",
              paddingTop: "var(--w-s-5)",
              borderTop: "1px solid var(--w-border-soft)",
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--w-s-3)",
              justifyContent: "space-between",
            }}
          >
            <button
              type="button"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="w-btn w-btn--outline"
              style={{ visibility: step === 0 ? "hidden" : "visible" }}
            >
              Back
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                disabled={step === 0 ? !stepOneValid : !stepTwoValid}
                className="w-btn w-btn--primary"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-btn w-btn--primary"
              >
                {submitting ? "Sending…" : "Submit ticket"}
              </button>
            )}
          </div>
        </div>

        <p style={{ marginTop: "var(--w-s-5)", fontSize: "15px", color: "var(--w-text-2)" }}>
          Would rather talk to someone? Call{" "}
          <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
            {CONTACT.phone}
          </a>{" "}
          or message us on{" "}
          <a href={CONTACT.whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
            WhatsApp
          </a>.
        </p>
      </div>
    </section>
  );
}
