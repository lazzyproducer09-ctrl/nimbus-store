import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrdersByUser, ORDER_STATUS_LABEL, type Order } from "@/lib/orders";
import { inr } from "@/lib/format";

type Address = {
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};
type Profile = {
  email: string | null;
  name: string | null;
  joined_at: string | null;
  addresses: Address[];
};

const fmt = (t: string | null) =>
  t
    ? new Date(t).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// Build a time-sorted list of everything that happened to an order.
function eventsFor(o: Order): { at: string; label: string }[] {
  const ev: { at: string | null; label: string }[] = [
    { at: o.created_at, label: "Started checkout" },
    { at: o.paid_at, label: "Payment successful" },
    { at: o.cancel_requested_at, label: "Requested cancellation" },
    { at: o.cancelled_at, label: "Order cancelled" },
    { at: o.return_requested_at, label: `Requested return${o.return_reason ? ` — “${o.return_reason}”` : ""}` },
    { at: o.return_approved_at, label: "Return approved" },
    { at: o.returned_at, label: "Item received — return complete" },
    { at: o.rejected_at, label: `Request declined${o.reject_reason ? ` — “${o.reject_reason}”` : ""}` },
    { at: o.refunded_at, label: `Refund completed${o.refund_reference ? ` — Ref: ${o.refund_reference}` : ""}` },
  ];
  return ev
    .filter((e): e is { at: string; label: string } => !!e.at)
    .sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: profileData }, orders, { data: cartRow }] = await Promise.all([
    supabase.rpc("admin_customer_profile", { uid: id }),
    getOrdersByUser(id),
    supabase.from("user_carts").select("items, updated_at").eq("user_id", id).maybeSingle(),
  ]);
  const profile = profileData as Profile | null;
  if (!profile && orders.length === 0) notFound();

  type CartLine = { name: string; price: number; quantity: number; size: string | null; color: string | null; image: string | null };
  const cart = ((cartRow?.items ?? []) as CartLine[]).filter((c) => c && c.name);
  const cartTotal = cart.reduce((n, c) => n + c.price * c.quantity, 0);
  const cartCount = cart.reduce((n, c) => n + c.quantity, 0);

  const paid = orders.filter((o) => ["paid", "shipped", "delivered"].includes(o.status));
  const totalSpent = paid.reduce((n, o) => n + o.total, 0);
  const attempts = orders.reduce((n, o) => n + (o.payment_attempts ?? 0), 0);
  const phone = orders.find((o) => o.address?.phone)?.address?.phone ?? profile?.addresses?.[0]?.phone;

  return (
    <div>
      <Link href="/admin/customers" className="text-sm font-medium text-volt hover:underline">
        ← All customers
      </Link>

      {/* profile card */}
      <div className="mt-4 rounded-2xl border border-edge bg-coal p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold">{profile?.name || "Customer"}</h2>
            <p className="mt-0.5 text-sm text-ash">{profile?.email}</p>
            {phone && <p className="text-sm text-ash">📞 {phone}</p>}
            {profile?.joined_at && (
              <p className="mt-1 text-xs text-ash">Joined {fmt(profile.joined_at)}</p>
            )}
          </div>
          <div className="flex gap-5 text-center">
            <div>
              <p className="font-heading text-lg font-semibold">{inr(totalSpent)}</p>
              <p className="text-[11px] text-ash">spent</p>
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">{paid.length}</p>
              <p className="text-[11px] text-ash">paid orders</p>
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">{attempts}</p>
              <p className="text-[11px] text-ash">payment tries</p>
            </div>
          </div>
        </div>

        {/* saved addresses */}
        {profile?.addresses && profile.addresses.length > 0 && (
          <div className="mt-5 border-t border-edge pt-4">
            <p className="text-xs font-medium text-ash">Saved addresses</p>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              {profile.addresses.map((a, i) => (
                <div key={i} className="rounded-xl border border-edge p-3 text-sm">
                  <p className="font-medium">
                    {a.full_name}
                    {a.is_default && (
                      <span className="ml-2 rounded-full bg-volt-deep px-2 py-0.5 text-[10px] font-medium text-volt">
                        Default
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-ash">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </p>
                  <p className="text-xs text-ash">📞 {a.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* live cart */}
      <div className="mt-6 rounded-2xl border border-edge bg-coal p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg font-semibold">Current cart</h3>
          {cartRow?.updated_at && (
            <span className="text-[11px] text-ash">updated {fmt(cartRow.updated_at)}</span>
          )}
        </div>
        {cart.length === 0 ? (
          <p className="mt-2 text-sm text-ash">Their cart is empty right now.</p>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-edge">
              {cart.map((c, i) => (
                <li key={i} className="flex items-center gap-3 py-2.5">
                  <div className="flex h-11 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-edge bg-surface text-volt/40">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs">🛍</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium">{c.name}</p>
                    {(c.size || c.color) && (
                      <p className="text-xs text-ash">{[c.size, c.color].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                  <span className="whitespace-nowrap text-sm text-ash">
                    {inr(c.price)} × {c.quantity}
                  </span>
                  <span className="w-20 whitespace-nowrap text-right text-sm font-medium">
                    {inr(c.price * c.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t border-edge pt-3 text-sm font-semibold">
              <span>{cartCount} item{cartCount === 1 ? "" : "s"} in cart</span>
              <span>{inr(cartTotal)}</span>
            </div>
          </>
        )}
        <p className="mt-3 text-[11px] text-ash">
          This is the cart saved to the customer&rsquo;s account (updated live while they shop when
          logged in). Guests who aren&rsquo;t signed in keep their cart only in their own browser.
        </p>
      </div>

      {/* activity / order history */}
      <h3 className="mt-6 font-heading text-lg font-semibold">Activity</h3>
      {orders.length === 0 ? (
        <p className="mt-2 text-sm text-ash">No orders yet.</p>
      ) : (
        <div className="mt-3 space-y-4">
          {orders.map((o) => {
            const events = eventsFor(o);
            const itemCount = o.items.reduce((n, it) => n + it.quantity, 0);
            return (
              <div key={o.id} className="rounded-2xl border border-edge bg-coal p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-chalk">#{o.id.slice(0, 8).toUpperCase()}</span>
                    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] font-medium">
                      {ORDER_STATUS_LABEL[o.status] ?? o.status}
                    </span>
                    {o.payment_attempts > 0 && (
                      <span className="text-[11px] text-ash">
                        {o.payment_attempts} payment {o.payment_attempts === 1 ? "try" : "tries"}
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">{inr(o.total)}</span>
                </div>

                <p className="mt-1 text-xs text-ash">
                  {o.items.map((it) => `${it.name} ×${it.quantity}`).join(", ")} · {itemCount} item
                  {itemCount === 1 ? "" : "s"}
                </p>

                {/* event timeline */}
                <ol className="mt-3 space-y-1.5 border-l border-edge pl-4">
                  {events.map((e, i) => (
                    <li key={i} className="relative text-xs">
                      <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-volt" />
                      <span className="text-chalk">{e.label}</span>
                      <span className="ml-2 text-ash">{fmt(e.at)}</span>
                    </li>
                  ))}
                </ol>

                <Link
                  href={`/order/${o.id}`}
                  className="mt-3 inline-block text-xs font-medium text-volt hover:underline"
                >
                  View order →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
