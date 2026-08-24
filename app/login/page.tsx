import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in — YOINK" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-ash">Log in to your YOINK account.</p>

      <div className="mt-8">
        <AuthForm />
      </div>

      <p className="mt-6 text-sm text-ash">
        New here?{" "}
        <Link href="/signup" className="font-medium text-volt hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
