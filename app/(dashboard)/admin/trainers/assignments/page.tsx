import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTrainerCourseAssignments, getTrainerNadiAssignments, getTrainers } from "@/app/actions/trainers";
import { TrainerAssignmentsClient } from "@/components/admin/trainer-assignments-client";

export const metadata = {
  title: "Trainer Assignments | SpectrumMY LMS",
};

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const [
    { data: trainers },
    { data: nadiSites },
    { data: states },
    { data: programmes },
    { data: courses },
    { data: nadiAssignments },
    { data: courseAssignments }
  ] = await Promise.all([
    getTrainers(),
    supabase.from("nadi_sites").select("id, site_name").order("site_name"),
    supabase.from("states").select("id, state_name").order("state_name"),
    supabase.from("programmes").select("id, programme_name").order("programme_name"),
    supabase.from("courses").select("id, title").order("title"),
    getTrainerNadiAssignments(),
    getTrainerCourseAssignments()
  ]);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Assignments</h1>
          <p className="text-gray-500">Manage NADI Site and Course assignments for trainers.</p>
        </div>
      </div>
      <div className="page-body">
        <TrainerAssignmentsClient 
          trainers={trainers}
          nadiSites={nadiSites}
          states={states}
          programmes={programmes}
          courses={courses}
          nadiAssignments={nadiAssignments}
          courseAssignments={courseAssignments}
        />
      </div>
    </div>
  );
}
