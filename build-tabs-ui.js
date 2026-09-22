const fs = require('fs');
const path = require('path');

const tabs = [
  { path: 'profiles', title: 'Trainer Profiles', func: 'getTrainerProfiles', type: 'trainer' },
  { path: 'credentials', title: 'Trainer Credentials', func: 'getTrainerCredentials', type: 'related' },
  { path: 'documents', title: 'Trainer Documents', func: 'getTrainerDocuments', type: 'related' },
  { path: 'audit', title: 'Trainer Audit Logs', func: 'getTrainerAuditLogs', type: 'related' },
  { path: 'attendance', title: 'Trainer Attendance', func: 'getTrainerAttendance', type: 'related' },
];

const pageContent = (tab) => `import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ${tab.func} } from "@/app/actions/trainer_tabs";

export const metadata = {
  title: "${tab.title} | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data, error } = await ${tab.func}();

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">${tab.title}</h1>
          <p className="text-gray-500">Manage and view ${tab.title.toLowerCase()}</p>
        </div>
        ${['profiles', 'credentials', 'documents'].includes(tab.path) ? '<Link href="/events/trainers/new" className="btn btn-primary">+ Add New</Link>' : ''}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-medium text-gray-500 text-sm">Trainer</th>
              <th className="p-4 font-medium text-gray-500 text-sm">Details / Status</th>
              <th className="p-4 font-medium text-gray-500 text-sm">Date</th>
              <th className="p-4 font-medium text-gray-500 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-red-500">{error}</td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row: any) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-primary-700">
                    {row.trainers ? row.trainers.name : row.name || "Unknown Trainer"}
                  </td>
                  <td className="p-4">
                    <span className="badge badge-neutral capitalize">{row.status || row.action || "Active"}</span>
                  </td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(row.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button className="text-sm font-medium text-primary-600 hover:text-primary-800">View</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

tabs.forEach(t => {
  const file = path.join(__dirname, 'app/(dashboard)/admin/trainers', t.path, 'page.tsx');
  if (fs.existsSync(file)) {
    fs.writeFileSync(file, pageContent(t));
  }
});
