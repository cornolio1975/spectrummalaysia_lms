import React from 'react';
import { getTrainerAssignments } from '@/services/trainer-assessments';
import Link from 'next/link';

export default async function TrainerAssignmentsPage() {
  let assignments: any[] = [];
  let errorMsg = null;

  try {
    assignments = await getTrainerAssignments();
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
          <h1 className="text-3xl font-bold text-gray-900">Assignments & Portfolios</h1>
          <p className="text-gray-500 mt-2">Manage practical assignments and review learner portfolios (e.g. SPM-LMS-MC-001).</p>
        </div>
        <div className="flex gap-4">
          <Link href="/trainer-workspace/assignments/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Create Assignment
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No practical assignments created yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Title</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment: any) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {assignment.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.programmes?.programme_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                      Practical
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {assignment.max_score} marks (Pass: {assignment.pass_mark}%)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/trainer-workspace/assignments/${assignment.id}/submissions`} className="text-green-600 hover:text-green-900 mr-4">
                      Review Submissions
                    </Link>
                    <Link href={`/trainer-workspace/assignments/${assignment.id}`} className="text-blue-600 hover:text-blue-900">
                      Edit Rubric
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
