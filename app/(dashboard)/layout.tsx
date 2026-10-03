import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import DashboardShell from "@/components/layout/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch basic profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, account_status")
    .eq("id", user.id)
    .single();

  // Route protection for guests / pending accounts
  if (profile?.role === "guest" || profile?.account_status === "pending") {
    redirect("/pending");
  }

  return (
    <DashboardShell
      userName={profile?.full_name || user.email?.split("@")[0] || "User"}
      userEmail={user.email || ""}
      userRole={profile?.role || "Administrator"}
    >
      {children}
    </DashboardShell>
  );
}
