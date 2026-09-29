import { CONTACT, SOCIALS } from "../lib/content";

const SOCIAL_BLURB: Record<string, string> = {
  Instagram: "Product shots, exhibitions and workshop updates",
  Facebook: "Announcements and event coverage",
  X: "Short updates from the team",
  YouTube: "Product walkthroughs and demonstrations",
};

const ICON: Record<string, string> = {
  Facebook: "M13.5 9H15V6.5h-1.8C11.4 6.5 10.5 7.7 10.5 9.4V11H9v2.5h1.5V19h2.5v-5.5h1.8l.3-2.5h-2.1V9.7c0-.5.2-.7.8-.7Z",
  Instagram: "M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Zm4.3-5.7a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0Z",
  X: "M17 6h-2.1l-2.6 3.3L10 6H6.5l4.2 5.5L6.7 18h2.1l2.9-3.6 2.5 3.6H18l-4.4-5.9L17 6Z",
  YouTube: "M19 9.2c0-1.2-.9-2.2-2-2.2-1.5-.1-3.2-.1-4.9-.1s-3.4 0-4.9.1c-1.1 0-2 1-2 2.2v5.6c0 1.2.9 2.2 2 2.2 1.5.1 3.2.1 4.9.1s3.4 0 4.9-.1c1.1 0 2-1 2-2.2V9.2ZM10.7 14.6V9.4l4 2.6-4 2.6Z",
};

export default function FindUs() {
  return (
    <section style={{ paddingBlock: "var(--w-s-9)", background: "var(--w-canvas)" }}>
      <div className="w-shell">
        <p className="w-eyebrow">Find us</p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 40px)", color: "var(--w-text-1)", marginTop: "var(--w-s-2)", marginBottom: "var(--w-s-6)" }}>
          Rishikesh, Uttarakhand
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--w-s-5)" }}>
          <div
            style={{
              border: "1px solid var(--w-border)",
              borderRadius: "var(--w-radius-lg)",
              overflow: "hidden",
              background: "var(--w-plate)",
              minHeight: "380px",
              display: "flex",
            }}
          >
            <iframe
              src={CONTACT.mapsEmbedUrl}
              title="Welfo Endovision workshop location in Rishikesh"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              style={{ border: 0, width: "100%", minHeight: "380px", display: "block" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--w-s-4)" }}>
            <div
              style={{
                background: "var(--w-ink-gradient)",
                color: "var(--w-text-invert)",
                borderRadius: "var(--w-radius-lg)",
                padding: "var(--w-s-5)",
              }}
            >
              <p className="w-eyebrow" style={{ color: "var(--w-accent)", marginBottom: "var(--w-s-2)" }}>
                Workshop
              </p>
              <p style={{ fontSize: "17px", lineHeight: 1.6, marginBottom: "var(--w-s-4)" }}>
                {CONTACT.addressLines.map(l => <span key={l} style={{ display: "block" }}>{l}</span>)}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--w-s-3)" }}>
                <a href={CONTACT.mapsUrl} target="_blank" rel="noopener noreferrer" className="w-btn w-btn--primary">
                  Get directions
                </a>
                <a href={`tel:${CONTACT.phoneRaw}`} className="w-btn w-btn--ghost">
                  {CONTACT.phone}
                </a>
              </div>
            </div>

            <div
              style={{
                background: "var(--w-plate)",
                border: "1px solid var(--w-border)",
                borderRadius: "var(--w-radius-lg)",
                padding: "var(--w-s-5)",
                flex: 1,
              }}
            >
              <p className="w-eyebrow" style={{ marginBottom: "var(--w-s-3)" }}>Follow us</p>
              <ul style={{ listStyle: "none", display: "grid", gap: "var(--w-s-2)" }}>
                {SOCIALS.map(s => (
                  <li key={s.name}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--w-s-3)",
                        padding: "var(--w-s-3)",
                        borderRadius: "var(--w-radius)",
                        border: "1px solid var(--w-border-soft)",
                        transition: "border-color var(--w-dur) var(--w-ease)",
                      }}
                    >
                      <span
                        aria-hidden
                        style={{
                          width: "38px",
                          height: "38px",
                          borderRadius: "var(--w-radius)",
                          background: "var(--w-accent-tint)",
                          color: "var(--w-ink)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <svg width="21" height="21" viewBox="0 0 24 24" fill="currentColor">
                          <path d={ICON[s.name] ?? ""} />
                        </svg>
                      </span>
                      <span style={{ minWidth: 0 }}>
                        <span style={{ display: "block", fontFamily: "var(--w-font-head)", fontWeight: 600, fontSize: "15px", color: "var(--w-text-1)" }}>
                          {s.name === "X" ? "X (Twitter)" : s.name}
                        </span>
                        <span style={{ display: "block", fontSize: "13px", color: "var(--w-text-mute)" }}>
                          {SOCIAL_BLURB[s.name]}
                        </span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
