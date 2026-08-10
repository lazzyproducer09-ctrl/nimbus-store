import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/products";
import { inr } from "@/lib/format";
import { UmbrellaMark } from "@/components/icons";
import { ProductOptions } from "@/components/ProductOptions";

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
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-mist">
            {product.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.images[0]}
                alt={product.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-storm/50">
                <UmbrellaMark className="h-20 w-20" />
                <span className="text-xs text-muted">product photo</span>
              </div>
            )}
          </div>
          {/* thumbnail row (placeholders until real photos are uploaded) */}
          <div className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-xl border border-line bg-mist text-storm/30"
              >
                <UmbrellaMark className="h-6 w-6" />
              </div>
            ))}
          </div>
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

          {product.description && (
            <p className="mt-5 leading-relaxed text-muted">{product.description}</p>
          )}

          <p className="mt-4 text-sm">
            {product.stock > 0 ? (
              <span className="text-green-700">In stock — ready to ship</span>
            ) : (
              <span className="text-red-600">Currently out of stock</span>
            )}
          </p>

          {/* size / colour / quantity + add to cart */}
          <ProductOptions product={product} />

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
    </div>
  );
}
