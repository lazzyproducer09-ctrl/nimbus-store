import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Terms of Service — YOINK" };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms of Service">
      <p>
        Welcome to YOINK. By using our website and placing an order, you agree to the
        following terms.
      </p>

      <h2>Products &amp; pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (₹) and include applicable taxes.</li>
        <li>
          We try to keep product details, prices and availability accurate, but errors
          may occur. We reserve the right to correct them and to cancel an affected order.
        </li>
      </ul>

      <h2>Orders &amp; payment</h2>
      <ul>
        <li>An order is confirmed only after successful payment via Razorpay.</li>
        <li>We accept UPI, cards, net banking and other methods offered at checkout.</li>
        <li>We may cancel orders in cases of suspected fraud or stock issues.</li>
      </ul>

      <h2>Use of the site</h2>
      <p>
        You agree to provide accurate information and not to misuse the website. The
        YOINK name, logo and content belong to us and may not be copied without
        permission.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by law, YOINK is not liable for indirect or
        consequential losses arising from the use of our products or website.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of India, and any disputes are subject to
        the jurisdiction of the courts in India.
      </p>

      <h2>Contact</h2>
      <p>
        Questions? Email <a href="mailto:support@yoink.store">support@yoink.store</a>.
      </p>
    </PolicyPage>
  );
}
