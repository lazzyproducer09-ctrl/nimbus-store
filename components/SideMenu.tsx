"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import type { Category } from "@/lib/categories";
import { useWishlist } from "@/lib/wishlist-context";
import { MenuIcon, CloseIcon, YoinkMark, ChevronIcon } from "./icons";

// ---------------------------------------------------------------------------
// The site menu: a four-line button at the left edge of the page that slides a
// panel in from the left.
//
// It holds what you browse once and then leave alone — categories, your
// account, orders, wishlist, policies. The things a shopper reaches for over
// and over (the shop views, search, cart) stay in the header bar, so neither
// surface ends up crowded.
//
// Categories and Help each collapse behind a single row. Listed flat they
// pushed everything else off the first screen.
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

// A group that folds behind one row. Used for Categories and Help so both
// behave identically — same chevron, same indent, same keyboard semantics.
function Collapsible({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={id}
        className={`${linkClass} flex w-full items-center justify-between gap-2 text-left`}
      >
        {label}
        <ChevronIcon
          className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div id={id} className="ml-3 border-l border-edge pl-2">
          {children}
        </div>
      )}
    </>
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
  const { count: wishlistCount, hydrated } = useWishlist();
  const [open, setOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  // The panel is portalled to <body>, which only exists in the browser.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Close on navigation — otherwise the panel stays over the page you just
  // asked for. The groups fold back up too, so it always reopens compact.
  useEffect(() => {
    setOpen(false);
    setShowCategories(false);
    setShowHelp(false);
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

  const panel = (
    <>
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
        <nav className="flex-1 overflow-y-auto px-2 pb-6 pt-3" inert={!open || undefined}>
          {/* Collapsed by default — one row instead of six. */}
          {categories.length > 0 && (
            <Collapsible
              id="menu-categories"
              label="Categories"
              open={showCategories}
              onToggle={() => setShowCategories((v) => !v)}
            >
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
            </Collapsible>
          )}

          {/* On desktop these three sit in the header bar; a phone has no room
              for them up there, so the menu carries them instead. */}
          <div className="md:hidden">
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
          </div>

          <GroupLabel>You</GroupLabel>
          <Link href={loggedIn ? "/account" : "/login"} className={linkClass}>
            {loggedIn ? "My account" : "Log in"}
          </Link>
          {loggedIn && (
            <Link href="/orders" className={linkClass}>
              My orders
            </Link>
          )}
          <Link
            href="/wishlist"
            className={`${linkClass} flex items-center justify-between gap-2`}
          >
            Wishlist
            {hydrated && wishlistCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-volt-deep px-1.5 text-[11px] font-semibold text-volt">
                {wishlistCount}
              </span>
            )}
          </Link>
          {/* the header shows an Admin chip from sm up, so only phones need this */}
          {admin && (
            <Link
              href="/admin"
              className={`${linkClass} font-medium text-volt hover:text-volt sm:hidden`}
            >
              Admin panel
            </Link>
          )}

          <div className="pt-2">
            <Collapsible
              id="menu-help"
              label="Help"
              open={showHelp}
              onToggle={() => setShowHelp((v) => !v)}
            >
              <Link href="/shipping" className={linkClass}>
                Shipping
              </Link>
              <Link href="/refund" className={linkClass}>
                Returns &amp; refunds
              </Link>
              <Link href="/contact" className={linkClass}>
                Contact us
              </Link>
            </Collapsible>
          </div>
        </nav>
      </aside>
    </>
  );

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

      {/*
        The panel is portalled OUT to <body> instead of rendering where this
        component sits.

        The header carries `backdrop-blur-md`, and an ancestor with a
        backdrop-filter becomes the containing block for `position: fixed`
        descendants. Rendered inside the header, this panel's `h-full` resolved
        against the header's 64px rather than the viewport, so it opened as a
        64px sliver with every link scrolled out of sight. Portalling to <body>
        puts it back under the real viewport.
      */}
      {mounted && createPortal(panel, document.body)}
    </>
  );
}
