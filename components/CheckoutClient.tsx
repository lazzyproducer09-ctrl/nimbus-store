"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import type { Address } from "@/lib/addresses";
import { AddressForm } from "./AddressForm";

// Load the Razorpay checkout script once, on demand.
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutClient({
  userId,
  addresses,
}: {
  userId: string;
  addresses: Address[];
}) {
  const router = useRouter();
  const { selectedItems, selectedSubtotal, removeItems } = useCart();

  const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultAddr?.id);
  const [showAddForm, setShowAddForm] = useState(addresses.length === 0);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When the address list changes (e.g. one was just added), keep a valid selection.
  useEffect(() => {
    if (!addresses.find((a) => a.id === selectedId)) {
      setSelectedId(addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id);
    }
    if (addresses.length > 0) setShowAddForm(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addresses]);

  const shipping = selectedSubtotal >= 999 ? 0 : 79;
  const total = selectedSubtotal + shipping;
  const selectedAddress = addresses.find((a) => a.id === selectedId);

  // Nothing selected to buy → send them back to the cart.
  if (selectedItems.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-line bg-white p-8 text-center">
        <p className="text-sm text-muted">No items selected for checkout.</p>
        <Link href="/cart" className="mt-3 inline-block text-sm font-medium text-storm hover:underline">
          Go to cart
        </Link>
      </div>
    );
  }

  async function pay() {
    if (!selectedAddress) {
      setError("Please select a delivery address.");
      return;
    }
    setPaying(true);
    setError(null);

    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems, address: selectedAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start checkout.");

      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load the payment window.");

      const RazorpayCtor = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
      const rzp = new RazorpayCtor({
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "NIMBUS",
        description: "Rainwear order",
        order_id: data.razorpayOrderId,
        prefill: {
          name: selectedAddress!.full_name,
          contact: selectedAddress!.phone,
        },
        theme: { color: "#2a5a7c" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, orderId: data.orderId }),
          });
          const v = await verifyRes.json();
          if (v.success) {
            // Remove only the items we just paid for; leave the rest in the cart.
            removeItems(selectedItems.map((i) => i.id));
            router.push(`/order/${data.orderId}`);
          } else {
            setError("Payment could not be verified. If money was deducted, it will be refunded.");
            setPaying(false);
          }
        },
        modal: {
          // If they close the payment window without paying, take them to the
          // order page where it shows "Payment pending" + Complete / Cancel.
          ondismiss: () => {
            setPaying(false);
            router.push(`/order/${data.orderId}`);
          },
        },
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setPaying(false);
    }
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
      {/* Address selection */}
      <div>
        <h2 className="font-heading text-lg font-semibold">Delivery address</h2>

        {addresses.length > 0 && (
          <div className="mt-3 space-y-3">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 text-sm transition-colors ${
                  selectedId === a.id ? "border-storm bg-storm-tint" : "border-line hover:border-ink/40"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === a.id}
                  onChange={() => setSelectedId(a.id)}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{a.full_name}</span>
                  {a.is_default && (
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-storm">
                      Default
                    </span>
                  )}
                  <span className="mt-1 block text-muted">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </span>
                  <span className="mt-0.5 block text-muted">Phone: {a.phone}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Add an address inline — no leaving the checkout */}
        {showAddForm ? (
          <div className="mt-3">
            {addresses.length === 0 && (
              <p className="mb-2 text-sm text-muted">
                Add a delivery address to continue.
              </p>
            )}
            <AddressForm
              userId={userId}
              defaultChecked={addresses.length === 0}
              onDone={() => setShowAddForm(false)}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-3 text-sm font-medium text-storm hover:underline"
          >
            + Add another address
          </button>
        )}
      </div>

      {/* Order summary */}
      <aside className="h-fit rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-lg font-semibold">Order summary</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {selectedItems.map((it) => (
            <li key={it.id} className="flex justify-between gap-2">
              <span className="text-muted">
                {it.name}
                {it.size ? ` · ${it.size}` : ""} × {it.quantity}
              </span>
              <span>{inr(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{inr(selectedSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{inr(total)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={pay}
          disabled={paying || !selectedAddress}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-storm text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-storm-dark disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {paying ? "Opening payment…" : !selectedAddress ? "Add an address to pay" : `Pay ${inr(total)}`}
        </button>

        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Secure payment · Razorpay (TEST mode)
        </p>
      </aside>
    </div>
  );
}
