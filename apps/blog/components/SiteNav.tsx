"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CONTACT, SOCIALS } from "../lib/content";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/products", label: "Our Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/track", label: "Track Repair" },
  { href: "/contact", label: "Contact Us" },
];

const SOCIAL_PATHS: Record<string, string> = {
  Facebook: "M13.5 9H15V6.5h-1.8C11.4 6.5 10.5 7.7 10.5 9.4V11H9v2.5h1.5V19h2.5v-5.5h1.8l.3-2.5h-2.1V9.7c0-.5.2-.7.8-.7Z",
  Instagram: "M12 8.6a3.4 3.4 0 1 0 0 6.8 3.4 3.4 0 0 0 0-6.8Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4Zm4.3-5.7a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0Z",
  X: "M17 6h-2.1l-2.6 3.3L10 6H6.5l4.2 5.5L6.7 18h2.1l2.9-3.6 2.5 3.6H18l-4.4-5.9L17 6Z",
  YouTube: "M19 9.2c0-1.2-.9-2.2-2-2.2-1.5-.1-3.2-.1-4.9-.1s-3.4 0-4.9.1c-1.1 0-2 1-2 2.2v5.6c0 1.2.9 2.2 2 2.2 1.5.1 3.2.1 4.9.1s3.4 0 4.9-.1c1.1 0 2-1 2-2.2V9.2ZM10.7 14.6V9.4l4 2.6-4 2.6Z",
};

function SocialIcon({ name }: { name: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="12" r="11" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.45" />
      <path d={SOCIAL_PATHS[name] ?? ""} />
    </svg>
  );
}

function CartIcon({ dark = false }: { dark?: boolean }) {
  return (
    <span
      aria-label="Cart, coming soon"
      title="Cart — coming soon"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: dark ? "var(--w-text-invert-2)" : "var(--w-ink)",
        fontFamily: "var(--w-font-head)",
        fontSize: "14px",
        fontWeight: 600,
      }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h2.2l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h8.7a1.6 1.6 0 0 0 1.6-1.3L21 7H5.1" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      0
    </span>
  );
}

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header>
      <div style={{ background: "var(--w-ink-deep)", color: "var(--w-text-invert)" }} className="w-utilitybar">
        <div
          className="w-shell"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--w-s-4)",
            minHeight: "38px",
            paddingBlock: "6px",
            flexWrap: "wrap",
            fontSize: "13px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "var(--w-s-3)" }}>
            {SOCIALS.map(s => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                style={{ color: "var(--w-text-invert)", opacity: 0.85, display: "inline-flex" }}
              >
                <SocialIcon name={s.name} />
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "var(--w-s-5)", flexWrap: "wrap" }}>
            <span style={{ color: "var(--w-text-invert-2)" }} className="w-util-address">
              {CONTACT.addressOneLine}
            </span>
            <a href={`tel:${CONTACT.phoneRaw}`} style={{ color: "var(--w-text-invert)" }}>
              {CONTACT.phone}
            </a>
            <a href={`mailto:${CONTACT.email}`} style={{ color: "var(--w-text-invert)" }} className="w-util-email">
              {CONTACT.email}
            </a>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "#fff",
          borderBottom: "1px solid var(--w-border-soft)",
          boxShadow: "0 1px 3px rgba(43,22,115,0.07)",
        }}
      >
        <div
          className="w-shell"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "76px",
            gap: "var(--w-s-4)",
          }}
        >
          <Link href="/" aria-label="Welfo Endovision home" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <Image
              src="/img/welfonewlogo1.png"
              alt="Welfo Endovision"
              width={666}
              height={259}
              style={{ height: "46px", width: "auto" }}
              priority
            />
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: "var(--w-s-4)" }} className="w-nav-desktop">
            {LINKS.map(({ href, label }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    fontFamily: "var(--w-font-head)",
                    fontSize: "15px",
                    fontWeight: 500,
                    color: active ? "var(--w-brand)" : "var(--w-ink)",
                    paddingBottom: "3px",
                    borderBottom: `2px solid ${active ? "var(--w-brand)" : "transparent"}`,
                    transition: "color var(--w-dur) var(--w-ease)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </Link>
              );
            })}
            <CartIcon />
            <Link href="/product-support" className="w-btn w-btn--primary" style={{ height: "40px" }}>
              Product Support
            </Link>
          </nav>

          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="w-nav-toggle"
            style={{
              background: "transparent",
              border: "1px solid var(--w-border)",
              borderRadius: "var(--w-radius)",
              color: "var(--w-ink)",
              width: "44px",
              height: "40px",
              cursor: "pointer",
              display: "none",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ display: "block", width: "18px", height: "2px", background: "currentColor" }} />
            <span style={{ display: "block", width: "18px", height: "2px", background: "currentColor" }} />
            <span style={{ display: "block", width: "18px", height: "2px", background: "currentColor" }} />
          </button>
        </div>

        {open && (
          <nav
            className="w-nav-mobile"
            style={{
              borderTop: "1px solid var(--w-border-soft)",
              background: "#fff",
              padding: "var(--w-s-4) var(--w-s-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--w-s-4)",
            }}
          >
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{
                  fontFamily: "var(--w-font-head)",
                  fontSize: "16px",
                  fontWeight: 500,
                  color: pathname === href ? "var(--w-brand)" : "var(--w-ink)",
                }}
              >
                {label}
              </Link>
            ))}
            <CartIcon />
            <Link href="/product-support" onClick={() => setOpen(false)} className="w-btn w-btn--primary" style={{ width: "100%" }}>
              Product Support
            </Link>
          </nav>
        )}
      </div>

      <style>{`
        @media (max-width: 1140px) {
          .w-nav-desktop { display: none !important; }
          .w-nav-toggle { display: flex !important; }
        }
        @media (min-width: 1141px) {
          .w-nav-mobile { display: none !important; }
        }
        @media (max-width: 900px) {
          .w-util-address { display: none !important; }
        }
        @media (max-width: 620px) {
          .w-util-email { display: none !important; }
        }
      `}</style>
    </header>
  );
}
