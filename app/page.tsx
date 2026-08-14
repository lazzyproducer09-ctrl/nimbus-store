// ============================================================================
// OFFBEAT — Homepage. "Dark Luxe Drop". Featured products + categories come
// from Supabase. Header & footer live in app/layout.tsx (shared everywhere).
// ============================================================================
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { OffbeatMark } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";

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
        {/* electric glow + grid backdrop */}
        <div className="pointer-events-none absolute left-1/2 top-[-14%] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-volt/12 blur-[150px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--color-chalk) 1px, transparent 1px), linear-gradient(90deg, var(--color-chalk) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(100% 70% at 50% 0%, #000 40%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 py-24 md:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal">
            {firstName && (
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-ash">
                back again, <span className="text-volt">{firstName}</span> — good taste.
              </p>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-edge bg-surface/60 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-ash backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-volt" />
              New this week
            </span>
            <h1 className="mt-6 font-heading text-[3.4rem] font-black leading-[0.94] tracking-[-0.02em] md:text-[5.4rem]">
              Stuff you didn&rsquo;t
              <br />
              know you{" "}
              <span className="relative whitespace-nowrap italic font-semibold text-volt">
                needed
                <span className="absolute -bottom-1.5 left-0 h-px w-full bg-volt/50" />
              </span>
              .
            </h1>
            <p className="mt-7 max-w-md text-lg leading-8 text-ash">
              Offbeat gadgets, weird lights and gag-worthy gifts — curated for
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

            {/* mini stat row */}
            <div className="mt-11 flex flex-wrap gap-x-9 gap-y-4">
              {[
                ["4.8★", "avg. rating"],
                ["48hr", "dispatch"],
                ["100%", "conversation starters"],
              ].map(([big, small]) => (
                <div key={small}>
                  <p className="font-heading text-2xl font-bold">{big}</p>
                  <p className="font-mono text-[11px] uppercase tracking-wider text-ash">{small}</p>
                </div>
              ))}
            </div>
          </div>

          {/* product spotlight frame */}
          <div className="reveal relative mx-auto w-full max-w-sm">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-volt/8 blur-2xl" />
            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-edge bg-coal shadow-2xl">
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
                  alt="OFFBEAT hero product"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-ash-dim">
                  <OffbeatMark className="h-16 w-16 text-volt" />
                  <span className="font-mono text-[11px] uppercase tracking-widest">hero product</span>
                </div>
              )}
              {/* corner badge */}
              <span className="absolute left-4 top-4 rounded-full bg-void/70 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-volt backdrop-blur-sm">
                ✦ 1 of 1
              </span>
            </div>
            {/* floating chip */}
            <div className="absolute -bottom-4 -left-4 rotate-[-4deg] rounded-xl border border-edge bg-surface px-4 py-2 shadow-xl">
              <p className="font-mono text-[10px] uppercase tracking-wider text-ash">as seen everywhere</p>
              <p className="font-heading text-sm font-bold text-chalk">the internet&rsquo;s favourite</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TRUST STRIP ===================== */}
      <section className="border-y border-edge bg-coal">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-6 px-5 py-6 md:grid-cols-4">
          {[
            ["Free shipping", "on orders over ₹999"],
            ["7-day returns", "no awkward questions"],
            ["Secure payments", "protected by Razorpay"],
            ["Cash on delivery", "available across India"],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-volt" />
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
      <section className="overflow-hidden border-y border-volt/30 bg-volt py-4 text-void">
        <div className="marquee" style={{ "--marquee-speed": "24s" } as React.CSSProperties}>
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center whitespace-nowrap font-heading text-xl font-black uppercase tracking-tight md:text-2xl">
                  Stuff that starts conversations
                  <OffbeatMark className="mx-6 h-5 w-5" />
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
                <OffbeatMark className="absolute right-4 top-4 h-6 w-6 text-ash-dim transition-all duration-500 group-hover:rotate-90 group-hover:text-volt" />
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

      {/* ===================== REVIEW QUOTE ===================== */}
      <section className="border-y border-edge bg-coal">
        <div className="mx-auto w-full max-w-3xl px-5 py-24 text-center">
          <Reveal>
            <div className="mb-4 font-mono text-volt">★★★★★</div>
            <blockquote className="font-heading text-2xl font-bold leading-relaxed tracking-tight md:text-3xl">
              &ldquo;Bought it as a joke. Now three of my friends have ordered
              one too. Everyone who walks in asks about it.&rdquo;
            </blockquote>
            <p className="mt-6 font-mono text-xs uppercase tracking-wider text-ash">
              Aarav M. — verified buyer, Mumbai
            </p>
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
                className="group inline-flex h-13 items-center justify-center gap-2 rounded-full bg-volt px-9 py-3.5 text-sm font-semibold text-void shadow-[0_0_40px_-8px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim active:translate-y-0"
              >
                Shop the drop
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-wider text-ash">
              <span>🚚 Free shipping over ₹999</span>
              <span>↩️ 7-day returns</span>
              <span>🔒 Secure payments</span>
              <span>💵 Cash on delivery</span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
