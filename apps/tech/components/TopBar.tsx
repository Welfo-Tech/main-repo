"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "../lib/api";

export default function TopBar({ subtitle }: { subtitle?: string }) {
  const router = useRouter();

  return (
    <header
      style={{
        background: "var(--w-ink-gradient)",
        color: "var(--w-text-invert)",
        paddingTop: "max(var(--w-s-3), env(safe-area-inset-top))",
        paddingBottom: "var(--w-s-3)",
      }}
    >
      <div
        className="shell"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--w-s-3)" }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "var(--w-s-3)", minWidth: 0 }}>
          <span style={{ background: "#fff", borderRadius: "8px", padding: "5px 8px", flexShrink: 0 }}>
            <Image src="/logo.png" alt="Welfo" width={666} height={259} style={{ height: "22px", width: "auto" }} priority />
          </span>
          {subtitle && (
            <span style={{ fontSize: "14px", color: "var(--w-text-invert-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {subtitle}
            </span>
          )}
        </Link>

        <button
          onClick={() => { clearToken(); router.replace("/login"); }}
          style={{
            background: "transparent",
            border: "1px solid var(--w-border-ink)",
            color: "var(--w-text-invert)",
            borderRadius: "8px",
            minHeight: "38px",
            paddingInline: "var(--w-s-3)",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
