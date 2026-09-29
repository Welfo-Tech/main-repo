import Image from "next/image";
import Link from "next/link";
import {
  CAPABILITIES,
  CONTACT,
  GALLERY,
  PROCESS,
  SPECIALTIES,
  SPECIALTY_CARDS,
  STATS,
  TECHNOLOGY,
  VALUE_PROPS,
  WHY_CHOOSE,
} from "../lib/content";
import { PRODUCTS } from "../lib/products";

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

      <section style={{ background: "var(--w-brand)", color: "#fff", paddingBlock: "var(--w-s-6)" }}>
        <div className="w-shell">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--w-s-5)" }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "var(--w-font-head)", fontSize: "clamp(32px, 5vw, 44px)", fontWeight: 700, lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ fontSize: "15px", marginTop: "var(--w-s-2)", opacity: 0.92 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-plate)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">Clinical areas</p>
          <h2 style={h2Style}>Specialties we support</h2>

          <div
            style={{
              marginTop: "var(--w-s-6)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "var(--w-s-4)",
            }}
          >
            {SPECIALTY_CARDS.map(s => (
              <div key={s.name} style={{ position: "relative", aspectRatio: "4/3", border: "1px solid var(--w-border)", overflow: "hidden" }}>
                <Image src={s.image} alt={s.name} fill sizes="(max-width: 700px) 100vw, 320px" style={{ objectFit: "cover" }} />
                <span
                  style={{
                    position: "absolute",
                    inset: "auto 0 0 0",
                    padding: "var(--w-s-3) var(--w-s-4)",
                    background: "linear-gradient(transparent, rgba(21,33,45,0.88))",
                    color: "#fff",
                    fontFamily: "var(--w-font-head)",
                    fontSize: "19px",
                    fontWeight: 600,
                  }}
                >
                  {s.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: "var(--w-canvas)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))" }}>
          <div style={{ position: "relative", minHeight: "380px" }}>
            <Image
              src="/img/Precision-Engineered.jpg"
              alt="Welfo Endovision manufacturing floor in Rishikesh"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div style={{ background: "var(--w-accent-deep)", color: "var(--w-text-invert)", padding: "var(--w-s-8) var(--w-s-6)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <span style={{ width: "72px", height: "3px", background: "var(--w-brand)", marginBottom: "var(--w-s-4)" }} />
            <h2 style={{ fontSize: "clamp(26px, 4vw, 36px)", color: "var(--w-text-invert)", marginBottom: "var(--w-s-3)" }}>
              Precision-engineered endoscopy solutions
            </h2>
            <p style={{ fontSize: "17px", color: "var(--w-text-invert-2)", lineHeight: 1.65, marginBottom: "var(--w-s-5)", maxWidth: "52ch" }}>
              Explore our range of rigid endoscopes engineered for superior brightness, sharp
              contrast and optimised clarity — manufactured at our own facility in Rishikesh.
            </p>
            <div>
              <Link href="/products" className="w-btn w-btn--primary" style={{ background: "var(--w-brand)" }}>
                Range of endoscopes
              </Link>
            </div>
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

      <section style={{ ...sectionPad, background: "var(--w-plate)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">Why choose Welfo Endovision</p>
          <h2 style={h2Style}>Built to be repaired, not replaced</h2>

          <div
            style={{
              marginTop: "var(--w-s-7)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1px",
              background: "var(--w-border)",
              border: "1px solid var(--w-border)",
            }}
          >
            {WHY_CHOOSE.map(w => (
              <div
                key={w.title}
                style={{
                  background: "var(--w-plate)",
                  padding: "var(--w-s-5) var(--w-s-4)",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "var(--w-s-3)",
                }}
              >
                <Image src={w.icon} alt="" width={46} height={46} style={{ height: "46px", width: "auto", objectFit: "contain" }} />
                <p style={{ fontFamily: "var(--w-font-head)", fontSize: "17px", fontWeight: 600, lineHeight: 1.3 }}>
                  {w.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-canvas)" }}>
        <div className="w-shell">
          <p className="w-eyebrow">Technology</p>
          <h2 style={h2Style}>Technology that redefines imaging</h2>
          <p style={{ fontSize: "17px", color: "var(--w-text-2)", marginTop: "var(--w-s-3)", maxWidth: "70ch", lineHeight: 1.65 }}>
            Our R&amp;D team pioneers advancements in optical clarity, spectral imaging and
            enhanced contrast visualisation, ensuring every procedure benefits from superior
            image definition.
          </p>

          <div
            style={{
              marginTop: "var(--w-s-7)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--w-s-6)",
            }}
          >
            {TECHNOLOGY.map(t => (
              <div key={t.title} style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--w-s-3)" }}>
                <Image src={t.icon} alt="" width={56} height={56} style={{ height: "56px", width: "auto", objectFit: "contain" }} />
                <p style={{ fontFamily: "var(--w-font-head)", fontSize: "18px", fontWeight: 600 }}>{t.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-plate)" }}>
        <div className="w-shell">
          <div className="flex" style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-4)", alignItems: "end", justifyContent: "space-between", marginBottom: "var(--w-s-6)" }}>
            <div>
              <p className="w-eyebrow">Our products</p>
              <h2 style={h2Style}>Manufactured and serviced in house</h2>
            </div>
            <Link href="/products" className="w-btn w-btn--outline">View all products</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: "var(--w-s-4)" }}>
            {PRODUCTS.slice(0, 4).map(p => (
              <Link key={p.slug} href={`/products/${p.slug}`} style={{ border: "1px solid var(--w-border)", background: "var(--w-plate)" }}>
                <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--w-sunken)" }}>
                  <Image src={p.heroImage} alt={p.name} fill sizes="(max-width: 700px) 100vw, 260px" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ padding: "var(--w-s-3) var(--w-s-4)" }}>
                  <p style={{ fontFamily: "var(--w-font-head)", fontSize: "17px", fontWeight: 600 }}>{p.name}</p>
                  <p style={{ fontSize: "13px", color: "var(--w-text-mute)" }}>{p.category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...sectionPad, background: "var(--w-canvas)" }}>
        <div className="w-shell">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-4)", alignItems: "end", justifyContent: "space-between", marginBottom: "var(--w-s-6)" }}>
            <div>
              <p className="w-eyebrow">Events</p>
              <h2 style={h2Style}>Where you will find us</h2>
            </div>
            <Link href="/gallery" className="w-btn w-btn--outline">Full gallery</Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "var(--w-s-3)" }}>
            {GALLERY.slice(0, 4).map((src, i) => (
              <div key={src} style={{ position: "relative", aspectRatio: "4/3", border: "1px solid var(--w-border)", background: "var(--w-sunken)" }}>
                <Image src={src} alt={`Welfo Endovision exhibition stand ${i + 1}`} fill sizes="(max-width: 700px) 100vw, 260px" style={{ objectFit: "cover" }} />
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
