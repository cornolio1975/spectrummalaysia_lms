import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "My NADI Site",
};

export default async function LearnerNadiPage() {
  const supabase = await createClient();
  
  // Here we would fetch NADI site assigned to this learner
  // For the Master prompt structure, this provides the base route.
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My NADI Site</h1>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">No NADI Site Registered</h2>
        <p className="text-gray-500 mb-6">
          You are not currently registered to a specific NADI site. 
          Please contact your administrator if this is an error, or update your profile to link to a NADI location.
        </p>
      </div>
    </div>
  );
}
