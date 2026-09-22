import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TrainerProfileClient } from "./trainer-profile-client";

export const metadata = {
  title: "Trainer Profile | SpectrumMY LMS",
};

export default async function TrainerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const trainerId = resolvedParams.id;

  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch Trainer Data
  const { data: trainer, error: trainerError } = await supabase
    .from("trainers")
    .select("*")
    .eq("id", trainerId)
    .single();

  if (trainerError || !trainer) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto text-center">
        <h1 className="text-2xl font-bold text-red-600">Trainer Not Found</h1>
        <p className="text-gray-500 mt-2">The requested trainer profile does not exist.</p>
      </div>
    );
  }

  // Fetch related data
  const { data: credentials } = await supabase.from("trainer_credentials").select("*").eq("trainer_id", trainerId);
  const { data: documents } = await supabase.from("trainer_documents").select("*").eq("trainer_id", trainerId);
  const { data: assignments } = await supabase.from("trainer_course_assignments").select("*, programmes(id, programme_name), courses(id, title)").eq("trainer_id", trainerId);

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <TrainerProfileClient 
        trainer={trainer}
        credentials={credentials || []}
        documents={documents || []}
        assignments={assignments || []}
      />
    </div>
  );
}
