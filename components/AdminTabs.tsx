"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
];

export function AdminTabs() {
  const pathname = usePathname();
  return (
    <nav className="mt-4 flex gap-1 border-b border-edge">
      {TABS.map((t) => {
        const active =
          t.href === "/admin" ? pathname === "/admin" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              active ? "border-volt text-chalk" : "border-transparent text-ash hover:text-chalk"
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
