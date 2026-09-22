import { getTrainerStats } from "@/app/actions/trainers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { TrainerDashboardCharts } from "@/components/admin/trainer-dashboard-charts";

export const metadata = {
  title: "Trainer Dashboard | SpectrumMY LMS",
};

export default async function TrainerDashboardPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: stats, error } = await getTrainerStats();

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading trainer statistics: {error}
      </div>
    );
  }

  const statCards = [
    { label: "Total Trainers", value: stats?.total || 0, href: "/admin/trainers" },
    { label: "Active Trainers", value: stats?.active || 0, href: "/admin/trainers?status=active" },
    { label: "Pending Approval", value: stats?.pending || 0, href: "/admin/trainers?status=pending" },
    { label: "Inactive Trainers", value: stats?.inactive || 0, href: "/admin/trainers?status=inactive" },
    { label: "Suspended Trainers", value: stats?.suspended || 0, href: "/admin/trainers?status=suspended" },
    { label: "Assigned to Courses", value: stats?.assignedToCourses || 0, href: "/admin/trainers/assignments?type=course" },
    { label: "Assigned to NADI Sites", value: stats?.assignedToNadi || 0, href: "/admin/trainers/assignments?type=nadi" },
    { label: "Expiring Credentials", value: stats?.expiringCredentials || 0, href: "/admin/trainers/credentials?status=expiring" },
  ];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Dashboard</h1>
          <p className="text-[var(--text-muted)]">
            Overview of trainer statistics and statuses.
          </p>
        </div>
        <div>
          <Link href="/admin/trainers/applications" className="btn btn-primary">
            Review Applications
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link key={card.label} href={card.href} className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer h-full">
              <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">{card.label}</h3>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          </Link>
        ))}
      </div>
      
      <TrainerDashboardCharts stats={stats} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center mt-12">
        <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <Link href="/events/trainers/new" className="btn btn-outline">
            + Register New Trainer
          </Link>
          <Link href="/admin/users?role=trainer" className="btn btn-outline">
            Manage Trainer Logins
          </Link>
          <Link href="/events/trainers/assignments" className="btn btn-outline">
            Trainer Assignments
          </Link>
        </div>
      </div>
    </div>
  );
}
