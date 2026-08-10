import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyOrders } from "@/lib/orders";
import { inr } from "@/lib/format";
import { UmbrellaMark } from "@/components/icons";

export const metadata: Metadata = { title: "Your orders — NIMBUS" };

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  created: "bg-amber-100 text-amber-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Confirmed",
  created: "Payment pending",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const orders = await getMyOrders();

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Your orders</h1>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-10 text-center">
          <UmbrellaMark className="mx-auto h-12 w-12 text-storm/40" />
          <p className="mt-3 text-sm text-muted">You haven&rsquo;t placed any orders yet.</p>
          <Link href="/shop" className="mt-4 inline-block text-sm font-medium text-storm hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => {
            const statusStyle = STATUS_STYLES[o.status] ?? "bg-mist text-muted";
            const preview = o.items.slice(0, 3);
            const itemCount = o.items.reduce((n, it) => n + it.quantity, 0);
            return (
              <div key={o.id} className="rounded-2xl border border-line bg-white p-5">
                {/* summary row */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3">
                  <div className="text-xs text-muted">
                    <span className="block">Order placed</span>
                    <span className="text-sm text-ink">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-muted">
                    <span className="block">Total</span>
                    <span className="text-sm font-semibold text-ink">{inr(o.total)}</span>
                  </div>
                  <div className="text-xs text-muted">
                    <span className="block">Order ID</span>
                    <span className="font-mono text-sm text-ink">{o.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}>
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>

                {/* items + action */}
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex gap-2">
                    {preview.map((it, i) => (
                      <div
                        key={i}
                        className="flex h-16 w-14 items-center justify-center overflow-hidden rounded-lg border border-line bg-mist text-storm/40"
                      >
                        {it.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                        ) : (
                          <UmbrellaMark className="h-5 w-5" />
                        )}
                      </div>
                    ))}
                    {o.items.length > 3 && (
                      <div className="flex h-16 w-14 items-center justify-center rounded-lg border border-line bg-mist text-xs text-muted">
                        +{o.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-1">{o.items.map((it) => it.name).join(", ")}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {itemCount} item{itemCount === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Link
                    href={`/order/${o.id}`}
                    className="flex h-9 flex-shrink-0 items-center rounded-full border border-ink/15 px-4 text-sm font-medium transition-colors hover:border-ink/40"
                  >
                    View details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
