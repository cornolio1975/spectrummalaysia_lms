import React from 'react';
import { getLearnerEnrolments } from '@/services/learner-workspace';
import Link from 'next/link';

export default async function LearnerCoursesPage() {
  let enrolments = [];
  let errorMsg = null;

  try {
    enrolments = await getLearnerEnrolments();
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

  const activeEnrolments = enrolments.filter(e => e.status === 'in_progress');
  const completedEnrolments = enrolments.filter(e => e.status === 'completed');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="text-gray-500 mt-2">Track and manage your enrolled courses and learning progress.</p>
        </div>
        <Link href="/learner-workspace/catalogue" className="shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium text-center shadow-sm">
          Browse Catalogue
        </Link>
      </header>

      {/* Active Courses */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Active Courses</h2>
        {activeEnrolments.length === 0 ? (
          <div className="bg-white border rounded-xl p-12 text-center text-gray-500 shadow-sm">
            You don't have any active courses. Visit the catalogue to start learning.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeEnrolments.map(enrolment => (
              <div key={enrolment.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition hover:shadow-md hover:border-indigo-300">
                {/* Course Header */}
                <div className="h-32 bg-gray-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20"></div>
                  <div className="absolute top-4 left-4">
                    <span className="px-2.5 py-1 bg-white/90 backdrop-blur-sm text-indigo-700 text-xs font-bold rounded-md shadow-sm">
                      {enrolment.courses?.course_code}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full shadow-sm">
                      {enrolment.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {/* Course Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{enrolment.courses?.title}</h3>
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <p>Level: <span className="capitalize">{enrolment.courses?.level}</span></p>
                    <p>Duration: {enrolment.courses?.duration_hours} Hours</p>
                  </div>
                  
                  <div className="mt-auto pt-5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-600">Progress</span>
                      <span className="text-xs font-bold text-indigo-600">{enrolment.progress_pct || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${enrolment.progress_pct || 0}%` }}></div>
                    </div>
                    
                    <Link 
                      href={`/learner-workspace/courses/${enrolment.course_id}`}
                      className="mt-4 block w-full text-center px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 font-semibold rounded-lg transition"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Courses */}
      {completedEnrolments.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Completed Courses</h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade/Score</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {completedEnrolments.map((enrolment: any) => (
                  <tr key={enrolment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{enrolment.courses?.title}</div>
                      <div className="text-xs font-mono text-gray-500">{enrolment.courses?.course_code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {enrolment.completed_at ? new Date(enrolment.completed_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        Passed
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/learner-workspace/courses/${enrolment.course_id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">Review</Link>
                      <Link href={`/learner-workspace/certificates`} className="text-emerald-600 hover:text-emerald-900">Certificate</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
