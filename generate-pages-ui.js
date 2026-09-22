const fs = require('fs');
const path = require('path');

const pageContent = (title) => `import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "${title} | SpectrumMY LMS",
};

export default async function Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">${title}</h1>
          <p className="text-gray-500">Manage ${title.toLowerCase()}</p>
        </div>
        <button className="btn btn-primary">+ Add New</button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-medium text-gray-500 text-sm">Trainer</th>
              <th className="p-4 font-medium text-gray-500 text-sm">Status</th>
              <th className="p-4 font-medium text-gray-500 text-sm">Date</th>
              <th className="p-4 font-medium text-gray-500 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="p-12 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
`;

const pages = [
  { path: 'profiles', title: 'Trainer Profiles' },
  { path: 'credentials', title: 'Trainer Credentials' },
  { path: 'documents', title: 'Trainer Documents' },
  { path: 'courses', title: 'Trainer Courses' },
  { path: 'assignments', title: 'Trainer Assignments' },
  { path: 'performance', title: 'Trainer Performance' },
  { path: 'attendance', title: 'Trainer Attendance' },
  { path: 'certificates', title: 'Trainer Certificates' },
  { path: 'reports', title: 'Trainer Reports' },
  { path: 'storage', title: 'Trainer Storage' },
  { path: 'audit', title: 'Trainer Audit Logs' }
];

pages.forEach(p => {
  const dir = path.join(__dirname, 'app/(dashboard)/admin/trainers', p.path);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'page.tsx'), pageContent(p.title));
});
