import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTrainerDocuments } from "@/app/actions/trainer_tabs";
import { TrainerDocumentsClient } from "./TrainerDocumentsClient";

export const metadata = {
  title: "Trainer Documents | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data, error } = await getTrainerDocuments();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">Trainer Documents</h1>
          <p className="text-gray-500">Securely verify and manage trainer identification and CVs.</p>
        </div>
        <Link href="/events/trainers/new" className="btn btn-primary">+ Upload Document</Link>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-white rounded-lg shadow-sm border border-red-200">
          {error}
        </div>
      ) : (
        <TrainerDocumentsClient documents={data || []} />
      )}
    </div>
  );
}
