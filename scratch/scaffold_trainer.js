const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '../app/(dashboard)/trainer-workspace');

const routes = [
  'learners',
  'sessions',
  'assessments',
  'assignments',
  'attendance',
  'communication',
  'certificates',
  'reports',
  'ai',
  'profile',
  'notifications'
];

routes.forEach(route => {
  const dirPath = path.join(basePath, route);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const pagePath = path.join(dirPath, 'page.tsx');
  if (!fs.existsSync(pagePath)) {
    const componentName = route.charAt(0).toUpperCase() + route.slice(1);
    const content = `import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import Link from 'next/link';

export default async function Trainer${componentName}Page() {
  let errorMsg = null;
  try {
    await getTrainerWorkspace();
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
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">${componentName}</h1>
          <p className="text-gray-500 mt-2">Manage your trainer ${route.toLowerCase()}.</p>
        </div>
      </header>

      <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-500">
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
