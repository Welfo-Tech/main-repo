"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin-dashboard",
  },
  {
    label: "Organizations",
    href: "/organizations",
  },
  {
    label: "Products",
    href: "/products",
  },
  {
    label: "Service Cases",
    href: "/service-cases",
  },
  {
    label: "Tickets",
    href: "/tickets",
  },
  {
    label: "Quotes",
    href: "/quotes",
  },
  {
    label: "Invoices",
    href: "/invoices",
  },
  {
    label: "Dispatch",
    href: "/dispatch",
  },
  {
    label: "Spare Parts",
    href: "/spare-parts",
  },
  {
    label: "Users",
    href: "/users",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
<aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-60 border-r border-slate-200 bg-">
        
     

      <nav className="flex flex-col gap-1 p-3">
        {menuItems.map((item) => {
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}