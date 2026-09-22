const fs = require('fs');
const path = require('path');

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
  
  const content = `import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "${p.title} | SpectrumMY LMS",
};

export default async function ${p.path.charAt(0).toUpperCase() + p.path.slice(1)}Page() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="page-header">
        <div>
          <h1>${p.title}</h1>
          <p>Manage and view ${p.title.toLowerCase()} for the organization.</p>
        </div>
      </div>
      <div className="page-body">
        <div className="card text-center p-12 text-gray-500">
          This module is currently being provisioned.
        </div>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
});
