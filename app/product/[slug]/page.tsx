import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { inr } from "@/lib/format";
import { ProductOptions } from "@/components/ProductOptions";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { WhatsAppProductLink } from "@/components/WhatsAppButton";
import {
  RecordProductView,
  RecentlyViewed,
} from "@/components/RecentlyViewed";
import { getStoreSettings } from "@/lib/store-settings";
import {
  TruckIcon,
  RupeeIcon,
  ReturnIcon,
  LockIcon,
  BoltIcon,
  CheckIcon,
  StarIcon,
} from "@/components/icons";

export const revalidate = 60;

// In Next.js 16, `params` arrives as a Promise, so we await it.
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  // If no product matches this slug, show the built-in 404 page.
  if (!product) notFound();

  const discount = product.compare_at_price
    ? Math.round((1 - product.price / product.compare_at_price) * 100)
    : 0;
  const savings = product.compare_at_price
    ? product.compare_at_price - product.price
    : 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  const [similar, store] = await Promise.all([
    getSimilarProducts(product.category, product.id),
    getStoreSettings(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      {/* remembers the visit + fires ViewContent for retargeting */}
      <RecordProductView
        productId={product.id}
        name={product.name}
        price={product.price}
      />
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-ash">
        <Link href="/" className="hover:text-volt">Home</Link>
        <span className="text-ash-dim">/</span>
        <Link href="/shop" className="hover:text-volt">Shop</Link>
        <span className="text-ash-dim">/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-volt"
        >
          {product.category}
        </Link>
        <span className="text-ash-dim">/</span>
        <span className="text-chalk">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* ---- gallery ---- */}
        <div>
          <ProductGallery images={product.images} name={product.name} />

          {/* product video, if the admin uploaded one */}
          {product.video_url && (
            <div className="mt-4">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ash">Product video</p>
              <video
                src={product.video_url}
                controls
                playsInline
                className="w-full rounded-2xl border border-edge bg-surface"
              />
            </div>
          )}
        </div>

        {/* ---- info ---- */}
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-volt">{product.category}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-chalk md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-ash">
            <StarIcon className="h-4 w-4 text-volt" />
            <span className="text-chalk">{product.rating}</span>
            <span>({product.review_count} reviews)</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-bold text-chalk">{inr(product.price)}</span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-ash-dim line-through">
                  {inr(product.compare_at_price)}
                </span>
                <span className="rounded-full bg-volt-deep px-2 py-0.5 text-xs font-medium text-volt">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-2 text-sm font-medium text-good">
              You save {inr(savings)} — and you get to keep the stares.
            </p>
          )}
          <p className="mt-1 text-xs text-ash">
            Inclusive of all taxes · Free shipping over ₹{store.freeShippingThreshold}
          </p>

          <p className="mt-4 text-sm">
            {product.stock <= 0 ? (
              <span className="font-medium text-bad">Currently out of stock</span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-warn">
                <BoltIcon className="h-4 w-4" />
                Going fast — only {product.stock} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-good">
                <CheckIcon className="h-4 w-4" />
                In stock — ready to ship
              </span>
            )}
          </p>

          {/* Delivery & assurance strip — right where buying decisions happen.
              Emoji (🚚 💵 ↩️ 🔒) replaced with the house icon set. */}
          <div className="mt-5 grid grid-cols-2 divide-edge-soft rounded-2xl border border-edge bg-coal text-xs text-chalk sm:grid-cols-4 sm:divide-x">
            {[
              { Icon: TruckIcon, label: "Delivery in 3–6 days" },
              { Icon: RupeeIcon, label: "Cash on delivery" },
              { Icon: ReturnIcon, label: "7-day easy returns" },
              { Icon: LockIcon, label: "Secure payment" },
            ].map(({ Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 px-2 py-4 text-center">
                <Icon className="h-5 w-5 text-volt" />
                <span className="font-medium leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* size / colour / quantity + add to cart */}
          <ProductOptions product={product} />

          <WhatsAppProductLink
            number={store.whatsappNumber}
            message={store.whatsappMessage}
            productName={product.name}
          />

          <div className="mt-3">
            <WishlistButton
              variant="labeled"
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                compare_at_price: product.compare_at_price,
                image: product.images[0] ?? null,
                rating: product.rating,
                review_count: product.review_count,
              }}
            />
          </div>

          {/* trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-edge pt-6 text-center text-xs text-ash">
            <div>
              <p className="font-medium text-chalk">Secure payment</p>
              <p>via Razorpay</p>
            </div>
            <div>
              <p className="font-medium text-chalk">7-day returns</p>
              <p>easy &amp; free</p>
            </div>
            <div>
              <p className="font-medium text-chalk">Genuine product</p>
              <p>quality assured</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- product details (long description + stacked detail images) ---- */}
      {(product.description || product.description_images.length > 0) && (
        <section className="mt-16 border-t border-edge pt-12">
          <h2 className="text-center font-heading text-2xl font-bold tracking-tight text-chalk">
            The full story
          </h2>

          {product.description && (
            <p className="mx-auto mt-5 max-w-2xl text-center leading-relaxed text-ash">
              {product.description}
            </p>
          )}

          {product.description_images.length > 0 && (
            <div className="mx-auto mt-8 max-w-2xl space-y-4">
              {product.description_images.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`${product.name} detail ${i + 1}`}
                  className="w-full rounded-2xl border border-edge"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Things this browser opened before — a second chance at the item
          someone nearly bought. Renders nothing on a first visit. */}
      <RecentlyViewed excludeId={product.id} />

      {/* ---- similar products ---- */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-chalk">
            More things you didn&rsquo;t know you needed
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
