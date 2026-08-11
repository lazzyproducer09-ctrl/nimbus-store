// ============================================================================
// NIMBUS — Homepage. Featured products come from the Supabase database.
// Header & footer live in app/layout.tsx (shared across all pages).
// ============================================================================
import Link from "next/link";
import { getFeaturedProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { UmbrellaMark } from "@/components/icons";
import { createClient } from "@/lib/supabase/server";
import { getSettings } from "@/lib/settings";

const CATEGORY_TILES = [
  { name: "Raincoats", blurb: "Stay dry, in style" },
  { name: "Umbrellas", blurb: "Windproof & compact" },
  { name: "Rain Boots", blurb: "Dry feet, always" },
  { name: "Accessories", blurb: "The finishing touch" },
];

export default async function Home() {
  // Fetch everything the homepage needs AT THE SAME TIME (in parallel) instead
  // of one-after-another — this cuts the server response time noticeably.
  const supabase = await createClient();
  const [products, settings, userRes] = await Promise.all([
    getFeaturedProducts(),
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
    <div className="flex flex-1 flex-col font-body text-ink">
      {/* ================= HERO (dark, cinematic, subtle rain) ================= */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden bg-ink text-paper md:min-h-[680px]">
        {/* falling rain — hero only */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          {Array.from({ length: 60 }).map((_, i) => {
            const left = (i * 53) % 100;
            const height = 36 + ((i * 13) % 46);
            const opacity = 0.1 + ((i * 3) % 5) * 0.045;
            const duration = 0.9 + ((i * 7) % 12) * 0.11;
            const delay = (i % 12) * 0.35;
            return (
              <span
                key={i}
                className="rain-drop"
                style={{
                  left: `${left}%`,
                  height: `${height}px`,
                  opacity,
                  animationDuration: `${duration}s`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>

        {/* soft storm glow + vignette for depth */}
        <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[460px] w-[680px] -translate-x-1/2 rounded-full bg-storm/25 blur-[130px]" />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, transparent 45%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-24 md:grid-cols-2">
          <div className="reveal">
            {firstName && (
              <p className="mb-3 font-heading text-lg font-medium text-paper/90">
                Welcome back, <span className="text-storm-light">{firstName}</span> 👋
              </p>
            )}
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-paper/70 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-storm" />
              Built for the Indian monsoon
            </span>
            <h1 className="mt-5 font-heading text-5xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              Stay dry.
              <br />
              Look effortless.
            </h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-paper/70">
              Thoughtfully designed rainwear — raincoats, umbrellas and
              essentials that are as refined as they are dependable.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-medium text-ink shadow-lg transition-all hover:-translate-y-0.5 hover:bg-paper active:translate-y-0"
              >
                Shop the collection
              </Link>
              <a
                href="#categories"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-7 text-sm font-medium text-paper transition-all hover:-translate-y-0.5 hover:border-white/60 active:translate-y-0"
              >
                Explore categories
              </a>
            </div>
          </div>

          {/* floating product frame */}
          <div className="reveal group relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-sm md:aspect-square">
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
                alt="NIMBUS rainwear"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-paper/50">
                <UmbrellaMark className="h-14 w-14 text-storm" />
                <span className="text-xs tracking-wide">hero product photo</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px px-5 py-6 text-sm md:grid-cols-4">
          {[
            ["Free shipping", "on orders over ₹999"],
            ["7-day returns", "easy & hassle-free"],
            ["Secure payments", "protected by Razorpay"],
            ["Cash on delivery", "available across India"],
          ].map(([title, sub]) => (
            <div key={title} className="flex flex-col px-2">
              <span className="font-medium">{title}</span>
              <span className="text-muted">{sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= BESTSELLERS ================= */}
      <section id="shop" className="mx-auto w-full max-w-6xl px-5 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-storm">BESTSELLERS</p>
            <h2 className="mt-1 font-heading text-3xl font-semibold tracking-tight">
              Loved this monsoon
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden text-sm text-muted underline-offset-4 hover:text-ink hover:underline md:block"
          >
            View all
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted">
            No products found yet — check the database connection.
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

      {/* ================= CATEGORIES ================= */}
      <section id="categories" className="border-y border-line bg-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-20">
          <h2 className="mb-10 font-heading text-3xl font-semibold tracking-tight">
            Shop by category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {CATEGORY_TILES.map((c, i) => (
              <Reveal key={c.name} delay={i * 80}>
                <Link
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-mist to-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-storm/30 hover:shadow-xl"
                >
                  <UmbrellaMark className="absolute right-4 top-4 h-8 w-8 text-storm/30 transition-all duration-500 group-hover:rotate-12 group-hover:scale-125 group-hover:text-storm/50" />
                  <span className="font-heading text-lg font-semibold transition-colors group-hover:text-storm">
                    {c.name}
                  </span>
                  <span className="text-xs text-muted">{c.blurb}</span>
                  <span className="mt-2 text-xs font-medium text-storm opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Shop now →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= REVIEW / TRUST QUOTE ================= */}
      <section className="mx-auto w-full max-w-3xl px-5 py-24 text-center">
        <Reveal>
          <div className="mb-4 text-storm">★★★★★</div>
          <blockquote className="font-heading text-2xl font-medium leading-relaxed tracking-tight md:text-3xl">
            &ldquo;Survived three days of Mumbai rain and I stayed completely dry.
            Feels premium, looks even better.&rdquo;
          </blockquote>
          <p className="mt-5 text-sm text-muted">Aarav M. — Verified buyer, Mumbai</p>
        </Reveal>
      </section>

      {/* ================= CLOSING CTA / GUARANTEE ================= */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-storm/20 blur-[120px]" />
        <div className="relative mx-auto w-full max-w-4xl px-5 py-20 text-center">
          <Reveal>
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Don&rsquo;t let the rain slow you down.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-paper/70">
              Free shipping over ₹999, easy 7-day returns, and cash on delivery
              across India. Gear up before the next downpour.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-medium text-ink shadow-lg transition-all hover:-translate-y-0.5 hover:bg-paper active:translate-y-0"
              >
                Shop the collection
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-paper/60">
              <span>🚚 Free shipping over ₹999</span>
              <span>↩️ 7-day easy returns</span>
              <span>🔒 Secure Razorpay payments</span>
              <span>💵 Cash on delivery</span>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
