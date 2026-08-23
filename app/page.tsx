// ============================================================================
// YOINK — Homepage. "Dark Luxe Drop". Featured products + categories come
// from Supabase. Header & footer live in app/layout.tsx (shared everywhere).
// ============================================================================
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import {
  YoinkMark,
  TruckIcon,
  ReturnIcon,
  LockIcon,
  RupeeIcon,
} from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";

// The four delivery/payment promises, shown in the strip under the hero and
// again in the closing CTA. One list so the two can never drift apart.
const TRUST_POINTS = [
  { Icon: TruckIcon, title: "Free shipping", sub: "on orders over ₹999" },
  { Icon: ReturnIcon, title: "7-day returns", sub: "no awkward questions" },
  { Icon: LockIcon, title: "Secure payments", sub: "protected by Razorpay" },
  { Icon: RupeeIcon, title: "Cash on delivery", sub: "available across India" },
];

export default async function Home() {
  // Fetch everything the homepage needs AT THE SAME TIME (in parallel).
  const supabase = await createClient();
  const [products, categories, settings, userRes] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getSettings(["hero_image_url", "hero_video_url"]),
    supabase.auth.getUser(),
  ]);
  const heroImage = settings["hero_image_url"];
  const heroVideo = settings["hero_video_url"];
  const user = userRes.data.user;
  const fullName: string =
    user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  const firstName = fullName.trim().split(" ")[0];

  return (
    <div className="flex flex-1 flex-col font-body text-chalk">
      {/* ===================== HERO ===================== */}
      <section className="relative flex min-h-[640px] items-center overflow-hidden md:min-h-[720px]">
        {/* living aurora + cursor spotlight backdrop */}
        <HeroBackdrop />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal">
            {firstName && (
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ash">
                back again, <span className="text-volt">{firstName}</span> — good taste.
              </p>
            )}
            {/* Editorial index label + rule. Replaces the rounded pill with a
                pulsing dot — that badge is on roughly every AI-built landing
                page, and it promises "live" activity the site doesn't have. */}
            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-volt">
                New this week
              </span>
              <span className="h-px flex-1 max-w-24 bg-edge" />
            </div>
            <h1 className="mt-6 font-heading text-[3.4rem] font-extrabold leading-[0.94] tracking-[-0.03em] md:text-[5.4rem]">
              Stuff you didn&rsquo;t
              <br />
              know you <span className="mark">needed</span>.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-ash">
              Weird gadgets, glowing lights and gag-worthy gifts — curated for
              people who scroll right past ordinary. Shipped across India.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-volt px-8 text-sm font-semibold text-void shadow-[0_0_40px_-8px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim active:translate-y-0"
              >
                Shop the drop
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#categories"
                className="inline-flex h-12 items-center justify-center rounded-full border border-edge px-8 text-sm font-medium text-chalk transition-all hover:-translate-y-0.5 hover:border-volt/50 hover:text-volt active:translate-y-0"
              >
                Browse the odd
              </a>
            </div>

            {/*
              Spec strip. This used to show "4.8★ avg. rating" and
              "100% conversation starters" — both invented. Fabricated ratings
              on a live store are a real legal exposure in India, and shoppers
              spot round made-up numbers instantly. These three are things the
              store can actually stand behind.
            */}
            <dl className="mt-11 flex flex-wrap items-stretch gap-x-8 gap-y-5">
              {[
                ["48 hrs", "Order dispatch"],
                ["7 days", "Return window"],
                ["Pan-India", "Delivery network"],
              ].map(([big, small], i) => (
                <div
                  key={small}
                  className={i > 0 ? "border-l border-edge pl-8" : undefined}
                >
                  <dt className="font-heading text-xl font-bold tracking-tight text-chalk">{big}</dt>
                  <dd className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                    {small}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* product spotlight frame */}
          <div className="reveal relative mx-auto w-full max-w-sm">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-volt/12 to-iris/12 blur-2xl" />
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-md">
              {heroVideo ? (
                <video
                  src={heroVideo}
                  className="absolute inset-0 h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt="YOINK hero product"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ash-dim">
                  <YoinkMark className="h-16 w-16 text-volt" />
                  <span className="font-mono text-[11px] uppercase tracking-widest">hero product</span>
                </div>
              )}
              {/* Corner label. Was "✦ 1 of 1" — a claim the store can't back.
                  A dated drop label is honest and creates the same urgency. */}
              <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.22em] text-chalk/70 mix-blend-difference">
                This week&rsquo;s drop
              </span>
            </div>
            {/*
              The tilted "as seen everywhere / the internet's favourite" chip
              that sat here was both invented and a stock template device.
              A quiet caption under the frame does more for a premium read.
            */}
            <p className="mt-4 border-l border-volt/40 pl-3 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-ash">
              Hand-picked, one drop at a time
            </p>
          </div>
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      {/* Each row used to lead with a plain cyan dot. Four identical dots read
          as filler; a real icon per promise carries actual meaning. */}
      <section className="border-y border-edge bg-coal">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 px-5 md:grid-cols-4">
          {TRUST_POINTS.map(({ Icon, title, sub }, i) => (
            <div
              key={title}
              className={`flex items-start gap-3 py-6 md:px-6 ${
                i > 0 ? "md:border-l md:border-edge-soft" : ""
              }`}
            >
              <Icon className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-volt" />
              <div className="text-sm">
                <span className="block font-medium text-chalk">{title}</span>
                <span className="text-ash">{sub}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================== BESTSELLERS ===================== */}
      <section id="shop" className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-volt">The hot drops</p>
            <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Trending oddities
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden font-mono text-xs uppercase tracking-wider text-ash underline-offset-4 hover:text-volt hover:underline md:block"
          >
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-ash">
            No products yet — add a few from the admin panel.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        )}
      </section>

      {/* ===================== STATEMENT MARQUEE ===================== */}
      <section className="overflow-hidden border-y border-edge bg-coal py-5 text-chalk">
        <div className="marquee" style={{ "--marquee-speed": "24s" } as React.CSSProperties}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center whitespace-nowrap font-heading text-xl font-bold uppercase tracking-tight md:text-2xl">
                  Stuff that starts conversations
                  <YoinkMark className="mx-6 h-5 w-5 text-volt" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ===================== CATEGORIES ===================== */}
      <section id="categories" className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-volt">By mood</p>
          <h2 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">
            Pick your flavour of weird
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.name} delay={i * 70}>
              <Link
                href={`/shop?category=${encodeURIComponent(c.name)}`}
                className="group relative flex aspect-[5/4] flex-col justify-end overflow-hidden rounded-2xl border border-edge bg-coal p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-volt/50"
              >
                <span className="pointer-events-none absolute -right-6 -top-8 font-heading text-[6rem] font-black leading-none text-surface transition-colors duration-300 group-hover:text-volt/15">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <YoinkMark className="absolute right-4 top-4 h-6 w-6 text-ash-dim transition-all duration-500 group-hover:rotate-90 group-hover:text-volt" />
                <span className="relative font-heading text-xl font-bold transition-colors group-hover:text-volt">
                  {c.name}
                </span>
                <span className="relative text-xs text-ash">{c.blurb}</span>
                <span className="relative mt-2 font-mono text-[11px] uppercase tracking-wider text-volt opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  Shop now →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===================== HOUSE RULES =====================
          This slot held a five-star quote from "Aarav M. — verified buyer,
          Mumbai". Nobody wrote it. Publishing an invented review with a fake
          name and a "verified" label is exactly what India's consumer-review
          rules prohibit, and it is the first thing a sceptical shopper checks.
          A stated point of view earns the same trust and is entirely ours.
          Swap this back to real quotes once actual customers send them. */}
      <section className="border-y border-edge bg-coal">
        <div className="mx-auto w-full max-w-5xl px-5 py-24">
          <Reveal>
            <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-volt">
                  House rules
                </span>
                <h2 className="mt-4 font-heading text-3xl font-bold leading-tight tracking-tight md:text-4xl">
                  We buy it first.
                  <br />
                  Then you get to.
                </h2>
              </div>
              <ol className="space-y-7">
                {[
                  [
                    "Nothing lands here by algorithm",
                    "Every drop is picked by hand. If it doesn't make someone stop mid-sentence, it doesn't get listed.",
                  ],
                  [
                    "Small drops, on purpose",
                    "We'd rather sell out than stock a warehouse of things nobody remembers.",
                  ],
                  [
                    "You can send it back",
                    "Seven days, no interrogation. Odd things are meant to be a risk — just not your risk.",
                  ],
                ].map(([title, body], i) => (
                  <li key={title} className="flex gap-5 border-t border-edge-soft pt-6 first:border-0 first:pt-0">
                    <span className="font-mono text-xs leading-6 text-volt">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-semibold tracking-tight text-chalk">
                        {title}
                      </h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-ash">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===================== CLOSING CTA ===================== */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-volt/10 blur-[130px]" />
        <div className="relative mx-auto w-full max-w-4xl px-5 py-24 text-center">
          <Reveal>
            <h2 className="font-heading text-4xl font-black tracking-tight md:text-5xl">
              Don&rsquo;t be basic.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-ash">
              Free shipping over ₹999, easy 7-day returns and cash on delivery
              across India. Find the thing everyone will ask you about.
            </p>
            <div className="mt-9 flex justify-center">
              <Link
                href="/shop"
                /* was `h-13` — not a real Tailwind size, so it was silently
                   dropped and this button never matched the hero CTA */
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-volt px-9 text-sm font-semibold text-void shadow-[0_0_40px_-8px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim active:translate-y-0"
              >
                Shop the drop
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            {/* same four promises as the strip up top, driven by one list */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
              {TRUST_POINTS.map(({ Icon, title }) => (
                <span key={title} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-volt" />
                  {title}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
