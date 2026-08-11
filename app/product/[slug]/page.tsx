import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getSimilarProducts } from "@/lib/products";
import { inr } from "@/lib/format";
import { ProductOptions } from "@/components/ProductOptions";
import { ProductCard } from "@/components/ProductCard";
import { ProductGallery } from "@/components/ProductGallery";
import { WishlistButton } from "@/components/WishlistButton";

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

  const similar = await getSimilarProducts(product.category, product.id);

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      {/* breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <span>/</span>
        <Link
          href={`/shop?category=${encodeURIComponent(product.category)}`}
          className="hover:text-ink"
        >
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        {/* ---- gallery ---- */}
        <div>
          <ProductGallery images={product.images} name={product.name} />

          {/* product video, if the admin uploaded one */}
          {product.video_url && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-medium">Product video</p>
              <video
                src={product.video_url}
                controls
                playsInline
                className="w-full rounded-2xl border border-line bg-mist"
              />
            </div>
          )}
        </div>

        {/* ---- info ---- */}
        <div>
          <p className="text-sm font-medium text-storm">{product.category}</p>
          <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-2 text-sm text-muted">
            <span className="text-storm">★</span>
            <span className="text-ink">{product.rating}</span>
            <span>({product.review_count} reviews)</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-semibold">{inr(product.price)}</span>
            {product.compare_at_price && (
              <>
                <span className="text-lg text-muted line-through">
                  {inr(product.compare_at_price)}
                </span>
                <span className="rounded-full bg-storm-tint px-2 py-0.5 text-xs font-medium text-storm">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {savings > 0 && (
            <p className="mt-2 text-sm font-medium text-green-700">
              You save {inr(savings)} on this order 🎉
            </p>
          )}
          <p className="mt-1 text-xs text-muted">Inclusive of all taxes · Free shipping over ₹999</p>

          <p className="mt-4 text-sm">
            {product.stock <= 0 ? (
              <span className="font-medium text-red-600">Currently out of stock</span>
            ) : lowStock ? (
              <span className="font-medium text-red-600">
                🔥 Selling fast — only {product.stock} left in stock
              </span>
            ) : (
              <span className="text-green-700">✓ In stock — ready to ship</span>
            )}
          </p>

          {/* delivery & assurance strip — right where buying decisions happen */}
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-white p-4 text-xs sm:grid-cols-4">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg">🚚</span>
              <span className="font-medium">Delivery in 3–6 days</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg">💵</span>
              <span className="font-medium">Cash on delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg">↩️</span>
              <span className="font-medium">7-day easy returns</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-lg">🔒</span>
              <span className="font-medium">Secure payment</span>
            </div>
          </div>

          {/* size / colour / quantity + add to cart */}
          <ProductOptions product={product} />

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
          <div className="mt-8 grid grid-cols-3 gap-3 border-t border-line pt-6 text-center text-xs text-muted">
            <div>
              <p className="font-medium text-ink">Secure payment</p>
              <p>via Razorpay</p>
            </div>
            <div>
              <p className="font-medium text-ink">7-day returns</p>
              <p>easy &amp; free</p>
            </div>
            <div>
              <p className="font-medium text-ink">Genuine product</p>
              <p>quality assured</p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- product details (long description + stacked detail images) ---- */}
      {(product.description || product.description_images.length > 0) && (
        <section className="mt-16 border-t border-line pt-12">
          <h2 className="text-center font-heading text-2xl font-semibold tracking-tight">
            Product details
          </h2>

          {product.description && (
            <p className="mx-auto mt-5 max-w-2xl text-center leading-relaxed text-muted">
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
                  className="w-full rounded-2xl border border-line"
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ---- similar products ---- */}
      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            You may also like
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
