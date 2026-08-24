"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { YoinkMark, SearchIcon } from "./icons";
import { CartButton } from "./CartButton";
import { SideMenu } from "./SideMenu";
import type { Category } from "@/lib/categories";

// Pages that get a stripped-down header (just the logo) — like real stores' auth pages.
const MINIMAL_ROUTES = ["/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email"];

// The three shop views. Shown inline here on desktop; the menu carries the same
// three on phones, where there is no room for them in the bar.
const SHOP_LINKS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?sort=newest", label: "New in" },
  { href: "/shop?sort=rating", label: "Best sellers" },
];

// The YOINK wordmark — reused by the minimal + full headers.
function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <YoinkMark className="h-5 w-5 text-volt" />
      <span className="font-heading text-xl font-black tracking-[0.3em] text-chalk">YOINK</span>
    </Link>
  );
}

export function Header({
  loggedIn,
  admin = false,
  categories,
  userName = "",
}: {
  loggedIn: boolean;
  admin?: boolean;
  categories: Category[];
  userName?: string;
}) {
  const pathname = usePathname();

  // Minimal header on login / signup: centered logo only, no nav or cart.
  if (MINIMAL_ROUTES.includes(pathname)) {
    return (
      <header className="border-b border-edge bg-void">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-center px-5">
          <Wordmark />
        </div>
      </header>
    );
  }

  // -----------------------------------------------------------------------
  // Three zones, full width: menu hard against the left edge of the page,
  // wordmark optically centred by the 1fr/auto/1fr grid, and the everyday
  // controls on the right.
  //
  // The bar carries what a shopper reaches for repeatedly — the shop views,
  // search, admin, cart. Everything that is browsed once and then left alone
  // (categories, account, orders, wishlist, policies) lives in the menu, so
  // neither surface ends up crowded.
  // -----------------------------------------------------------------------
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-void/80 backdrop-blur-md">
      <nav className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-4">
        <div className="flex items-center gap-6 justify-self-start">
          <SideMenu loggedIn={loggedIn} admin={admin} categories={categories} userName={userName} />
          <div className="hidden items-center gap-6 font-mono text-xs uppercase tracking-wider text-ash md:flex">
            {SHOP_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-volt">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <Wordmark />

        <div className="flex items-center gap-3 justify-self-end text-chalk sm:gap-4">
          {admin && (
            <Link
              href="/admin"
              className="hidden rounded-full bg-volt-deep px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-volt transition-colors hover:bg-volt hover:text-void sm:block"
            >
              Admin
            </Link>
          )}
          <Link
            href="/shop"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ash transition-colors hover:bg-surface hover:text-volt"
          >
            <SearchIcon className="h-5 w-5" />
          </Link>
          <CartButton />
        </div>
      </nav>
    </header>
  );
}
