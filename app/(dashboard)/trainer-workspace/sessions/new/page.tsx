import React from 'react';
import Link from 'next/link';
import { getTrainerCourses } from '@/services/trainer-workspace';

export default async function NewSessionPage() {
  const courses = await getTrainerCourses();

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8">
      <header className="flex justify-between items-center pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule New Session</h1>
          <p className="text-gray-500 mt-2">Create a new live class or coaching session.</p>
        </div>
        <Link href="/trainer-workspace/sessions" className="text-gray-500 hover:text-gray-700 font-medium">
          Cancel
        </Link>
      </header>

      <div className="bg-white rounded-lg border shadow-sm p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Title</label>
            <input type="text" className="w-full px-4 py-2 border rounded-md" placeholder="e.g., Weekly QA Session" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Associated Course</label>
            <select className="w-full px-4 py-2 border rounded-md bg-white">
              <option value="">-- Select Course (Optional) --</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.programme_name || c.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input type="datetime-local" className="w-full px-4 py-2 border rounded-md" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="datetime-local" className="w-full px-4 py-2 border rounded-md" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video Meeting URL</label>
            <input type="url" className="w-full px-4 py-2 border rounded-md" placeholder="https://meet.google.com/..." />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition">
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
