import React from 'react';
import { getLearnerAssignments } from '@/services/learner-workspace';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function LearnerAssignmentsPage() {
  let assignments = [];
  let submissions = [];
  let errorMsg = null;

  try {
    assignments = await getLearnerAssignments();
    
    // Also fetch submissions to show status
    const supabase = await createClient();
    const { data: subs } = await supabase
      .from('practical_submissions')
      .select('practical_assessment_id, status, score_pct')
      .order('submitted_at', { ascending: false });
      
    submissions = subs || [];
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

  // Helper to find submission status
  const getSubStatus = (assignmentId: string) => {
    return submissions.find((s: any) => s.practical_assessment_id === assignmentId);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assignments & Portfolios</h1>
          <p className="text-gray-500 mt-2">Submit practical tasks and build your Startup Launch Portfolio.</p>
        </div>
      </header>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No practical assignments found for your enrolled courses.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignment Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {assignments.map((assignment: any) => {
                const submission = getSubStatus(assignment.id);
                const isSubmitted = !!submission;
                
                return (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {assignment.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {assignment.programmes?.programme_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 uppercase">
                        {assignment.type || 'Practical'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        submission?.status === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                        submission?.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                        submission?.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission ? submission.status : 'Not Started'}
                      </span>
                      {submission?.score_pct != null && (
                        <span className="ml-2 text-xs font-bold text-indigo-600">{submission.score_pct}%</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {isSubmitted ? (
                        <Link href={`/learner-workspace/assignments/${assignment.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View Submission
                        </Link>
                      ) : (
                        <Link href={`/learner-workspace/assignments/${assignment.id}`} className="text-emerald-600 hover:text-emerald-900 font-bold">
                          Submit Work
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
