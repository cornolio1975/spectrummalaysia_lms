import { createClient } from "@/utils/supabase/server";
import { getTrainerApplications } from "@/app/actions/trainers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrainerListTable } from "../trainer-list-table";

export const metadata = {
  title: "Trainer Applications | SpectrumMY LMS",
};

export default async function TrainerApplicationsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: trainers, error } = await getTrainerApplications();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header">
        <div>
          <h1>Trainer Applications</h1>
          <p>Review and approve new trainer registrations.</p>
        </div>
        <div className="header-actions">
          <Link href="/events/trainers/new" className="btn btn-primary">
            + Add Trainer
          </Link>
        </div>
      </div>

      <div className="page-body">
        {error ? (
          <div className="p-8 text-center text-red-500 bg-white rounded-lg border">
            Error loading applications: {error}
          </div>
        ) : (
          <TrainerListTable trainers={trainers || []} statusFilter="pending" />
        )}
      </div>
    </div>
  );
}
