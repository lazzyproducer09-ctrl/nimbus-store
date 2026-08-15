import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Returns & Refunds — OFFBEAT" };

export default function RefundPage() {
  return (
    <PolicyPage title="Returns & Refund Policy">
      <p>
        We want you to love your OFFBEAT finds. If something isn’t right, here’s how
        returns and refunds work.
      </p>

      <h2>Return window</h2>
      <p>
        You can request a return within <strong>7 days</strong> of delivery, provided
        the item is unused, unwashed, and in its original condition with tags and
        packaging intact.
      </p>

      <h2>How to request a return</h2>
      <ul>
        <li>Go to your order and choose <strong>Request cancellation</strong>, or</li>
        <li>
          Email <a href="mailto:support@offbeat.store">support@offbeat.store</a> with your
          order ID and reason.
        </li>
      </ul>

      <h2>Refunds</h2>
      <ul>
        <li>
          Once your return is approved and received, your refund is processed to the
          original payment method within <strong>5–7 business days</strong>.
        </li>
        <li>Shipping charges (if any) are non-refundable.</li>
      </ul>

      <h2>Non-returnable items</h2>
      <p>
        Items marked as final sale, or products damaged due to misuse, are not eligible
        for return.
      </p>

      <h2>Contact</h2>
      <p>
        Need help? Email <a href="mailto:support@offbeat.store">support@offbeat.store</a>.
      </p>
    </PolicyPage>
  );
}
