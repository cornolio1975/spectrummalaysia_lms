import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { TrainerReportsClient } from "./TrainerReportsClient";

export const metadata = {
  title: "Trainer Reports | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  // Fetch data
  const { data: trainers, error } = await supabase.from("trainers").select("*").order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {error ? (
        <div className="p-8 text-center text-red-500">{error.message}</div>
      ) : (
        <TrainerReportsClient trainers={trainers || []} />
      )}
    </div>
  );
}
