import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in — NIMBUS" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">Log in to your NIMBUS account.</p>

      <div className="mt-8">
        <AuthForm mode="login" />
      </div>

      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-storm hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
