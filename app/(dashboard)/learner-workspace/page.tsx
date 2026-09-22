import React from 'react';
import { getLearnerWorkspace, getLearnerEnrolments } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LearnerDashboardPage() {
  let errorMsg = null;
  let enrolments = [];
  let userProfile = null;
  let achievements = { certificates: 0, badges: 0 };
  let upcomingSessions = [];

  try {
    const { userId, participantId } = await getLearnerWorkspace();
    enrolments = await getLearnerEnrolments();
    const supabase = await createClient();

    // Fetch user profile info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .single();
    
    userProfile = profileData;

    // Fetch achievements (credential_issuances)
    const { data: issuances } = await supabase
      .from('credential_issuances')
      .select('credentials(type)')
      .eq('status', 'issued');
      
    if (issuances) {
      achievements.certificates = issuances.filter((i: any) => i.credentials?.type === 'certificate').length;
      achievements.badges = issuances.filter((i: any) => i.credentials?.type === 'badge').length;
    }

    // Mock upcoming sessions since joining live_classes with course_enrolments is complex in a single query
    // In a real scenario, this would query live_classes where course_id IN (enrolled course ids)
    upcomingSessions = [];

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

  const activeEnrolments = enrolments.filter(e => e.status !== 'completed');
  const completedEnrolments = enrolments.filter(e => e.status === 'completed');
  const lastActiveCourse = activeEnrolments.length > 0 ? activeEnrolments[0] : null;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Area */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30 backdrop-blur-sm shadow-inner">
            {userProfile?.full_name?.charAt(0) || 'L'}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Welcome back, {userProfile?.full_name?.split(' ')[0] || 'Learner'}!</h1>
            <p className="text-blue-100 mt-2 text-lg">You're on a 3-day learning streak. Keep it up!</p>
          </div>
        </div>
        <div className="hidden md:block bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 text-center min-w-[150px]">
          <span className="block text-sm text-blue-100 font-medium uppercase tracking-wider">Overall Progress</span>
          <span className="block text-3xl font-bold mt-1 text-white">42%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area (Left 2 columns) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Continue Learning */}
          {lastActiveCourse && (
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-md">▶</span> Continue Learning
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{lastActiveCourse.courses?.course_code}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1">{lastActiveCourse.courses?.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">Module 2: Customer Discovery &bull; Lesson 3: Interview Techniques</p>
                    
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${lastActiveCourse.progress_pct || 0}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">{lastActiveCourse.progress_pct || 0}%</span>
                    </div>
                  </div>
                  <Link 
                    href={`/learner-workspace/courses/${lastActiveCourse.course_id}`} 
                    className="shrink-0 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm"
                  >
                    Resume
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* My Courses */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-md">📚</span> My Active Courses
              </h2>
              <Link href="/learner-workspace/courses" className="text-sm text-indigo-600 font-medium hover:underline">View all</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeEnrolments.length === 0 ? (
                <div className="col-span-2 p-8 text-center bg-gray-50 border border-dashed rounded-xl">
                  <p className="text-gray-500">You are not enrolled in any active courses.</p>
                  <Link href="/learner-workspace/catalogue" className="mt-4 inline-block px-4 py-2 bg-white border shadow-sm rounded-md text-sm font-medium hover:bg-gray-50">Browse Catalogue</Link>
                </div>
              ) : (
                activeEnrolments.slice(0, 4).map(enrolment => (
                  <div key={enrolment.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:border-indigo-300 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{enrolment.courses?.course_code}</span>
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">{enrolment.status.replace('_', ' ')}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 mt-3 line-clamp-2">{enrolment.courses?.title}</h3>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-sm text-gray-500"><span className="font-semibold text-gray-900">{enrolment.progress_pct || 0}%</span> completed</div>
                      <Link href={`/learner-workspace/courses/${enrolment.course_id}`} className="text-indigo-600 font-semibold text-sm hover:text-indigo-800">Go to Course &rarr;</Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

        </div>

        {/* Sidebar Area (Right column) */}
        <div className="space-y-8">
          
          {/* Tasks & Deadlines */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-amber-500">⏳</span> Upcoming Tasks
              </h2>
            </div>
            <div className="p-0">
              <ul className="divide-y divide-gray-100">
                <li className="p-4 hover:bg-gray-50 transition cursor-pointer flex gap-3">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Module 1 Assessment Due</p>
                    <p className="text-xs text-gray-500 mt-1">Digital Marketing Basics</p>
                    <p className="text-xs font-medium text-red-600 mt-1">Due today, 11:59 PM</p>
                  </div>
                </li>
                <li className="p-4 hover:bg-gray-50 transition cursor-pointer flex gap-3">
                  <div className="mt-0.5 w-2 h-2 rounded-full bg-amber-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Submit BMC Draft</p>
                    <p className="text-xs text-gray-500 mt-1">Startup Launch Portfolio</p>
                    <p className="text-xs font-medium text-amber-600 mt-1">Due in 3 days</p>
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Achievement Snapshot */}
          <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <span className="text-emerald-500">🏆</span> Achievements
              </h2>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="block text-3xl mb-1">🎓</span>
                  <span className="block text-2xl font-bold text-gray-900">{achievements.certificates}</span>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Certificates</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <span className="block text-3xl mb-1">🏅</span>
                  <span className="block text-2xl font-bold text-gray-900">{achievements.badges}</span>
                  <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Badges</span>
                </div>
                <div className="col-span-2 bg-emerald-50 border border-emerald-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-800">Courses Completed</span>
                  <span className="text-lg font-bold text-emerald-600">{completedEnrolments.length}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
