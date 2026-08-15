import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/ForgotPasswordForm";

export const metadata: Metadata = { title: "Reset password — YOINK" };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Reset your password
      </h1>
      <p className="mt-1 text-sm text-ash">
        Enter your email and we&rsquo;ll send you a link to set a new password.
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-sm text-ash">
        <Link href="/login" className="font-medium text-volt hover:underline">
          ← Back to login
        </Link>
      </p>
    </div>
  );
}
