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
  { label: "Working since", value: "2020 (parent est. 2002)" },
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
              Welfo Endovision is a trusted Indian manufacturer of rigid endoscopes, delivering
              high-quality, cost-effective endoscopic solutions to hospitals and clinics across
              the country.
            </p>
            <p>
              Founded in 2020 as a specialised division of our parent company Welfo Fiber Optics
              (established in 2002), Welfo Endovision was created to strengthen India&rsquo;s
              medical device manufacturing ecosystem and address a long-standing gap in the
              market. At the time, most rigid endoscopes were imported, expensive, and lacked
              dependable after-sales support. We set out to change that.
            </p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 28px)", marginTop: "var(--w-s-3)" }}>
              Precision manufacturing. Practical solutions.
            </h2>
            <p>
              At Welfo Endovision, we manufacture rigid endoscopes designed to meet the
              real-world demands of healthcare professionals. Our focus is on precision,
              durability and consistent performance, ensuring that clinicians can rely on our
              instruments in critical environments. By manufacturing locally in India, we
              maintain strict quality control, reduce lead times, and offer solutions that are
              both reliable and affordable.
            </p>
            <h2 style={{ fontSize: "clamp(22px, 3vw, 28px)", marginTop: "var(--w-s-3)" }}>
              What sets us apart
            </h2>
            <ul style={{ listStyle: "none", display: "grid", gap: "var(--w-s-3)" }}>
              {[
                "Competitive pricing that makes advanced endoscopic equipment more accessible",
                "Strong after-sales service, ensuring long-term support and peace of mind",
                "Quality-driven manufacturing, backed by years of optical and medical device expertise",
              ].map(b => (
                <li key={b} style={{ paddingLeft: "var(--w-s-4)", borderLeft: "2px solid var(--w-accent)" }}>{b}</li>
              ))}
            </ul>
            <p>
              We don&rsquo;t just supply products — we build long-term partnerships with
              healthcare institutions by standing behind everything we manufacture.
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
            <Link href="/product-support" className="w-btn w-btn--primary">Product Support</Link>
            <Link href="/contact" className="w-btn w-btn--outline">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
