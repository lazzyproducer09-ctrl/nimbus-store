"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OffbeatMark, SearchIcon, UserIcon } from "./icons";
import { CartButton } from "./CartButton";
import { WishlistHeaderButton } from "./WishlistHeaderButton";

// Pages that get a stripped-down header (just the logo) — like real stores' auth pages.
const MINIMAL_ROUTES = ["/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email"];

// The OFFBEAT wordmark — reused by the minimal + full headers.
function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <OffbeatMark className="h-5 w-5 text-volt" />
      <span className="font-heading text-lg font-extrabold tracking-[0.28em] text-chalk">OFFBEAT</span>
    </Link>
  );
}

export function Header({ loggedIn, admin = false }: { loggedIn: boolean; admin?: boolean }) {
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

  // Full site header everywhere else.
  return (
    <header className="sticky top-0 z-40 border-b border-edge bg-void/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Wordmark />

        <div className="hidden items-center gap-8 font-mono text-xs uppercase tracking-wider text-ash md:flex">
          <Link className="transition-colors hover:text-volt" href="/shop">Shop all</Link>
          <Link className="transition-colors hover:text-volt" href="/shop?sort=newest">New in</Link>
          <Link className="transition-colors hover:text-volt" href="/#categories">Categories</Link>
          <Link className="transition-colors hover:text-volt" href="/contact">About</Link>
        </div>

        <div className="flex items-center gap-4 text-chalk sm:gap-5">
          {admin && (
            <Link
              href="/admin"
              className="hidden rounded-full bg-volt-deep px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-volt transition-colors hover:bg-volt hover:text-void sm:block"
            >
              Admin
            </Link>
          )}
          {loggedIn && (
            <Link
              href="/orders"
              className="hidden font-mono text-xs uppercase tracking-wider text-ash transition-colors hover:text-chalk sm:block"
            >
              Orders
            </Link>
          )}
          <Link
            href="/shop"
            aria-label="Search"
            className="group flex flex-col items-center text-ash transition-all hover:scale-110 hover:text-chalk"
          >
            <SearchIcon className="h-5 w-5" />
            <span className="mt-0.5 text-[10px]">Search</span>
          </Link>
          <WishlistHeaderButton />
          <Link
            href={loggedIn ? "/account" : "/login"}
            aria-label={loggedIn ? "My account" : "Log in"}
            className="group flex flex-col items-center text-ash transition-all hover:scale-110 hover:text-chalk"
          >
            <UserIcon className="h-5 w-5" />
            <span className="mt-0.5 text-[10px]">
              {loggedIn ? "Account" : "Login"}
            </span>
          </Link>
          <CartButton />
        </div>
      </nav>
    </header>
  );
}
