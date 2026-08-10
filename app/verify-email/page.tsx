import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifyEmailForm } from "@/components/VerifyEmailForm";

export const metadata: Metadata = { title: "Verify your email — NIMBUS" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/signup");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Verify your email
      </h1>
      <p className="mt-1 text-sm text-muted">
        We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>.
        Enter it below to activate your account.
      </p>
      <div className="mt-8">
        <VerifyEmailForm email={email} />
      </div>
    </div>
  );
}
