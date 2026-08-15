import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Contact us — OFFBEAT" };

export default function ContactPage() {
  return (
    <PolicyPage title="Contact us">
      <p>
        We’re here to help with anything — orders, returns, sizing, or just a question
        about staying dry this monsoon.
      </p>

      <h2>Email</h2>
      <p>
        <a href="mailto:support@offbeat.store">support@offbeat.store</a>
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
        OFFBEAT — offbeat, unexpected things for people who refuse boring.
      </p>
    </PolicyPage>
  );
}
