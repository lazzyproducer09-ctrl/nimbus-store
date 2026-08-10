import Link from "next/link";
import { getAllOrders } from "@/lib/orders";
import { getAllProducts } from "@/lib/products-admin";
import { getSetting } from "@/lib/settings";
import { inr } from "@/lib/format";
import { HeroImageManager } from "@/components/HeroImageManager";

export default async function AdminDashboard() {
  const [orders, products, heroImage] = await Promise.all([
    getAllOrders(),
    getAllProducts(),
    getSetting("hero_image_url"),
  ]);
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((n, o) => n + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 10);
  const featuredCount = products.filter((p) => p.is_featured).length;

  const stats = [
    { label: "Revenue (paid)", value: inr(revenue), icon: "₹", tint: "bg-green-100 text-green-700" },
    { label: "Paid orders", value: String(paid.length), icon: "✓", tint: "bg-storm-tint text-storm" },
    { label: "Total orders", value: String(orders.length), icon: "🧾", tint: "bg-blue-100 text-blue-700" },
    { label: "Products", value: String(products.length), icon: "🏷️", tint: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      {/* stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${s.tint}`}>
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-muted">{s.label}</p>
                <p className="font-heading text-xl font-semibold">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* homepage hero image */}
      <HeroImageManager currentUrl={heroImage} />

      {/* featured control */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-semibold">Featured on homepage</h2>
            <p className="mt-1 text-xs text-muted">
              {featuredCount} product{featuredCount === 1 ? "" : "s"} marked &ldquo;Featured&rdquo; show in the homepage bestsellers row. Toggle it per product.
            </p>
          </div>
          <Link href="/admin/products" className="flex-shrink-0 text-sm font-medium text-storm hover:underline">
            Manage →
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* low stock */}
        <div className="rounded-2xl border border-line bg-white p-6">
          <h2 className="font-heading text-lg font-semibold">Low stock</h2>
          <p className="text-xs text-muted">Under 10 units</p>
          {lowStock.length === 0 ? (
            <p className="mt-3 text-sm text-muted">All products well stocked. 👍</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between border-b border-line pb-2 last:border-0">
                  <span className="truncate pr-2">{p.name}</span>
                  <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link href="/admin/products" className="mt-4 inline-block text-sm font-medium text-storm hover:underline">
            Manage products →
          </Link>
        </div>

        {/* recent orders */}
        <div className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-storm hover:underline">
              View all
            </Link>
          </div>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No orders yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex items-center justify-between border-b border-line pb-2 last:border-0">
                  <span className="truncate pr-2">
                    {o.address?.full_name}
                    <span className="text-muted">
                      {" · "}
                      {new Date(o.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 whitespace-nowrap">
                    <span className="font-semibold">{inr(o.total)}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        o.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : o.status === "created"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-mist text-muted"
                      }`}
                    >
                      {o.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
