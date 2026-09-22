import React from 'react';
import { getTrainerLearners } from '@/services/trainer-learners';
import { getTrainerCourses } from '@/services/trainer-workspace';
import Link from 'next/link';
import LearnersClient from './LearnersClient';

export default async function TrainerLearnersPage() {
  let learners = [];
  let courses = [];
  let errorMsg = null;

  try {
    learners = await getTrainerLearners();
    courses = await getTrainerCourses();
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
          <h1 className="text-3xl font-bold text-gray-900">My Learners</h1>
          <p className="text-gray-500 mt-2">Manage and monitor progress of learners assigned to your courses.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-800 border rounded-md hover:bg-gray-200 font-medium">
            Export CSV
          </button>
        </div>
      </header>

      <LearnersClient learners={learners} courses={courses} />
    </div>
  );
}
