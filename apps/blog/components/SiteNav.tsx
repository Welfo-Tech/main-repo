"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/products", label: "Products" },
  { href: "/gallery", label: "Gallery" },
  { href: "/track", label: "Track" },
  { href: "/contact", label: "Contact" },
];

function CartIcon() {
  return (
    <span
      aria-label="Cart, coming soon"
      title="Cart — coming soon"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: "var(--w-text-invert-2)",
        fontFamily: "var(--w-font-head)",
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: "0.06em",
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
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--w-ink)",
        borderBottom: "1px solid var(--w-border-ink)",
      }}
    >
      <div
        className="w-shell"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "68px",
          gap: "var(--w-s-5)",
        }}
      >
        <Link href="/" aria-label="Welfo home" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <Image src="/logo.png" alt="Welfo" width={130} height={30} style={{ height: "30px", width: "auto" }} priority />
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "var(--w-s-4)" }} className="w-nav-desktop">
          {LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: "var(--w-font-head)",
                  fontSize: "15px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: active ? "var(--w-text-invert)" : "var(--w-text-invert-2)",
                  paddingBottom: "2px",
                  borderBottom: active ? "2px solid var(--w-accent)" : "2px solid transparent",
                  transition: "color var(--w-dur) var(--w-ease)",
                }}
              >
                {label}
              </Link>
            );
          })}
          <CartIcon />
          <Link href="/product-support" className="w-btn w-btn--primary" style={{ height: "38px" }}>
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
            border: "1px solid var(--w-border-ink)",
            color: "var(--w-text-invert)",
            width: "42px",
            height: "38px",
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
            borderTop: "1px solid var(--w-border-ink)",
            background: "var(--w-ink-deep)",
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
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: pathname === href ? "var(--w-text-invert)" : "var(--w-text-invert-2)",
              }}
            >
              {label}
            </Link>
          ))}
          <CartIcon />
          <Link
            href="/product-support"
            onClick={() => setOpen(false)}
            className="w-btn w-btn--primary"
            style={{ width: "100%" }}
          >
            Product Support
          </Link>
        </nav>
      )}

      <style>{`
        @media (max-width: 1080px) {
          .w-nav-desktop { display: none !important; }
          .w-nav-toggle { display: flex !important; }
        }
        @media (min-width: 1081px) {
          .w-nav-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}
