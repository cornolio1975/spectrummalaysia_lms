import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTrainerCredentials } from "@/app/actions/trainer_tabs";
import { TrainerCredentialsClient } from "./TrainerCredentialsClient";

export const metadata = {
  title: "Trainer Credentials | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data, error } = await getTrainerCredentials();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Credentials</h1>
          <p className="text-gray-500">Manage, verify, and track trainer certifications.</p>
        </div>
        <Link href="/events/trainers/new" className="btn btn-primary">+ Add New</Link>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-white rounded-lg shadow-sm border border-red-200">
          {error}
        </div>
      ) : (
        <TrainerCredentialsClient credentials={data || []} />
      )}
    </div>
  );
}
