import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TrainerPerformanceClient } from "./TrainerPerformanceClient";

export const metadata = {
  title: "Trainer Performance | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch data
  const { data: trainers } = await supabase.from("trainers").select("id, name, status").order("created_at", { ascending: false });
  const { data: attendanceStats } = await supabase.from("trainer_attendance").select("*");
  // const { data: feedbackStats } = await supabase.from("trainer_feedback").select("*"); // hypothetical table

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8">
        <h1 className="text-2xl font-bold mb-2">Trainer Performance</h1>
        <p className="text-gray-500">Aggregate reports of session deliveries, learner feedback, and completion rates.</p>
      </div>

      <TrainerPerformanceClient 
        attendanceStats={attendanceStats || []}
        feedbackStats={[]}
        trainers={trainers || []}
      />
    </div>
  );
}
