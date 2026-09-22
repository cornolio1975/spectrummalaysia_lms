import React from 'react';
import { getLearnerSessions } from '@/services/learner-workspace';
import Link from 'next/link';

export default async function LearnerSessionsPage() {
  let sessions = [];
  let errorMsg = null;

  try {
    sessions = await getLearnerSessions();
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

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const pastSessions = sessions.filter(s => s.status === 'completed' || s.status === 'cancelled');

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
          <p className="text-gray-500 mt-2">View upcoming live classes and join Google Meet sessions.</p>
        </div>
      </header>

      {/* Upcoming Sessions */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-indigo-600">📅</span> Upcoming Classes
        </h2>
        
        {upcomingSessions.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center text-gray-500 shadow-sm">
            You don't have any upcoming live classes scheduled at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingSessions.map((session: any) => (
              <div key={session.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{new Date(session.scheduled_at).toLocaleDateString()}</span>
                    <h3 className="text-lg font-bold text-gray-900 mt-1 line-clamp-1">{session.title}</h3>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">
                    {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">Course: <span className="font-semibold">{session.programmes?.programme_name}</span></p>
                <p className="text-sm text-gray-500 mb-6">{session.duration_minutes} minutes</p>

                <a 
                  href={session.meeting_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block text-center w-full py-2.5 rounded-lg font-semibold transition ${
                    session.meeting_url 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {session.meeting_url ? 'Join Meeting' : 'Link Unavailable'}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-gray-500">⏱</span> Past Classes
          </h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastSessions.map((session: any) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(session.scheduled_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {session.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {session.programmes?.programme_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Mock attendance status - in reality this would query live_class_attendance */}
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        Present
                      </span>
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
