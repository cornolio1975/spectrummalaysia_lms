import { createClient } from "@/utils/supabase/server";
import { UserTable } from "./user-table";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Management | SpectrumMY LMS",
};

export default async function UsersPage() {
  const supabase = await createClient();

  // Protect route
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch users (profiles)
  const { data: users, error } = await supabase
    .from("profiles")
    .select(`
      *,
      nadi_sites ( id, nadi_name ),
      states ( id, state_name )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load users:", error);
  }

  // Fetch contextual reference data for dropdowns
  const { data: states } = await supabase.from("states").select("id, state_name").order("state_name");
  const { data: nadiSites } = await supabase.from("nadi_sites").select("id, nadi_name").order("nadi_name");

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">User Management</h1>
        <p className="text-[var(--text-muted)]">
          Manage roles and administrative access for users across the system.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-[var(--border)] overflow-hidden">
        <UserTable 
          users={users || []} 
          states={states || []}
          nadiSites={nadiSites || []}
        />
      </div>
    </div>
  );
}
