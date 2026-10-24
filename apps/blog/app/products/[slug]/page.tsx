import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CONTACT } from "../../../lib/content";
import { PRODUCTS, productBySlug } from "../../../lib/products";

export function generateStaticParams() {
  return PRODUCTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) return { title: "Product — Welfo Endovision" };
  return { title: `${product.name} — Welfo Endovision`, description: product.tagline };
}

const TH: React.CSSProperties = {
  fontFamily: "var(--w-font-head)",
  fontSize: "13px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "var(--w-text-2)",
  textAlign: "left",
  padding: "var(--w-s-3)",
  borderBottom: "1px solid var(--w-border)",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "var(--w-s-3)",
  fontSize: "15px",
  color: "var(--w-text-1)",
  borderBottom: "1px solid var(--w-border-soft)",
  verticalAlign: "top",
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <section style={{ background: "var(--w-ink-gradient)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-7)" }}>
        <div className="w-shell">
          <p style={{ fontSize: "14px", color: "var(--w-text-invert-2)", marginBottom: "var(--w-s-3)" }}>
            <Link href="/" style={{ color: "inherit" }}>Home</Link>
            {" / "}
            <Link href="/products" style={{ color: "inherit" }}>Products</Link>
            {" / "}
            <span style={{ color: "var(--w-text-invert)" }}>{product.name}</span>
          </p>
          <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>{product.category}</p>
          <h1 style={{ fontSize: "clamp(30px, 5vw, 46px)", marginTop: "var(--w-s-2)", color: "var(--w-text-invert)" }}>
            {product.name}
          </h1>
          <p style={{ fontSize: "17px", color: "var(--w-text-invert-2)", marginTop: "var(--w-s-3)", maxWidth: "62ch" }}>
            {product.tagline}
          </p>
        </div>
      </section>

      <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-plate)" }}>
        <div className="w-shell">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))",
              gap: "var(--w-s-7)",
              alignItems: "start",
            }}
          >
            <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--w-sunken)", border: "1px solid var(--w-border)" }}>
              <Image
                src={product.heroImage}
                alt={product.name}
                fill
                sizes="(max-width: 700px) 100vw, 520px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>

            <div style={{ display: "grid", gap: "var(--w-s-4)" }}>
              {product.intro.map((para, i) => (
                <p key={i} style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--w-text-1)" }}>
                  {para}
                </p>
              ))}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-3)", marginTop: "var(--w-s-2)" }}>
                <a href={`tel:${CONTACT.phoneRaw}`} className="w-btn w-btn--primary">
                  Enquire about this product
                </a>
                <Link href="/product-support" className="w-btn w-btn--outline">
                  Need a repair?
                </Link>
              </div>
            </div>
          </div>

          {product.sections?.map(sec => (
            <div key={sec.heading} style={{ marginTop: "var(--w-s-8)", maxWidth: "76ch" }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", marginBottom: "var(--w-s-3)" }}>{sec.heading}</h2>
              {sec.body?.map((b, i) => (
                <p key={i} style={{ fontSize: "16px", lineHeight: 1.7, color: "var(--w-text-2)", marginBottom: "var(--w-s-3)" }}>
                  {b}
                </p>
              ))}
              {sec.bullets && (
                <ul style={{ listStyle: "none", display: "grid", gap: "var(--w-s-2)" }}>
                  {sec.bullets.map(b => (
                    <li
                      key={b}
                      style={{
                        fontSize: "16px",
                        lineHeight: 1.6,
                        color: "var(--w-text-1)",
                        paddingLeft: "var(--w-s-4)",
                        borderLeft: "2px solid var(--w-accent)",
                      }}
                    >
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {product.specs.map((table, ti) => (
            <div key={ti} style={{ marginTop: "var(--w-s-8)" }}>
              <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", marginBottom: "var(--w-s-4)" }}>
                {table.caption ?? `Our ${product.name} products`}
              </h2>

              {table.images && table.images.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(auto-fit, minmax(min(180px, 100%), ${table.images.length > 2 ? "1fr" : "260px"}))`,
                    gap: "var(--w-s-4)",
                    marginBottom: "var(--w-s-5)",
                  }}
                >
                  {table.images.map(img => (
                    <figure key={img.src} style={{ margin: 0 }}>
                      <div style={{ position: "relative", aspectRatio: "4/3", background: "var(--w-sunken)", border: "1px solid var(--w-border)" }}>
                        <Image src={img.src} alt={`${product.name} ${img.label}`} fill sizes="260px" style={{ objectFit: "contain" }} />
                      </div>
                      <figcaption style={{ fontSize: "13px", color: "var(--w-text-mute)", marginTop: "6px", textAlign: "center" }}>
                        {img.label}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <div style={{ overflowX: "auto", border: "1px solid var(--w-border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "640px", background: "var(--w-plate)" }}>
                  <thead>
                    <tr style={{ background: "var(--w-canvas)" }}>
                      {table.columns.map(c => <th key={c} style={TH}>{c}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row, ri) => (
                      <tr key={ri}>
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            style={{
                              ...TD,
                              fontWeight: ci === 0 ? 600 : 400,
                              fontFamily: ci === table.columns.length - 1 ? "var(--w-font-head)" : undefined,
                              whiteSpace: ci === table.columns.length - 1 ? "nowrap" : undefined,
                            }}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{ fontSize: "14px", color: "var(--w-text-mute)", marginTop: "var(--w-s-3)" }}>
                Prices are indicative. Contact us on{" "}
                <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-accent-strong)", fontWeight: 500 }}>
                  {CONTACT.phone}
                </a>{" "}
                for current pricing and availability.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "var(--w-accent-deep)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-7)" }}>
        <div className="w-shell" style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-5)", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ maxWidth: "52ch" }}>
            <h2 style={{ fontSize: "clamp(24px, 3.5vw, 32px)", color: "var(--w-text-invert)", marginBottom: "var(--w-s-2)" }}>
              Already own one of these?
            </h2>
            <p style={{ fontSize: "16px", color: "var(--w-text-invert-2)", lineHeight: 1.6 }}>
              Enter the serial number and we will assess it. Most faults are repairable for a
              fraction of replacement cost.
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
