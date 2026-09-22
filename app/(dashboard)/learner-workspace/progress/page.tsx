import React from 'react';
import { getLearnerWorkspace, getLearnerEnrolments } from '@/services/learner-workspace';
import Link from 'next/link';

export default async function LearnerProgressPage() {
  let errorMsg = null;
  let enrolments: any[] = [];

  try {
    await getLearnerWorkspace();
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
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Progress</h1>
          <p className="text-gray-500 mt-1">Track your course progression and completion status.</p>
        </div>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Active Courses</div>
          <div className="text-4xl font-bold text-indigo-600">{activeEnrolments.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Completed Courses</div>
          <div className="text-4xl font-bold text-emerald-600">{completedEnrolments.length}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Average Score</div>
          <div className="text-4xl font-bold text-sky-600">
            {enrolments.length > 0 
              ? Math.round(enrolments.reduce((acc, curr) => acc + (curr.score || 0), 0) / enrolments.length) 
              : 0}%
          </div>
        </div>
      </div>

      {/* Active Courses Progress */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Currently Learning</h2>
        
        {activeEnrolments.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            <p>You have no courses currently in progress.</p>
            <Link href="/learner-workspace/catalogue" className="text-indigo-600 font-bold hover:underline mt-2 inline-block">
              Browse Catalogue
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeEnrolments.map((enrolment: any) => (
              <div key={enrolment.id} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-indigo-200 transition">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-4 border-indigo-100 flex items-center justify-center shrink-0">
                  <span className="text-indigo-600 font-bold">{enrolment.progress_pct || 0}%</span>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">{enrolment.courses?.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Enrolled: {new Date(enrolment.enrolled_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${enrolment.progress_pct || 0}%` }}></div>
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto">
                  <Link 
                    href={`/learner-workspace/courses/${enrolment.course_id}`}
                    className="block w-full text-center px-6 py-2.5 bg-indigo-50 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-100 transition"
                  >
                    Continue
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed Courses */}
      {completedEnrolments.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedEnrolments.map((enrolment: any) => (
              <div key={enrolment.id} className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{enrolment.courses?.title}</h3>
                  <div className="flex gap-4 mt-1">
                    <span className="text-xs text-emerald-700 font-medium">Completed: {enrolment.completed_at ? new Date(enrolment.completed_at).toLocaleDateString() : 'N/A'}</span>
                    <span className="text-xs text-emerald-700 font-medium">Score: {enrolment.score || 100}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
