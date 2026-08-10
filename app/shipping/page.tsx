import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Shipping — NIMBUS" };

export default function ShippingPage() {
  return (
    <PolicyPage title="Shipping Policy">
      <p>We ship premium rainwear across India. Here’s what to expect.</p>

      <h2>Where we ship</h2>
      <p>We currently deliver to all serviceable pin codes across India.</p>

      <h2>Charges</h2>
      <ul>
        <li><strong>Free shipping</strong> on all orders above ₹999.</li>
        <li>A flat ₹79 shipping fee applies to orders below ₹999.</li>
        <li>Cash on Delivery is available on eligible orders.</li>
      </ul>

      <h2>Processing &amp; delivery time</h2>
      <ul>
        <li>Orders are usually processed within 1–2 business days.</li>
        <li>Delivery typically takes 3–7 business days depending on your location.</li>
      </ul>

      <h2>Tracking</h2>
      <p>
        You can check your order status anytime under{" "}
        <a href="/orders">Your Orders</a>. We’ll keep the status updated as your order
        is confirmed, shipped and delivered.
      </p>

      <h2>Contact</h2>
      <p>
        Shipping questions? Email{" "}
        <a href="mailto:support@nimbus.store">support@nimbus.store</a>.
      </p>
    </PolicyPage>
  );
}
