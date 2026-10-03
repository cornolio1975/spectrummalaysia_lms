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
  const statusFilter = typeof resolvedParams.status === 'string' ? resolvedParams.status : null;

  // Fetch users (profiles)
  let query = supabase
    .from("profiles")
    .select(`
      *,
      nadi_sites ( id, site_name ),
      states ( id, state_name )
    `)
    .order("created_at", { ascending: false });

  if (statusFilter === 'pending') {
    query = query.eq('account_status', 'pending');
  } else if (roleFilter) {
    if (roleFilter === "admin") {
      query = query.in('role', ['super_admin', 'programme_admin', 'nadi_admin', 'state_admin']);
    } else {
      query = query.eq('role', roleFilter);
    }
  }

  const { data: users, error } = await query;

  if (error) {
    console.error("Failed to load users:", JSON.stringify(error, null, 2), error);
  }

  // Fetch contextual reference data for dropdowns
  const { data: states } = await supabase.from("states").select("id, state_name").order("state_name");
  const { data: nadiSites } = await supabase.from("nadi_sites").select("id, site_name").order("site_name");

  // Dynamic UI Text based on role
  let pageTitle = "User Management";
  let pageDescription = "Manage roles and administrative access for users across the system.";
  
  if (statusFilter === "pending") {
    pageTitle = "Pending Guests";
    pageDescription = "Review and approve new guest registrations.";
  } else if (roleFilter === "trainer") {
    pageTitle = "Trainer Profiles";
    pageDescription = "Manage trainer accounts and verify their details.";
  } else if (roleFilter === "admin") {
    pageTitle = "Administrator Profiles";
    pageDescription = "Manage system administrators and their permissions.";
  } else if (roleFilter === "learner") {
    pageTitle = "Learner Profiles";
    pageDescription = "Manage learner accounts across the system.";
  } else if (roleFilter === "observer") {
    pageTitle = "Observer Profiles";
    pageDescription = "Manage observer accounts and their monitoring scopes.";
  }

  const currentTab = statusFilter === 'pending' ? 'pending' : (roleFilter || 'all');

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">{pageTitle}</h1>
          <p className="text-[var(--text-muted)]">
            {pageDescription}
          </p>
        </div>
      </div>

      <div className="mb-6 border-b border-[var(--border)] overflow-x-auto">
        <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
          <a
            href="/admin/users"
            className={`${
              currentTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            All Users
          </a>
          <a
            href="/admin/users?status=pending"
            className={`${
              currentTab === 'pending'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors`}
          >
            Pending Guests
            <span className="bg-orange-100 text-orange-700 py-0.5 px-2 rounded-full text-xs">Action Required</span>
          </a>
          <a
            href="/admin/users?role=learner"
            className={`${
              currentTab === 'learner'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Learners
          </a>
          <a
            href="/admin/users?role=trainer"
            className={`${
              currentTab === 'trainer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Trainers
          </a>
          <a
            href="/admin/users?role=observer"
            className={`${
              currentTab === 'observer'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Observers
          </a>
          <a
            href="/admin/users?role=admin"
            className={`${
              currentTab === 'admin'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Administrators
          </a>
        </nav>
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
