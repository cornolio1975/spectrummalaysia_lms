import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import Link from 'next/link';

export default async function TrainerReportsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Trainer Reports</h1>
          <p className="text-gray-500 mt-2">View analytics on course performance, learner progress, and attendance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition cursor-pointer">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-gray-900">Course Analytics</h3>
          <p className="text-gray-500 mt-2 text-sm">Overall enrolment, completion rates, and average progression across all your courses.</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition cursor-pointer">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded flex items-center justify-center text-xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-900">Learner Performance</h3>
          <p className="text-gray-500 mt-2 text-sm">Detailed breakdown of learner quiz results, assignment grades, and final scores.</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition cursor-pointer">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xl mb-4">✓</div>
          <h3 className="text-xl font-bold text-gray-900">Attendance Trends</h3>
          <p className="text-gray-500 mt-2 text-sm">Monitor class participation, absence patterns, and overall attendance percentages.</p>
        </div>

        <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition cursor-pointer">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded flex items-center justify-center text-xl mb-4">📝</div>
          <h3 className="text-xl font-bold text-gray-900">Assessment Insights</h3>
          <p className="text-gray-500 mt-2 text-sm">Analyze question performance, common failure points, and overall pass rates.</p>
        </div>
      </div>
    </div>
  );
}
