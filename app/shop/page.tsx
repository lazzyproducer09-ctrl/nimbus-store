import Link from "next/link";
import { getProducts, type SortOption } from "@/lib/products";
import { getCategories } from "@/lib/categories";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
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

  const [products, categories] = await Promise.all([
    getProducts({ category: category || undefined, sort, q: q || undefined }),
    getCategories(),
  ]);

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
    <div className="mx-auto w-full max-w-6xl px-5 py-12">
      {/* heading */}
      <div className="mb-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-volt">
          {category ? "Category" : "Everything weird"}
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight md:text-4xl">
          {category || "Shop all"}
        </h1>
        <p className="mt-1 text-sm text-ash">
          {products.length} thing{products.length === 1 ? "" : "s"} you won&rsquo;t find everywhere
          {q ? ` · “${q}”` : ""}
        </p>
      </div>

      {/* search */}
      <form action="/shop" method="get" className="mb-6">
        {category && <input type="hidden" name="category" value={category} />}
        {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
        <div className="flex items-center gap-2 rounded-full border border-edge bg-surface px-4 py-2.5 transition-colors focus-within:border-volt/50">
          <SearchIcon className="h-4 w-4 text-ash" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search the weird…"
            className="w-full bg-transparent text-sm text-chalk outline-none placeholder:text-ash-dim"
          />
          <button type="submit" className="font-mono text-xs uppercase tracking-wider text-volt hover:underline">
            Search
          </button>
        </div>
      </form>

      {/* filters + sort */}
      <div className="mb-8 flex flex-col gap-4 border-b border-edge pb-5 md:flex-row md:items-center md:justify-between">
        {/* category chips */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ category: "" })}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              category === ""
                ? "border-volt bg-volt text-void font-medium"
                : "border-edge text-ash hover:border-volt/50 hover:text-chalk"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.name}
              href={hrefFor({ category: c.name })}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                category === c.name
                  ? "border-volt bg-volt text-void font-medium"
                  : "border-edge text-ash hover:border-volt/50 hover:text-chalk"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* sort links */}
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-mono text-xs uppercase tracking-wider text-ash-dim">Sort:</span>
          {SORTS.map((s) => (
            <Link
              key={s.value}
              href={hrefFor({ sort: s.value })}
              className={`rounded-full px-2.5 py-1 transition-colors ${
                sort === s.value ? "bg-surface font-medium text-chalk" : "text-ash hover:text-chalk"
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
          <p className="text-sm text-ash">Nothing here (yet). Try clearing the filters.</p>
          <Link href="/shop" className="mt-3 inline-block font-mono text-xs uppercase tracking-wider text-volt hover:underline">
            Clear filters →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
