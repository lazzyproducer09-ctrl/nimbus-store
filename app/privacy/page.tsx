import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy — NIMBUS" };

export default function PrivacyPolicy() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        At NIMBUS, we respect your privacy. This policy explains what information we
        collect, why we collect it, and how we keep it safe.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Your name, email address and phone number when you create an account.</li>
        <li>Delivery addresses you save for shipping your orders.</li>
        <li>Order details — the products you buy and their status.</li>
      </ul>
      <p>
        We do <strong>not</strong> store your card, UPI or bank details. All payments
        are handled securely by Razorpay, our payment partner.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To process and deliver your orders.</li>
        <li>To let you log in and view your order history.</li>
        <li>To contact you about your orders and provide support.</li>
      </ul>

      <h2>Data storage &amp; security</h2>
      <p>
        Your data is stored securely with our infrastructure provider (Supabase) on
        servers located in India. Access is protected so that you can only ever see
        and change your own information.
      </p>

      <h2>Your rights</h2>
      <p>
        You can view and update your saved details anytime from your account. To
        request deletion of your account or data, contact us at{" "}
        <a href="mailto:support@nimbus.store">support@nimbus.store</a>.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your privacy? Email{" "}
        <a href="mailto:support@nimbus.store">support@nimbus.store</a>.
      </p>
    </PolicyPage>
  );
}
