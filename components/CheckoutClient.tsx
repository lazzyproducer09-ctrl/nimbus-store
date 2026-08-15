"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import { OffbeatMark } from "./icons";
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
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buynow") === "1";
  const { selectedItems, selectedSubtotal, removeItems, buyNowItem, clearBuyNow } = useCart();

  // "Buy now" buys just its one item; otherwise buy the selected cart items.
  const purchaseItems = isBuyNow && buyNowItem ? [buyNowItem] : selectedItems;
  const purchaseSubtotal =
    isBuyNow && buyNowItem ? buyNowItem.price * buyNowItem.quantity : selectedSubtotal;

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

  const shipping = purchaseSubtotal >= 999 ? 0 : 79;
  const total = purchaseSubtotal + shipping;
  const selectedAddress = addresses.find((a) => a.id === selectedId);

  // Nothing to buy → send them back to the cart.
  if (purchaseItems.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-edge bg-coal p-8 text-center">
        <p className="text-sm text-ash">Nothing to check out.</p>
        <Link href="/shop" className="mt-3 inline-block font-mono text-xs uppercase tracking-wider text-volt hover:underline">
          Go shopping →
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
        body: JSON.stringify({ items: purchaseItems, address: selectedAddress }),
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
        name: "OFFBEAT",
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
            // Clear the buy-now slot, or remove just the cart items we paid for.
            if (isBuyNow) clearBuyNow();
            else removeItems(selectedItems.map((i) => i.id));
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
        <h2 className="font-heading text-lg font-bold">Delivery address</h2>

        {addresses.length > 0 && (
          <div className="mt-3 space-y-3">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer gap-3 rounded-xl border p-4 text-sm transition-colors ${
                  selectedId === a.id ? "border-volt bg-volt-deep" : "border-edge hover:border-volt/40"
                }`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedId === a.id}
                  onChange={() => setSelectedId(a.id)}
                  className="mt-1 accent-volt"
                />
                <span>
                  <span className="font-medium text-chalk">{a.full_name}</span>
                  {a.is_default && (
                    <span className="ml-2 rounded-full bg-volt-deep px-2 py-0.5 text-[11px] font-medium text-volt">
                      Default
                    </span>
                  )}
                  <span className="mt-1 block text-ash">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                  </span>
                  <span className="mt-0.5 block text-ash">Phone: {a.phone}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Add an address inline — no leaving the checkout */}
        {showAddForm ? (
          <div className="mt-3">
            {addresses.length === 0 && (
              <p className="mb-2 text-sm text-ash">
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
            className="mt-3 font-mono text-xs uppercase tracking-wider text-volt hover:underline"
          >
            + Add another address
          </button>
        )}
      </div>

      {/* Order summary */}
      <aside className="h-fit rounded-2xl border border-edge bg-coal p-6">
        <h2 className="font-heading text-lg font-bold">Order summary</h2>
        {isBuyNow && (
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-volt">Buy now — this item only</p>
        )}

        <ul className="mt-4 space-y-3">
          {purchaseItems.map((it) => (
            <li key={it.id} className="flex items-center gap-3">
              <div className="flex h-14 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-edge bg-surface text-volt/40">
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <OffbeatMark className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-medium text-chalk">{it.name}</p>
                <p className="text-xs text-ash">
                  {[it.size, it.color].filter(Boolean).join(" · ")}
                  {(it.size || it.color) ? " · " : ""}Qty {it.quantity}
                </p>
              </div>
              <span className="whitespace-nowrap text-sm font-medium text-chalk">
                {inr(it.price * it.quantity)}
              </span>
            </li>
          ))}
        </ul>

        {/* deliver-to recap */}
        {selectedAddress && (
          <div className="mt-4 rounded-xl border border-edge bg-surface/50 p-3 text-xs">
            <p className="font-medium text-chalk">Deliver to</p>
            <p className="mt-0.5 text-ash">
              <span className="text-chalk">{selectedAddress.full_name}</span> — {selectedAddress.line1}
              {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}, {selectedAddress.city},{" "}
              {selectedAddress.state} {selectedAddress.pincode}
            </p>
            <p className="mt-0.5 text-ash">Phone: {selectedAddress.phone}</p>
          </div>
        )}

        <div className="mt-4 space-y-2 border-t border-edge pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ash">Subtotal</span>
            <span className="text-chalk">{inr(purchaseSubtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ash">Shipping</span>
            <span className="text-chalk">{shipping === 0 ? "Free" : inr(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-edge pt-2 text-base font-semibold">
            <span>Total</span>
            <span className="text-chalk">{inr(total)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          onClick={pay}
          disabled={paying || !selectedAddress}
          className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-volt text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0"
        >
          {paying ? "Opening payment…" : !selectedAddress ? "Add an address to pay" : `Pay ${inr(total)}`}
        </button>

        <p className="mt-3 flex items-center justify-center gap-2 text-xs text-ash">
          <span className="h-1.5 w-1.5 rounded-full bg-volt" />
          Secure payment · Razorpay (TEST mode)
        </p>
      </aside>
    </div>
  );
}
