import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WelcomeForm } from "@/components/WelcomeForm";

export const metadata: Metadata = { title: "Welcome — YOINK" };

export default async function WelcomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in → login. Already onboarded → straight to the shop.
  if (!user) redirect("/login");
  const meta = user.user_metadata ?? {};
  if (meta.onboarded === true) redirect("/");

  // Google gives us the name — pre-fill it so they just confirm.
  const suggestedName: string = meta.full_name || meta.name || "";

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-5 py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        Welcome to YOINK ⚡
      </h1>
      <p className="mt-1 text-sm text-muted">
        One quick thing before you shop — what should we call you?
      </p>
      <WelcomeForm defaultName={suggestedName} />
    </div>
  );
}
