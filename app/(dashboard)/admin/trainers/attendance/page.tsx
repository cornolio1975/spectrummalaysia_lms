import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Trainer Attendance | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data, error } = await supabase
    .from("trainer_attendance")
    .select("*, trainers(id, name), event_sessions(id, title)")
    .order("created_at", { ascending: false });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'absent': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8">
        <h1 className="text-2xl font-bold mb-2">Trainer Attendance Timeline</h1>
        <p className="text-gray-500">Track trainer attendance records across all sessions.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-4xl">
        <h3 className="text-lg font-bold mb-6">Recent Activity</h3>
        
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error.message}</div>
        ) : data && data.length > 0 ? (
          <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
            {data.map((record: any) => (
              <div key={record.id} className="relative pl-8">
                <div className="absolute -left-[11px] top-1 bg-white rounded-full p-0.5">
                  {getStatusIcon(record.status)}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900">{record.trainers?.name}</h4>
                    <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Session: <span className="font-medium text-gray-900">{record.event_sessions?.title || 'General Session'}</span>
                  </p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Check-in: {record.check_in_time || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Check-out: {record.check_out_time || "N/A"}
                    </span>
                  </div>
                  {record.notes && (
                    <div className="mt-3 text-sm text-gray-600 border-t border-gray-200 pt-2 italic">
                      "{record.notes}"
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p>No attendance records found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
