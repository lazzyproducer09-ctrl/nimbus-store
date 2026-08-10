import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Google (and other OAuth) send the user back here with a one-time code.
// We swap that code for a real logged-in session, then send them to their account.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/welcome";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Something went wrong — send them back to login.
  return NextResponse.redirect(`${origin}/login`);
}
