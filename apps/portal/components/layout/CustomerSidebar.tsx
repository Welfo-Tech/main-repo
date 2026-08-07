"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    label: "Dashboard",
    href: "/customer-dashboard",
  },
  {
    label: "My Service Cases",
    href: "/customer/service-cases",
  },
  {
    label: "My Quotes",
    href: "/customer/quotes",
  },
  {
    label: "My Invoices",
    href: "/customer/invoices",
  },
  {
    label: "My Devices",
    href: "/customer/products",
  },
  {
    label: "Profile",
    href: "/customer/profile",
  },
  {
    label: "Support",
    href: "/customer/support",
  },
];

export default function CustomerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-900">
          Customer Portal
        </h2>
      </div>

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

        <button
          className="mt-8 rounded-lg px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}