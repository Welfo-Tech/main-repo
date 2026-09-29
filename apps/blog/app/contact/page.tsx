import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT } from "../../lib/content";
import FindUs from "../../components/FindUs";

export const metadata: Metadata = {
  title: "Contact — Welfo Endovision",
  description: "Reach Welfo Fiber Optics in Rishikesh by phone, email or WhatsApp.",
};

const cardStyle: React.CSSProperties = {
  background: "var(--w-plate)",
  padding: "var(--w-s-5)",
};

export default function ContactPage() {
  return (
    <>
      <section style={{ background: "var(--w-ink-gradient)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-8)" }}>
        <div className="w-shell">
          <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>Contact</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 50px)", marginTop: "var(--w-s-3)", color: "var(--w-text-invert)" }}>
            Talk to us
          </h1>
          <p style={{ fontSize: "17px", color: "var(--w-text-invert-2)", marginTop: "var(--w-s-3)", maxWidth: "56ch", lineHeight: 1.65 }}>
            For a repair, the fastest route is the product support form — it goes straight into
            our system with a reference number. For anything else, reach us directly.
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-canvas)" }}>
        <div className="w-shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
              gap: "1px",
              background: "var(--w-border)",
              border: "1px solid var(--w-border)",
            }}
          >
            <div style={cardStyle}>
              <p className="w-label" style={{ marginBottom: "var(--w-s-2)" }}>Phone</p>
              <a
                href={`tel:${CONTACT.phoneRaw}`}
                style={{ fontFamily: "var(--w-font-head)", fontSize: "22px", fontWeight: 600, color: "var(--w-accent-strong)" }}
              >
                {CONTACT.phone}
              </a>
              <p style={{ fontSize: "14px", color: "var(--w-text-mute)", marginTop: "var(--w-s-2)" }}>
                Monday to Saturday, 10am to 6pm
              </p>
            </div>

            <div style={cardStyle}>
              <p className="w-label" style={{ marginBottom: "var(--w-s-2)" }}>Email</p>
              <a
                href={`mailto:${CONTACT.email}`}
                style={{ fontSize: "17px", color: "var(--w-accent-strong)", fontWeight: 500, overflowWrap: "anywhere" }}
              >
                {CONTACT.email}
              </a>
              <p style={{ fontSize: "14px", color: "var(--w-text-mute)", marginTop: "var(--w-s-2)" }}>
                We reply within one working day
              </p>
            </div>

            <div style={cardStyle}>
              <p className="w-label" style={{ marginBottom: "var(--w-s-2)" }}>WhatsApp</p>
              <a
                href={CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "17px", color: "var(--w-accent-strong)", fontWeight: 500 }}
              >
                Message us
              </a>
              <p style={{ fontSize: "14px", color: "var(--w-text-mute)", marginTop: "var(--w-s-2)" }}>
                Good for photos of a damaged instrument
              </p>
            </div>

            <div style={cardStyle}>
              <p className="w-label" style={{ marginBottom: "var(--w-s-2)" }}>Workshop</p>
              <p style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--w-text-1)" }}>
                {CONTACT.addressLines.map(line => <span key={line} style={{ display: "block" }}>{line}</span>)}
              </p>
              <a
                href={CONTACT.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: "15px", color: "var(--w-accent-strong)", fontWeight: 500, display: "inline-block", marginTop: "var(--w-s-2)" }}
              >
                Open in Maps &rarr;
              </a>
            </div>
          </div>

          <div
            style={{
              marginTop: "var(--w-s-7)",
              background: "var(--w-accent-deep)",
              color: "var(--w-text-invert)",
              padding: "var(--w-s-6)",
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--w-s-5)",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ maxWidth: "50ch" }}>
              <h2 style={{ fontSize: "26px", color: "var(--w-text-invert)", marginBottom: "var(--w-s-2)" }}>
                Instrument needs repair?
              </h2>
              <p style={{ fontSize: "16px", color: "var(--w-text-invert-2)", lineHeight: 1.6 }}>
                Verify the serial number and you get a reference number immediately, with the
                request in front of our service team.
              </p>
            </div>
            <Link href="/product-support" className="w-btn w-btn--primary" style={{ background: "var(--w-plate)", color: "var(--w-accent-deep)" }}>
              Product Support
            </Link>
          </div>
        </div>
      </section>

      <FindUs />
    </>
  );
}
