import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";
import { AccountVerifyBanner } from "@/components/AccountVerifyBanner";
import { AddressManager } from "@/components/AddressManager";
import { getMyAddresses } from "@/lib/addresses";
import { getMyOrders } from "@/lib/orders";
import { inr } from "@/lib/format";

export const metadata: Metadata = { title: "My account — NIMBUS" };

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected page: if not logged in, send to login.
  if (!user) redirect("/login");

  const addresses = await getMyAddresses();
  const orders = await getMyOrders();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">My account</h1>

      <div className="mt-6">
        <AccountVerifyBanner
          email={user.email!}
          verified={user.user_metadata?.otp_verified === true}
        />
      </div>

      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="text-sm text-muted">Signed in as</p>
        <p className="mt-0.5 text-lg font-medium">{user.email}</p>
        <div className="mt-4">
          <LogoutButton />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-lg font-semibold">Saved addresses</h2>
        <p className="mt-1 text-sm text-muted">
          Manage where your orders get delivered.
        </p>
        <div className="mt-4">
          <AddressManager userId={user.id} initialAddresses={addresses} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-lg font-semibold">Order history</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            You haven&rsquo;t placed any orders yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/order/${o.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-line p-4 text-sm transition-colors hover:border-ink/40"
                >
                  <span>
                    <span className="font-medium">{inr(o.total)}</span>
                    <span className="ml-2 text-muted">
                      {o.items.length} item{o.items.length === 1 ? "" : "s"}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                      o.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-mist text-muted"
                    }`}
                  >
                    {o.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
