// Shared inline icons (no external icon library needed).

// YOINK brand mark — a bold four-point spark/asterisk. Off-centre on purpose.
export function YoinkMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2.5c.5 4.2 1.3 5 5.5 5.5-4.2.5-5 1.3-5.5 5.5-.5-4.2-1.3-5-5.5-5.5 4.2-.5 5-1.3 5.5-5.5Z"
        fill="currentColor"
      />
      <path
        d="M17.5 15c.28 2.1.7 2.5 2.8 2.75-2.1.28-2.52.68-2.8 2.75-.28-2.07-.7-2.47-2.8-2.75 2.1-.25 2.52-.65 2.8-2.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

// (UmbrellaMark removed — it was the old NIMBUS rainwear mark, still being used
// as the "no product image" placeholder on orders, wishlist and admin. An
// umbrella next to a gadget order made the store look half-rebranded.
// PackageIcon below is the neutral stand-in now.)

export function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20s-7-4.35-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.65-7 9-7 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M6 7h12l-1 13H7L6 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 7a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Utility / trust icons.
//
// These exist so the storefront never has to fall back on emoji (🚚 💵 🔒 …).
// Emoji render differently on every OS, can't take the brand colour, and are
// the fastest way to make a store look like a template. All of these share the
// same 24×24 box and 1.5 stroke weight as the icons above, so they sit together
// as one family.
// ---------------------------------------------------------------------------

export function TruckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M2 7.5h11v9H2v-9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 11h4l3 3v2.5h-7V11Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16.5" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function RupeeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7 4h10M7 8.5h10M7 4c4.5 0 6.5 1.6 6.5 4.2S11.5 12.6 7 12.6h1.6L16 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReturnIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 9h11a5 5 0 0 1 0 10H9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m8 5-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LockIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="4.5" y="10" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 3.2 19 6v5.4c0 4.2-2.8 7.4-7 9.4-4.2-2-7-5.2-7-9.4V6l7-2.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="m9 12 2.2 2.2L15.4 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m5 12.5 4.5 4.5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BoltIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" fill="currentColor" />
    </svg>
  );
}

export function PackageIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 3 20 7.2v9.6L12 21l-8-4.2V7.2L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M4 7.2 12 11.5l8-4.3M12 11.5V21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

export function AlertIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 4.5 21 19.5H3L12 4.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 10v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function MenuIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 6h16M4 10.7h16M4 15.3h16M4 20h16"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m8 10 4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="m12 3.5 2.6 5.5 6 .8-4.4 4.2 1.1 6L12 17.1 6.7 20l1.1-6L3.4 9.8l6-.8L12 3.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Icon registry.
//
// The admin panel lets you pick an icon for announcement messages and trust
// points. Settings are stored as JSON, so what gets saved is the NAME below —
// this map turns that name back into a component at render time. Add an icon
// here and it immediately shows up in the admin dropdowns.
// ---------------------------------------------------------------------------
export const ICONS = {
  truck: TruckIcon,
  rupee: RupeeIcon,
  return: ReturnIcon,
  lock: LockIcon,
  shield: ShieldIcon,
  check: CheckIcon,
  bolt: BoltIcon,
  package: PackageIcon,
  star: StarIcon,
  spark: YoinkMark,
} as const;

export type IconName = keyof typeof ICONS;

export const ICON_NAMES = Object.keys(ICONS) as IconName[];

// Falls back to the brand spark if a saved name no longer exists.
export function iconByName(name: string) {
  return ICONS[name as IconName] ?? YoinkMark;
}

export function GoogleIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
