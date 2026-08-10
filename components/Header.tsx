"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UmbrellaMark, SearchIcon, UserIcon } from "./icons";
import { CartButton } from "./CartButton";
import { WishlistHeaderButton } from "./WishlistHeaderButton";

// Pages that get a stripped-down header (just the logo) — like real stores' auth pages.
const MINIMAL_ROUTES = ["/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email"];

export function Header({ loggedIn, admin = false }: { loggedIn: boolean; admin?: boolean }) {
  const pathname = usePathname();

  // Minimal header on login / signup: centered logo only, no nav or cart.
  if (MINIMAL_ROUTES.includes(pathname)) {
    return (
      <header className="border-b border-line bg-paper">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-center px-5">
          <Link href="/" className="flex items-center gap-2">
            <UmbrellaMark className="h-5 w-5 text-storm" />
            <span className="font-heading text-lg font-semibold tracking-[0.25em]">NIMBUS</span>
          </Link>
        </div>
      </header>
    );
  }

  // Full site header everywhere else.
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2">
          <UmbrellaMark className="h-5 w-5 text-storm" />
          <span className="font-heading text-lg font-semibold tracking-[0.25em]">NIMBUS</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm text-muted md:flex">
          <Link className="transition-colors hover:text-ink" href="/shop?category=Raincoats">Raincoats</Link>
          <Link className="transition-colors hover:text-ink" href="/shop?category=Umbrellas">Umbrellas</Link>
          <Link className="transition-colors hover:text-ink" href="/shop">Shop all</Link>
          {/* About page is built later */}
          <Link className="transition-colors hover:text-ink" href="#">About</Link>
        </div>

        <div className="flex items-center gap-4 text-ink sm:gap-5">
          {admin && (
            <Link
              href="/admin"
              className="hidden rounded-full bg-storm/10 px-3 py-1 text-xs font-medium text-storm transition-colors hover:bg-storm/20 sm:block"
            >
              Admin
            </Link>
          )}
          {loggedIn && (
            <Link
              href="/orders"
              className="hidden text-sm text-muted transition-colors hover:text-ink sm:block"
            >
              Orders
            </Link>
          )}
          <Link
            href="/shop"
            aria-label="Search"
            className="group flex flex-col items-center transition-transform hover:scale-110"
          >
            <SearchIcon className="h-5 w-5" />
            <span className="mt-0.5 text-[10px] text-muted group-hover:text-ink">Search</span>
          </Link>
          <WishlistHeaderButton />
          <Link
            href={loggedIn ? "/account" : "/login"}
            aria-label={loggedIn ? "My account" : "Log in"}
            className="group flex flex-col items-center transition-transform hover:scale-110"
          >
            <UserIcon className="h-5 w-5" />
            <span className="mt-0.5 text-[10px] text-muted group-hover:text-ink">
              {loggedIn ? "Account" : "Login"}
            </span>
          </Link>
          <CartButton />
        </div>
      </nav>
    </header>
  );
}
