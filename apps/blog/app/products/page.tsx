import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS } from "../../lib/products";

export const metadata: Metadata = {
  title: "Our Products — Welfo Endovision",
  description:
    "Rigid endoscopes manufactured in Rishikesh: cystoscopes, laparoscopes, sinuscopes, arthroscopes, camera systems and light guide connectors.",
};

export default function ProductsPage() {
  return (
    <>
      <section style={{ background: "var(--w-ink-gradient)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-8)" }}>
        <div className="w-shell">
          <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>Our products</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 50px)", marginTop: "var(--w-s-3)", color: "var(--w-text-invert)" }}>
            Rigid endoscopes, made in Rishikesh
          </h1>
          <p style={{ fontSize: "17px", color: "var(--w-text-invert-2)", marginTop: "var(--w-s-3)", maxWidth: "62ch", lineHeight: 1.65 }}>
            Every instrument below is manufactured and serviced at our own facility, which is
            why we can repair them rather than send them overseas.
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-canvas)" }}>
        <div className="w-shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(280px, 100%), 1fr))",
              gap: "var(--w-s-5)",
            }}
          >
            {PRODUCTS.map(p => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                style={{
                  background: "var(--w-plate)",
                  border: "1px solid var(--w-border)",
                  display: "flex",
                  flexDirection: "column",
                  transition: "border-color var(--w-dur) var(--w-ease)",
                }}
              >
                <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--w-sunken)" }}>
                  <Image
                    src={p.heroImage}
                    alt={p.name}
                    fill
                    sizes="(max-width: 700px) 100vw, 320px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div style={{ padding: "var(--w-s-4)", flex: 1, display: "flex", flexDirection: "column" }}>
                  <span className="w-eyebrow" style={{ marginBottom: "var(--w-s-1)" }}>{p.category}</span>
                  <h2 style={{ fontSize: "21px", marginBottom: "var(--w-s-2)" }}>{p.name}</h2>
                  <p style={{ fontSize: "15px", color: "var(--w-text-2)", lineHeight: 1.55, flex: 1 }}>
                    {p.tagline}
                  </p>
                  <span
                    style={{
                      marginTop: "var(--w-s-3)",
                      fontFamily: "var(--w-font-head)",
                      fontWeight: 600,
                      fontSize: "14px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "var(--w-accent-strong)",
                    }}
                  >
                    View details &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
