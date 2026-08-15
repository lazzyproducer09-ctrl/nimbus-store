import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import { AdminTabs } from "@/components/AdminTabs";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only admins get in. Everyone else is bounced to the homepage.
  if (!isAdmin(user?.email)) redirect("/");

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          YOINK Admin
        </h1>
        <span className="text-xs text-ash">{user?.email}</span>
      </div>
      <AdminTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}
