"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/categories";
import { MenuIcon, CloseIcon, YoinkMark } from "./icons";

// ---------------------------------------------------------------------------
// The left-hand menu: a four-line button in the header that slides a panel in
// from the left.
//
// It isn't only a mobile convenience. The header's inline links disappear below
// `md`, so until now a phone had no navigation at all — and phones are where an
// ad click lands. This also gives categories a home: the header never had room
// to list them.
// ---------------------------------------------------------------------------

const MINIMAL_ROUTES = [
  "/login",
  "/signup",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const linkClass =
  "block rounded-lg px-3 py-2.5 text-sm text-ash transition-colors hover:bg-surface hover:text-chalk";

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-1 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-ash-dim">
      {children}
    </p>
  );
}

export function SideMenu({
  loggedIn,
  admin = false,
  categories,
}: {
  loggedIn: boolean;
  admin?: boolean;
  categories: Category[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on navigation — otherwise the panel stays over the page you just
  // asked for.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes it, and the page behind must not scroll while it's over them.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (MINIMAL_ROUTES.includes(pathname)) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="site-menu"
        className="-ml-1.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-ash transition-colors hover:bg-surface hover:text-volt"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {/* dim backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* sliding panel */}
      <aside
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed left-0 top-0 z-50 flex h-full w-[19rem] max-w-[85vw] flex-col border-r border-edge bg-coal text-chalk shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-edge px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <YoinkMark className="h-5 w-5 text-volt" />
            <span className="font-heading text-lg font-black tracking-[0.3em] text-chalk">
              YOINK
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-ash transition-colors hover:bg-surface hover:text-chalk"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* `inert` keeps the links out of tab order while the panel is closed */}
        <nav className="flex-1 overflow-y-auto px-2 pb-6" inert={!open || undefined}>
          <GroupLabel>Shop</GroupLabel>
          <Link href="/shop" className={linkClass}>
            Shop all
          </Link>
          <Link href="/shop?sort=newest" className={linkClass}>
            New in
          </Link>
          <Link href="/shop?sort=rating" className={linkClass}>
            Best sellers
          </Link>

          {categories.length > 0 && (
            <>
              <GroupLabel>Categories</GroupLabel>
              {categories.map((c) => (
                <Link
                  key={c.name}
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  className={linkClass}
                >
                  {c.name}
                  <span className="block text-[11px] text-ash-dim">{c.blurb}</span>
                </Link>
              ))}
            </>
          )}

          <GroupLabel>You</GroupLabel>
          <Link href={loggedIn ? "/account" : "/login"} className={linkClass}>
            {loggedIn ? "My account" : "Log in"}
          </Link>
          {loggedIn && (
            <Link href="/orders" className={linkClass}>
              My orders
            </Link>
          )}
          <Link href="/wishlist" className={linkClass}>
            Wishlist
          </Link>
          {admin && (
            <Link
              href="/admin"
              className={`${linkClass} font-medium text-volt hover:text-volt`}
            >
              Admin panel
            </Link>
          )}

          <GroupLabel>Help</GroupLabel>
          <Link href="/shipping" className={linkClass}>
            Shipping
          </Link>
          <Link href="/refund" className={linkClass}>
            Returns &amp; refunds
          </Link>
          <Link href="/contact" className={linkClass}>
            Contact us
          </Link>
        </nav>
      </aside>
    </>
  );
}
