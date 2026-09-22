import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { getTrainerDashboardStats, getTrainerTodaysActivity } from '@/services/trainer-dashboard';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';

export default async function TrainerDashboardPage() {
  let workspaceInfo;
  let stats;
  let todaysActivity = [];
  let trainerProfile;
  let errorMsg = null;

  try {
    workspaceInfo = await getTrainerWorkspace();
    stats = await getTrainerDashboardStats();
    todaysActivity = await getTrainerTodaysActivity();
    
    const supabase = await createClient();
    const { data } = await supabase.from('trainers').select('*').eq('id', workspaceInfo.trainerId).single();
    trainerProfile = data;
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
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end pb-4 border-b gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold overflow-hidden">
            {trainerProfile?.profile_image_url ? (
              <img src={trainerProfile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              trainerProfile?.name?.charAt(0) || 'T'
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {trainerProfile?.name || 'Trainer'}</h1>
            <p className="text-gray-500 mt-1">Trainer ID: {trainerProfile?.id.substring(0, 8)} | {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link href="/trainer-workspace/profile" className="px-4 py-2 bg-gray-100 text-gray-800 border rounded-md hover:bg-gray-200 font-medium transition">
            My Profile
          </Link>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Courses</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats?.activeCourses}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Learners</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats?.activeLearners}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Upcoming Sessions</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{stats?.upcomingSessions}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Assessments</h3>
          <p className="text-3xl font-bold mt-2 text-amber-600">{stats?.pendingAssessments}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Activity */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Today's Activity</h2>
              <Link href="/trainer-workspace/sessions" className="text-blue-600 hover:underline text-sm font-medium">View Schedule</Link>
            </div>
            
            {todaysActivity.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300">
                <p className="text-gray-500">No sessions scheduled for today.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysActivity.map((session: any) => (
                  <div key={session.id} className="flex items-start p-4 border rounded-lg hover:border-blue-300 transition">
                    <div className="bg-blue-100 text-blue-800 font-bold rounded p-3 text-center min-w-[80px]">
                      <div className="text-sm">{new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                    <div className="ml-4 flex-1">
                      <h4 className="font-bold text-gray-900">{session.title}</h4>
                      <p className="text-sm text-gray-500">{session.programmes?.programme_name}</p>
                      <p className="text-xs text-gray-400 mt-1">{session.duration_minutes} minutes</p>
                    </div>
                    <Link href={`/trainer-workspace/sessions/${session.id}`} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium text-gray-700">
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Link href="/trainer-workspace/courses/new" className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">📚</span>
                <span className="text-sm font-medium text-gray-800">Create Course</span>
              </Link>
              <Link href="/trainer-workspace/sessions/new" className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">📅</span>
                <span className="text-sm font-medium text-gray-800">Schedule Session</span>
              </Link>
              <Link href="/trainer-workspace/assessments/new" className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">📝</span>
                <span className="text-sm font-medium text-gray-800">Create Assessment</span>
              </Link>
              <Link href="/trainer-workspace/ai" className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition text-center flex flex-col items-center gap-2">
                <span className="text-2xl">🤖</span>
                <span className="text-sm font-medium text-gray-800">Ask AI Assistant</span>
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar Alerts */}
        <div className="space-y-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-amber-500">⚠️</span> Learner Alerts
            </h2>
            <div className="space-y-4">
              {/* Placeholder for real learner alerts query */}
              <div className="p-3 bg-amber-50 rounded border border-amber-100 text-sm">
                <p className="font-semibold text-amber-800">Low Progress</p>
                <p className="text-amber-700 mt-1">3 learners are falling behind in Startup Launch Essentials.</p>
                <Link href="/trainer-workspace/learners?filter=at-risk" className="text-amber-600 font-medium hover:underline mt-2 inline-block">View Learners</Link>
              </div>
              <div className="p-3 bg-red-50 rounded border border-red-100 text-sm">
                <p className="font-semibold text-red-800">Missed Sessions</p>
                <p className="text-red-700 mt-1">2 learners missed the last 2 sessions.</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
               <div className="text-sm text-gray-500 text-center py-4 bg-gray-50 rounded border border-dashed">
                 Activity feed will appear here as learners interact with your courses.
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
