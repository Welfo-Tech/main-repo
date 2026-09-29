import Link from "next/link";
import { CONTACT } from "../lib/content";

const colHead: React.CSSProperties = {
  fontFamily: "var(--w-font-head)",
  fontSize: "12px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  color: "var(--w-text-invert-2)",
  marginBottom: "var(--w-s-3)",
};

const linkStyle: React.CSSProperties = {
  fontSize: "15px",
  color: "var(--w-text-invert)",
  opacity: 0.86,
  display: "block",
  marginBottom: "var(--w-s-2)",
};

export default function SiteFooter() {
  return (
    <footer style={{ background: "var(--w-ink-deep)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-8)" }}>
      <div className="w-shell">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "var(--w-s-6)",
            marginBottom: "var(--w-s-7)",
          }}
        >
          <div>
            <p style={{ fontFamily: "var(--w-font-head)", fontSize: "22px", fontWeight: 600, letterSpacing: "0.02em", marginBottom: "var(--w-s-2)" }}>
              WELFO
            </p>
            <p style={{ fontSize: "14px", color: "var(--w-text-invert-2)", lineHeight: 1.6, maxWidth: "30ch" }}>
              Medical fiber optics, endoscopy systems and surgical illumination. Manufactured and serviced in Rishikesh since 2011.
            </p>
          </div>

          <div>
            <p style={colHead}>Quick Links</p>
            <Link href="/" style={linkStyle}>Home</Link>
            <Link href="/about" style={linkStyle}>About Us</Link>
            <Link href="/products" style={linkStyle}>Our Products</Link>
            <Link href="/gallery" style={linkStyle}>Gallery</Link>
            <Link href="/track" style={linkStyle}>Track a Repair</Link>
            <Link href="/contact" style={linkStyle}>Contact Us</Link>
          </div>

          <div>
            <p style={colHead}>Our Products</p>
            <Link href="/products/cystoscope" style={linkStyle}>Cystoscope</Link>
            <Link href="/products/laparoscope-4k" style={linkStyle}>Laparoscope</Link>
            <Link href="/products/sinuscope" style={linkStyle}>Sinuscope</Link>
            <Link href="/products/arthroscope" style={linkStyle}>Arthroscope</Link>
            <Link href="/products/connectors" style={linkStyle}>Connectors</Link>
            <Link href="/products/surgical-camera-system" style={linkStyle}>Camera system</Link>
          </div>

          <div>
            <p style={colHead}>Reach Us</p>
            <a href={`tel:${CONTACT.phoneRaw}`} style={linkStyle}>{CONTACT.phone}</a>
            <a href={`mailto:${CONTACT.email}`} style={linkStyle}>{CONTACT.email}</a>
            <p style={{ fontSize: "14px", color: "var(--w-text-invert-2)", lineHeight: 1.6, marginTop: "var(--w-s-2)" }}>
              {CONTACT.addressLines.map(line => <span key={line} style={{ display: "block" }}>{line}</span>)}
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--w-border-ink)",
            paddingTop: "var(--w-s-4)",
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--w-s-3)",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "var(--w-text-invert-2)",
          }}
        >
          <span>&copy; {new Date().getFullYear()} Welfo Fiber Optics. All rights reserved.</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--w-s-2)" }}>
            <span style={{ width: "8px", height: "8px", background: "var(--w-brand)", display: "inline-block" }} />
            Made in India
          </span>
        </div>
      </div>
    </footer>
  );
}
