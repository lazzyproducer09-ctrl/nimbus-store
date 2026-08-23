"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { YoinkMark } from "./icons";
import { CartButton } from "./CartButton";
import { SideMenu } from "./SideMenu";
import type { Category } from "@/lib/categories";

// Pages that get a stripped-down header (just the logo) — like real stores' auth pages.
const MINIMAL_ROUTES = ["/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email"];

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
}: {
  loggedIn: boolean;
  admin?: boolean;
  categories: Category[];
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
  // Three zones: menu hard against the left edge of the page, wordmark
  // centred, cart hard against the right.
  //
  // Full width rather than the max-w-6xl the rest of the page uses, so the
  // menu really sits at the page edge instead of being indented in line with
  // the content. The 1fr / auto / 1fr grid keeps the wordmark optically
  // centred however wide the two side items grow.
  //
  // Search, wishlist, account, orders and admin have all moved into the menu.
  // The cart is the only thing that still earns a permanent spot up here —
  // it's the one control a shopper reaches for mid-task.
  // -----------------------------------------------------------------------
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-void/80 backdrop-blur-md">
      <nav className="grid h-16 w-full grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-4">
        <div className="flex justify-start">
          <SideMenu loggedIn={loggedIn} admin={admin} categories={categories} />
        </div>

        <Wordmark />

        <div className="flex justify-end text-chalk">
          <CartButton />
        </div>
      </nav>
    </header>
  );
}
