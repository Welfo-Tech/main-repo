import type { Metadata } from "next";
import Link from "next/link";
import { SPECIALTIES } from "../../lib/content";

export const metadata: Metadata = {
  title: "About — Welfo Endovision",
  description:
    "Welfo Fiber Optics manufactures and repairs medical endoscopy equipment from Rishikesh, Uttarakhand.",
};

const FACTS = [
  { label: "Based in", value: "Rishikesh, Uttarakhand" },
  { label: "Working since", value: "2011" },
  { label: "Facility", value: "Optical assembly and repair workshop" },
  { label: "Serving", value: "Hospitals, clinics and distributors across India" },
];

export default function AboutPage() {
  return (
    <>
      <section style={{ background: "var(--w-ink)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-8)" }}>
        <div className="w-shell">
          <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>About Welfo</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 50px)", marginTop: "var(--w-s-3)", color: "var(--w-text-invert)", maxWidth: "20ch" }}>
            We build optics, and we keep them working.
          </h1>
        </div>
      </section>

      <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-plate)" }}>
        <div className="w-shell" style={{ maxWidth: "720px" }}>
          <div style={{ fontSize: "17px", lineHeight: 1.75, color: "var(--w-text-1)", display: "grid", gap: "var(--w-s-4)" }}>
            <p>
              Welfo Fiber Optics is a medical optics workshop in Rishikesh. We make rigid
              endoscopes, fiber optic light guides and surgical illumination systems, and we
              repair them — including instruments we did not originally sell.
            </p>
            <p>
              Most of what we do is repair work. A scope with a cracked rod lens or a darkened
              fiber bundle is usually not scrap. It is a component problem, and component
              problems have fixes. Replacing an instrument that could have been repaired is
              money a hospital did not need to spend.
            </p>
            <p>
              That is the part of the business we are opening up online. Until now, repair
              requests came through phone calls, WhatsApp messages and whoever happened to pick
              up. That works at small scale and breaks at larger scale. A ticket raised on this
              site goes into our system with a reference number, so nothing gets lost between a
              phone call and a workbench.
            </p>
          </div>

          <dl
            style={{
              marginTop: "var(--w-s-7)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1px",
              background: "var(--w-border)",
              border: "1px solid var(--w-border)",
            }}
          >
            {FACTS.map(f => (
              <div key={f.label} style={{ background: "var(--w-plate)", padding: "var(--w-s-4) var(--w-s-5)" }}>
                <dt className="w-label" style={{ marginBottom: "var(--w-s-1)" }}>{f.label}</dt>
                <dd style={{ fontSize: "17px", fontFamily: "var(--w-font-head)", fontWeight: 600 }}>{f.value}</dd>
              </div>
            ))}
          </dl>

          <div style={{ marginTop: "var(--w-s-7)" }}>
            <p className="w-eyebrow" style={{ marginBottom: "var(--w-s-3)" }}>Clinical areas we support</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-2)" }}>
              {SPECIALTIES.map(s => (
                <span
                  key={s}
                  style={{
                    border: "1px solid var(--w-border)",
                    padding: "6px var(--w-s-3)",
                    fontSize: "15px",
                    color: "var(--w-text-2)",
                    background: "var(--w-canvas)",
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "var(--w-s-7)", display: "flex", flexWrap: "wrap", gap: "var(--w-s-3)" }}>
            <Link href="/open-ticket" className="w-btn w-btn--primary">Open a repair ticket</Link>
            <Link href="/contact" className="w-btn w-btn--outline">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
