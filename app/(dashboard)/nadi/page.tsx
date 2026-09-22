import type { Metadata } from "next";
import { getNadiSites, getStates } from "@/app/actions/nadi";
import { NadiClient } from "@/components/dashboard/nadi-client";
import { createClient } from "@/utils/supabase/server";
import { hasPermission } from "@/utils/rbac";

export const metadata: Metadata = { title: "NADI Sites" };

export default async function NADIPage() {
  const [nadiRes, statesRes] = await Promise.all([
    getNadiSites(),
    getStates()
  ]);

  const nadiSites = nadiRes.data || [];
  const states = statesRes.data || [];

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  let canEdit = false;
  if (session) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    canEdit = hasPermission(profile?.role, "admin.nadi.edit");
  }

  return <NadiClient nadiSites={nadiSites} states={states} canEdit={canEdit} />;
}
