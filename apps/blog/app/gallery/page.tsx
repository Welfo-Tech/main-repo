import type { Metadata } from "next";
import Image from "next/image";
import { GALLERY } from "../../lib/content";

export const metadata: Metadata = {
  title: "Gallery — Welfo Endovision",
  description: "Welfo Endovision at medical trade exhibitions across India, and inside our Rishikesh workshop.",
};

export default function GalleryPage() {
  return (
    <>
      <section style={{ background: "var(--w-ink-gradient)", color: "var(--w-text-invert)", paddingBlock: "var(--w-s-8)" }}>
        <div className="w-shell">
          <p className="w-eyebrow" style={{ color: "var(--w-accent)" }}>Events and gallery</p>
          <h1 style={{ fontSize: "clamp(32px, 5vw, 50px)", marginTop: "var(--w-s-3)", color: "var(--w-text-invert)" }}>
            Where you will find us
          </h1>
        </div>
      </section>

      <section style={{ paddingBlock: "var(--w-s-8)", background: "var(--w-plate)" }}>
        <div className="w-shell">
          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", marginBottom: "var(--w-s-5)" }}>Inside the workshop</h2>
          <div style={{ position: "relative", aspectRatio: "16/9", border: "1px solid var(--w-border)", background: "var(--w-sunken)" }}>
            <Image
              src="/img/Precision-Engineered.jpg"
              alt="Welfo Endovision manufacturing floor in Rishikesh"
              fill
              sizes="(max-width: 1200px) 100vw, 1140px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>

          <h2 style={{ fontSize: "clamp(22px, 3vw, 30px)", marginTop: "var(--w-s-8)", marginBottom: "var(--w-s-5)" }}>
            Exhibitions and events
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "var(--w-s-4)",
            }}
          >
            {GALLERY.map((src, i) => (
              <div
                key={src}
                style={{ position: "relative", aspectRatio: "4/3", border: "1px solid var(--w-border)", background: "var(--w-sunken)" }}
              >
                <Image
                  src={src}
                  alt={`Welfo Endovision exhibition stand ${i + 1}`}
                  fill
                  sizes="(max-width: 700px) 100vw, 300px"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
