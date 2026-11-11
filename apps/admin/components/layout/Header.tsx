"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("accessToken");
    router.push("/login");
  }

  return (
    <header
      className="fixed top-0 right-0 z-40 flex items-center justify-end px-4 bg-ink border-b border-border-ink"
      style={{ height: "48px", left: "var(--w-sidebar-w)" }}
    >
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-caption text-fg-invert-2 hover:text-fg-invert transition-colors duration-fast"
      >
        <LogOut size={14} strokeWidth={1.5} />
        <span className="font-head font-medium uppercase tracking-wide" style={{ fontSize: "11px" }}>
          Sign out
        </span>
      </button>
    </header>
  );
}
