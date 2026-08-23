import { getSetting } from "./settings";
import type { IconName } from "@/components/icons";

// ---------------------------------------------------------------------------
// Editable storefront copy.
//
// Everything the customer reads on the homepage, the announcement bar and the
// footer lives here instead of being hardcoded in JSX, so it can all be edited
// from Admin → Storefront content without a deploy.
//
// Stored as one JSON blob in site_settings under the key "site_content" — same
// trick as the categories list, so no database migration is needed.
// ---------------------------------------------------------------------------

export type Announcement = { icon: IconName; text: string };
export type TrustPoint = { icon: IconName; title: string; sub: string };
export type Spec = { value: string; label: string };
export type Rule = { title: string; body: string };

export type SiteContent = {
  announcements: Announcement[];
  hero: {
    eyebrow: string;
    line1: string;
    line2: string;
    /** the one word that gets the marker underline */
    accent: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    frameBadge: string;
    frameCaption: string;
  };
  specs: Spec[];
  trust: TrustPoint[];
  bestsellers: { eyebrow: string; title: string };
  marquee: string;
  categories: { eyebrow: string; title: string };
  houseRules: { eyebrow: string; title: string; items: Rule[] };
  closing: { title: string; body: string };
  footerBlurb: string;
};

export const DEFAULT_CONTENT: SiteContent = {
  announcements: [
    { icon: "truck", text: "Free shipping on orders over ₹999" },
    { icon: "return", text: "Easy 7-day returns — no awkward questions" },
    { icon: "rupee", text: "Cash on delivery across India" },
    { icon: "bolt", text: "New drops every week — don't sleep on them" },
  ],
  hero: {
    eyebrow: "New this week",
    line1: "Stuff you didn’t",
    line2: "know you",
    accent: "needed",
    sub: "Weird gadgets, glowing lights and gag-worthy gifts — curated for people who scroll right past ordinary. Shipped across India.",
    ctaPrimary: "Shop the drop",
    ctaSecondary: "Browse the odd",
    frameBadge: "This week’s drop",
    frameCaption: "Hand-picked, one drop at a time",
  },
  specs: [
    { value: "48 hrs", label: "Order dispatch" },
    { value: "7 days", label: "Return window" },
    { value: "Pan-India", label: "Delivery network" },
  ],
  trust: [
    { icon: "truck", title: "Free shipping", sub: "on orders over ₹999" },
    { icon: "return", title: "7-day returns", sub: "no awkward questions" },
    { icon: "lock", title: "Secure payments", sub: "protected by Razorpay" },
    { icon: "rupee", title: "Cash on delivery", sub: "available across India" },
  ],
  bestsellers: { eyebrow: "The hot drops", title: "Trending oddities" },
  marquee: "Stuff that starts conversations",
  categories: { eyebrow: "By mood", title: "Pick your flavour of weird" },
  houseRules: {
    eyebrow: "House rules",
    title: "We buy it first.\nThen you get to.",
    items: [
      {
        title: "Nothing lands here by algorithm",
        body: "Every drop is picked by hand. If it doesn't make someone stop mid-sentence, it doesn't get listed.",
      },
      {
        title: "Small drops, on purpose",
        body: "We'd rather sell out than stock a warehouse of things nobody remembers.",
      },
      {
        title: "You can send it back",
        body: "Seven days, no interrogation. Odd things are meant to be a risk — just not your risk.",
      },
    ],
  },
  closing: {
    title: "Don’t be basic.",
    body: "Free shipping over ₹999, easy 7-day returns and cash on delivery across India. Find the thing everyone will ask you about.",
  },
  footerBlurb:
    "Unexpected, impossibly cool things — for people who refuse boring. Curated & shipped across India.",
};

/**
 * Merge saved content over the defaults, one section at a time.
 *
 * Shallow-merging per section matters: when a new field is added to
 * SiteContent, existing saved JSON won't have it, and a plain `saved ?? default`
 * would blank it out on the live site. This way anything missing falls back.
 */
function merge(saved: Partial<SiteContent> | null): SiteContent {
  if (!saved) return DEFAULT_CONTENT;
  const d = DEFAULT_CONTENT;
  const list = <T,>(v: unknown, fallback: T[]): T[] =>
    Array.isArray(v) && v.length > 0 ? (v as T[]) : fallback;

  return {
    announcements: list(saved.announcements, d.announcements),
    hero: { ...d.hero, ...(saved.hero ?? {}) },
    specs: list(saved.specs, d.specs),
    trust: list(saved.trust, d.trust),
    bestsellers: { ...d.bestsellers, ...(saved.bestsellers ?? {}) },
    marquee: saved.marquee?.trim() || d.marquee,
    categories: { ...d.categories, ...(saved.categories ?? {}) },
    houseRules: {
      ...d.houseRules,
      ...(saved.houseRules ?? {}),
      items: list(saved.houseRules?.items, d.houseRules.items),
    },
    closing: { ...d.closing, ...(saved.closing ?? {}) },
    footerBlurb: saved.footerBlurb?.trim() || d.footerBlurb,
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  const raw = await getSetting("site_content");
  if (!raw) return DEFAULT_CONTENT;
  try {
    return merge(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    // Corrupt JSON must never take the storefront down.
    return DEFAULT_CONTENT;
  }
}
