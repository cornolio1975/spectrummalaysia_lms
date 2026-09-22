import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getTrainerAuditLogs } from "@/app/actions/trainer_tabs";
import { TrainerAuditClient } from "./TrainerAuditClient";

export const metadata = {
  title: "Trainer Audit Logs | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data, error } = await getTrainerAuditLogs();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {error ? (
        <div className="p-8 text-center text-red-500">{error}</div>
      ) : (
        <TrainerAuditClient logs={data || []} />
      )}
    </div>
  );
}
