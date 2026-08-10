import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Contact us — NIMBUS" };

export default function ContactPage() {
  return (
    <PolicyPage title="Contact us">
      <p>
        We’re here to help with anything — orders, returns, sizing, or just a question
        about staying dry this monsoon.
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:support@nimbus.store">support@nimbus.store</a>
        <br />
        We reply within 24 hours, Monday to Saturday.
      </p>

      <h2>Order help</h2>
      <p>
        For anything about an existing order, check{" "}
        <a href="/orders">Your Orders</a> or email us with your order ID and we’ll sort
        it out quickly.
      </p>

      <h2>Business</h2>
      <p>
        NIMBUS — premium rainwear, designed in India for the Indian monsoon.
      </p>
    </PolicyPage>
  );
}
