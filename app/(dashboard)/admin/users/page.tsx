import { createClient } from "@/utils/supabase/server";
import { UserTable } from "./user-table";
import { redirect } from "next/navigation";

export const metadata = {
  title: "User Management | SpectrumMY LMS",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  // Protect route
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const roleFilter = typeof resolvedParams.role === 'string' ? resolvedParams.role : null;

  // Fetch users (profiles)
  let query = supabase
    .from("profiles")
    .select(`
      *,
      nadi_sites ( id, site_name ),
      states ( id, state_name )
    `)
    .order("created_at", { ascending: false });

  if (roleFilter) {
    query = query.eq('role', roleFilter);
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("Failed to load users:", error);
  }

  // Fetch contextual reference data for dropdowns
  const { data: states } = await supabase.from("states").select("id, state_name").order("state_name");
  const { data: nadiSites } = await supabase.from("nadi_sites").select("id, site_name").order("site_name");

  // Dynamic UI Text based on role
  let pageTitle = "User Management";
  let pageDescription = "Manage roles and administrative access for users across the system.";
  
  if (roleFilter === "trainer") {
    pageTitle = "Trainer Profiles";
    pageDescription = "Manage trainer accounts and verify their details.";
  } else if (roleFilter === "admin") {
    pageTitle = "Administrator Profiles";
    pageDescription = "Manage system administrators and their permissions.";
  } else if (roleFilter === "learner") {
    pageTitle = "Learner Profiles";
    pageDescription = "Manage learner accounts across the system.";
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
        <p className="text-[var(--text-muted)]">
          {pageDescription}
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
