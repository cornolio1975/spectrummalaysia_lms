const fs = require('fs');
const path = require('path');

const dirs = ['profiles', 'credentials', 'documents', 'courses', 'performance', 'attendance', 'certificates', 'reports', 'storage', 'audit'];

for (const dir of dirs) {
  const file = path.join(__dirname, 'app/(dashboard)/admin/trainers', dir, 'page.tsx');
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // For Audit Logs, Reports, Storage, Performance, Attendance, remove the button
    if (['audit', 'reports', 'storage', 'performance', 'attendance'].includes(dir)) {
      content = content.replace('<button className="btn btn-primary">+ Add New</button>', '');
    } else {
      // For others, change to a Link
      content = content.replace(
        '<button className="btn btn-primary">+ Add New</button>', 
        '<Link href="/events/trainers/new" className="btn btn-primary">+ Add New</Link>'
      );
      if (!content.includes('import Link')) {
        content = content.replace('import { redirect } from "next/navigation";', 'import { redirect } from "next/navigation";\nimport Link from "next/link";');
      }
    }
    fs.writeFileSync(file, content);
  }
}
