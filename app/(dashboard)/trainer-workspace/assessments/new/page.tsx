import React from 'react';
import Link from 'next/link';
import { getTrainerCourses } from '@/services/trainer-workspace';

export default async function NewAssessmentPage() {
  const courses = await getTrainerCourses();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Assessment</h1>
          <p className="text-gray-500 mt-2">Design a new assessment for your learners.</p>
        </div>
        <Link href="/trainer-workspace/assessments" className="text-gray-500 hover:text-gray-700 font-medium">
          Cancel
        </Link>
      </header>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Title</label>
            <input type="text" className="w-full px-4 py-2 border rounded-md" placeholder="e.g., Final Project Submission" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Associated Course</label>
            <select className="w-full px-4 py-2 border rounded-md bg-white" required>
              <option value="">-- Select Course --</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.programme_name || c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Type</label>
              <select className="w-full px-4 py-2 border rounded-md bg-white">
                <option value="written">Written</option>
                <option value="practical">Practical</option>
                <option value="project">Project</option>
                <option value="presentation">Presentation</option>
                <option value="rubric">Rubric</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" className="w-full px-4 py-2 border rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Score</label>
              <input type="number" defaultValue="100" className="w-full px-4 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passing Mark (%)</label>
              <input type="number" defaultValue="70" className="w-full px-4 py-2 border rounded-md" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions / Description</label>
            <textarea className="w-full px-4 py-2 border rounded-md" rows={4} placeholder="Detailed instructions for learners..."></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition">
              Create Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
