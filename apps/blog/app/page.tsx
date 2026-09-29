import Link from "next/link";
import { CAPABILITIES, CONTACT, PROCESS, PRODUCT_LINES, SPECIALTIES, VALUE_PROPS } from "../lib/content";

const sectionPad: React.CSSProperties = { paddingBlock: "var(--w-s-9)" };

const h2Style: React.CSSProperties = {
  fontSize: "clamp(28px, 4vw, 40px)",
  color: "var(--w-text-1)",
  marginTop: "var(--w-s-2)",
};

export default function Home() {
  return (
    <>
      <section style={{ background: "var(--w-ink)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-9)" }}>
        <div className="w-shell">
          <div style={{ maxWidth: "62ch" }}>
            <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>
              Endoscopy service division
            </p>
            <h1
              style={{
                fontSize: "clamp(36px, 6vw, 62px)",
                marginTop: "var(--w-s-3)",
                marginBottom: "var(--w-s-4)",
                color: "var(--w-text-invert)",
              }}
            >
              Your scope is repairable. Most of the time, for a fraction of replacement cost.
            </h1>
            <p style={{ fontSize: "18px", lineHeight: 1.65, color: "var(--w-text-invert-2)", marginBottom: "var(--w-s-6)" }}>
              We manufacture and repair rigid endoscopes, fiber optic light guides and imaging
              systems from our workshop in Rishikesh. If you have an instrument from us that has
              stopped performing, enter its serial number and we will assess it.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-3)" }}>
              <Link href="/product-support" className="w-btn w-btn--primary">
                Product Support
              </Link>
              <a href={`tel:${CONTACT.phoneRaw}`} className="w-btn w-btn--ghost">
                Call {CONTACT.phone}
              </a>
            </div>
          </div>

          <div
            style={{
              marginTop: "var(--w-s-8)",
              paddingTop: "var(--w-s-5)",
              borderTop: "1px solid var(--w-border-ink)",
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--w-s-2) var(--w-s-5)",
            }}
          >
            <span style={{ fontFamily: "var(--w-font-head)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--w-accent)" }}>
              Specialties
            </span>
            {SPECIALTIES.map(s => (
              <span key={s} style={{ fontSize: "15px", color: "var(--w-text-invert-2)" }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-plate)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">What we repair</p>
          <h2 style={h2Style}>Four things go wrong with an endoscope. We fix all of them.</h2>

          <div
            style={{
              marginTop: "var(--w-s-7)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "1px",
              background: "var(--w-border)",
              border: "1px solid var(--w-border)",
            }}
          >
            {CAPABILITIES.map(cap => (
              <div key={cap.title} style={{ background: "var(--w-plate)", padding: "var(--w-s-5)" }}>
                <h3 style={{ fontSize: "20px", marginBottom: "var(--w-s-2)" }}>{cap.title}</h3>
                <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.6 }}>{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-canvas)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">How it works</p>
          <h2 style={h2Style}>From serial number to returned instrument</h2>
          <p style={{ fontSize: "17px", color: "var(--w-text-2)", marginTop: "var(--w-s-3)", maxWidth: "58ch" }}>
            Five steps, in order. Nothing is charged before you approve a written quote.
          </p>

          <ol style={{ listStyle: "none", marginTop: "var(--w-s-7)", display: "grid", gap: "1px", background: "var(--w-border)", border: "1px solid var(--w-border)" }}>
            {PROCESS.map(item => (
              <li
                key={item.step}
                style={{
                  background: "var(--w-plate)",
                  padding: "var(--w-s-5)",
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "var(--w-s-5)",
                  alignItems: "start",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--w-font-head)",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "var(--w-accent)",
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1,
                  }}
                >
                  {item.step}
                </span>
                <div>
                  <h3 style={{ fontSize: "20px", marginBottom: "var(--w-s-1)" }}>{item.title}</h3>
                  <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.6, maxWidth: "66ch" }}>{item.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-plate)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">Why hospitals stay with us</p>
          <h2 style={h2Style}>Service is the product</h2>

          <div
            style={{
              marginTop: "var(--w-s-7)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--w-s-6) var(--w-s-7)",
            }}
          >
            {VALUE_PROPS.map(v => (
              <div key={v.title} style={{ borderTop: "2px solid var(--w-accent-strong)", paddingTop: "var(--w-s-3)" }}>
                <h3 style={{ fontSize: "19px", marginBottom: "var(--w-s-2)" }}>{v.title}</h3>
                <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.6 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-canvas)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">Instruments we work with</p>
          <h2 style={h2Style}>Manufactured and serviced in house</h2>

          <div
            style={{
              marginTop: "var(--w-s-6)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1px",
              background: "var(--w-border)",
              border: "1px solid var(--w-border)",
            }}
          >
            {PRODUCT_LINES.map(p => (
              <div key={p.name} style={{ background: "var(--w-plate)", padding: "var(--w-s-4) var(--w-s-5)" }}>
                <p style={{ fontFamily: "var(--w-font-head)", fontSize: "18px", fontWeight: 600 }}>{p.name}</p>
                <p style={{ fontSize: "14px", color: "var(--w-text-mute)" }}>{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--w-accent-deep)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-8)" }}>
        <div
          className="w-shell"
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-5)", alignItems: "center", justifyContent: "space-between" }}
        >
          <div style={{ maxWidth: "52ch" }}>
            <h2 style={{ fontSize: "clamp(26px, 3.5vw, 34px)", color: "var(--w-text-invert)", marginBottom: "var(--w-s-2)" }}>
              Have an instrument that needs looking at?
            </h2>
            <p style={{ fontSize: "17px", color: "var(--w-text-invert-2)", lineHeight: 1.6 }}>
              Enter the serial number and tell us what went wrong. You will get a reference number
              straight away and a call from our team.
            </p>
          </div>
          <Link href="/product-support" className="w-btn w-btn--primary" style={{ background: "var(--w-plate)", color: "var(--w-accent-deep)" }}>
            Product Support
          </Link>
        </div>
      </section>
    </>
  );
}
