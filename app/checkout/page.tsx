import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyAddresses } from "@/lib/addresses";
import { CheckoutClient } from "@/components/CheckoutClient";

export const metadata: Metadata = { title: "Checkout — NIMBUS" };

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const addresses = await getMyAddresses();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">Checkout</h1>
      <CheckoutClient userId={user.id} addresses={addresses} />
    </div>
  );
}
