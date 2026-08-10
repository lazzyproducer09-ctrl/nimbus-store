"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/40"
    >
      Log out
    </button>
  );
}
