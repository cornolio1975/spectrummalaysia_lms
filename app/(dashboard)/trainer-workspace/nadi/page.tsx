import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "My NADI Sites",
};

export default async function TrainerNadiPage() {
  const supabase = await createClient();
  
  // Here we would fetch NADI sites assigned to this trainer
  // For the Master prompt structure, this provides the base route.
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My NADI Sites</h1>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No NADI Sites Assigned</h2>
        <p className="text-gray-500 mb-6">
          You have not been assigned to operate or manage any NADI sites yet. 
          Please contact your Programme Manager or Administrator to receive your assignments.
        </p>
      </div>
    </div>
  );
}
