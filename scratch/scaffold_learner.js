const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../app/(dashboard)/learner-workspace');

const routes = [
  'courses',
  'catalogue',
  'sessions',
  'assessments',
  'assignments',
  'progress',
  'certificates',
  'badges',
  'messages',
  'notifications',
  'ai',
  'profile'
];

// Create base directory and page
if (!fs.existsSync(basePath)) {
  fs.mkdirSync(basePath, { recursive: true });
}

// Generate sub-route pages
routes.forEach(route => {
  const dirPath = path.join(basePath, route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const pagePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(pagePath)) {
    const componentName = route.charAt(0).toUpperCase() + route.slice(1);
    const content = `import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';

export default async function Learner${componentName}Page() {
  let errorMsg = null;
  try {
    await getLearnerWorkspace();
  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">${componentName}</h1>
          <p className="text-gray-500 mt-1">Manage your learner ${route.toLowerCase()}.</p>
        </div>
      </header>

      <div className="bg-white rounded-xl border shadow-sm p-8 text-center text-gray-500">
        <p>${componentName} functionality is currently under active development.</p>
        <p className="mt-2 text-sm text-gray-400">Please check back soon.</p>
      </div>
    </div>
  );
}
`;
    fs.writeFileSync(pagePath, content);
    console.log(`Created ${pagePath}`);
  }
});
