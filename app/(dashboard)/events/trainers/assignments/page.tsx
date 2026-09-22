import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Trainer Assignments",
};

export default async function TrainerAssignmentsPage() {
  const supabase = await createClient();
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Trainer Assignments</h1>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
        <h2 className="text-xl font-semibold mb-2">Trainer Assignments</h2>
        <p className="text-gray-500 mb-6">
          Assign trainers to active events and programmes here.
        </p>
        <button className="btn btn-primary">
          + New Assignment
        </button>
      </div>
    </div>
  );
}
