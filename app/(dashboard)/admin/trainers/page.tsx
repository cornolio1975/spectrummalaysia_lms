import { createClient } from "@/utils/supabase/server";
import { getAllTrainers } from "@/app/actions/trainers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrainerListTable } from "./trainer-list-table";
import { hasPermission } from "@/utils/rbac";

export const metadata = {
  title: "All Trainers | SpectrumMY LMS",
};

export default async function AdminTrainersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
  const canEditTrainers = hasPermission(profile?.role, "admin.trainers.edit");

  const resolvedParams = await searchParams;
  const statusFilter = typeof resolvedParams.status === 'string' ? resolvedParams.status : 'all';
  
  const { data: trainers, error } = await getAllTrainers(statusFilter);

  const getPageTitle = () => {
    switch (statusFilter) {
      case 'pending': return 'Pending Approval';
      case 'active': return 'Active Trainers';
      case 'suspended':
      case 'inactive': return 'Inactive & Suspended Trainers';
      default: return 'All Trainers';
    }
  };

  const getPageDescription = () => {
    switch (statusFilter) {
      case 'pending': return 'Review and approve new trainer registrations.';
      case 'active': return 'Manage currently active trainers in the system.';
      case 'suspended':
      case 'inactive': return 'View trainers whose accounts are suspended or inactive.';
      default: return 'View and manage all trainers across the system.';
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header">
        <div>
          <h1>{getPageTitle()}</h1>
          <p>{getPageDescription()}</p>
        </div>
        <div className="header-actions">
          {canEditTrainers && (
            <Link href="/events/trainers/new" className="btn btn-primary">
              + Add Trainer
            </Link>
          )}
        </div>
      </div>

      <div className="page-body">
        {error ? (
          <div className="p-8 text-center text-red-500 bg-white rounded-lg border">
            Error loading trainers: {error}
          </div>
        ) : (
          <TrainerListTable trainers={trainers || []} statusFilter={statusFilter} canEdit={canEditTrainers} />
        )}
      </div>
    </div>
  );
}
