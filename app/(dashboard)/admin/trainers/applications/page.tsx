import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TrainerApplicationsClient } from "./TrainerApplicationsClient";
import Link from "next/link";

export const metadata = {
  title: "Trainer Applications | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch all trainers to show in the Kanban board
  const { data: applications, error } = await supabase
    .from("trainers")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Applications</h1>
          <p className="text-gray-500">Manage trainer approval workflows</p>
        </div>
        <Link href="/events/trainers/new" className="btn btn-primary">+ Add New</Link>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-white rounded-lg border">
          Error loading applications: {error.message}
        </div>
      ) : (
        <TrainerApplicationsClient applications={applications || []} />
      )}
    </div>
  );
}
