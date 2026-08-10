import Link from "next/link";
import { getProducts, CATEGORIES, type SortOption } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SearchIcon } from "@/components/icons";

export const revalidate = 60;

const SORTS: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low–High" },
  { value: "price-desc", label: "Price: High–Low" },
  { value: "rating", label: "Top rated" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const category = sp.category ?? "";
  const sort = (sp.sort as SortOption) ?? "newest";
  const q = sp.q ?? "";

  const products = await getProducts({
    category: category || undefined,
    sort,
    q: q || undefined,
  });

  // Build a /shop URL, keeping current filters unless overridden.
  function hrefFor(next: { category?: string; sort?: SortOption; q?: string }) {
    const c = next.category ?? category;
    const s = next.sort ?? sort;
    const query = next.q ?? q;
    const params = new URLSearchParams();
    if (c) params.set("category", c);
    if (s && s !== "newest") params.set("sort", s);
    if (query) params.set("q", query);
    const str = params.toString();
    return `/shop${str ? `?${str}` : ""}`;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      {/* heading */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
          {category || "Shop all"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {products.length} product{products.length === 1 ? "" : "s"}
          {q ? ` for “${q}”` : ""}
        </p>
      </div>

      {/* search */}
      <form action="/shop" method="get" className="mb-6">
        {category && <input type="hidden" name="category" value={category} />}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5">
          <SearchIcon className="h-4 w-4 text-muted" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search rainwear…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
          <button type="submit" className="text-sm font-medium text-storm hover:underline">
            Search
          </button>
        </div>
      </form>

      {/* filters + sort */}
      <div className="mb-8 flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-center md:justify-between">
        {/* category chips */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ category: "" })}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              category === ""
                ? "border-storm bg-storm text-white"
                : "border-line hover:border-ink/40"
            }`}
          >
            All
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={hrefFor({ category: c })}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                category === c
                  ? "border-storm bg-storm text-white"
                  : "border-line hover:border-ink/40"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>

        {/* sort links */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted">Sort:</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={hrefFor({ sort: s.value })}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                sort === s.value ? "bg-mist font-medium text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* product grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-muted">No products match your filters.</p>
          <Link href="/shop" className="mt-3 inline-block text-sm font-medium text-storm hover:underline">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
