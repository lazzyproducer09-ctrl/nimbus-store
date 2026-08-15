import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account — OFFBEAT" };

export default function SignupPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-muted">
        Join OFFBEAT to check out faster and track your orders.
      </p>

      <div className="mt-8">
        <AuthForm mode="signup" />
      </div>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-storm hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
