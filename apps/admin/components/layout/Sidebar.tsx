"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Package,
  Wrench,
  Ticket,
  FileText,
  Receipt,
} from "lucide-react";

const NAV = [
  { href: "/admin-dashboard", label: "Dashboard",      icon: LayoutDashboard },
  { href: "/organizations",   label: "Organizations",  icon: Building2 },
  { href: "/products",        label: "Products",        icon: Package },
  { href: "/service-cases",   label: "Service Cases",   icon: Wrench },
  { href: "/tickets",         label: "Tickets",         icon: Ticket },
  { href: "/quotes",          label: "Quotes",          icon: FileText },
  { href: "/invoices",        label: "Invoices",        icon: Receipt },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 bottom-0 bg-ink flex flex-col z-50"
      style={{ width: "var(--w-sidebar-w)" }}
    >
      <div
        className="flex items-center px-4 shrink-0"
        style={{ height: "48px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <Image
          src="/logo.png"
          alt="Welfo"
          width={120}
          height={48}
          style={{ height: "28px", width: "auto", objectFit: "contain" }}
          priority
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 transition-colors duration-fast"
              style={{
                height: "36px",
                color: active ? "var(--w-text-invert)" : "var(--w-text-invert-2)",
                background: active ? "var(--w-ink-raised)" : "transparent",
                textDecoration: "none",
              }}
            >
              <Icon size={18} strokeWidth={1.5} />
              <span
                className="font-head font-medium"
                style={{ fontSize: "13px", letterSpacing: "0.02em" }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
