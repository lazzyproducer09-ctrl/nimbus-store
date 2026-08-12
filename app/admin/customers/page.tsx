import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { inr } from "@/lib/format";

type CustomerRow = {
  user_id: string;
  email: string | null;
  name: string | null;
  orders_count: number;
  paid_count: number;
  cancelled_count: number;
  returned_count: number;
  pending_count: number;
  total_spent: number;
  payment_attempts: number;
  first_order_at: string | null;
  last_order_at: string | null;
};

const fmt = (t: string | null) =>
  t ? new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_customers");
  const customers = (error ? [] : (data ?? [])) as CustomerRow[];

  return (
    <div>
      <p className="text-sm text-muted">
        {customers.length} customer{customers.length === 1 ? "" : "s"} · everyone who has started
        checkout. Tap a customer to see their full activity.
      </p>

      {customers.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
          No customer activity yet.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {customers.map((c) => (
            <Link
              key={c.user_id}
              href={`/admin/customers/${c.user_id}`}
              className="block rounded-2xl border border-line bg-white p-5 transition-colors hover:border-ink/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.name || "Customer"}</p>
                  <p className="truncate text-xs text-muted">{c.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    First order {fmt(c.first_order_at)} · Last {fmt(c.last_order_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-heading text-lg font-semibold">{inr(c.total_spent)}</p>
                  <p className="text-[11px] text-muted">spent</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-mist px-2.5 py-0.5 font-medium">
                  {c.orders_count} order{c.orders_count === 1 ? "" : "s"}
                </span>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-medium text-green-700">
                  {c.paid_count} paid
                </span>
                {c.pending_count > 0 && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-medium text-amber-700">
                    {c.pending_count} pending
                  </span>
                )}
                {c.cancelled_count > 0 && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-medium text-red-700">
                    {c.cancelled_count} cancel
                  </span>
                )}
                {c.returned_count > 0 && (
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 font-medium text-purple-700">
                    {c.returned_count} return
                  </span>
                )}
                <span className="rounded-full bg-mist px-2.5 py-0.5 font-medium text-muted">
                  {c.payment_attempts} payment {c.payment_attempts === 1 ? "try" : "tries"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
