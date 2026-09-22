import React from 'react';
import { getTrainerSessions } from '@/services/trainer-sessions';
import Link from 'next/link';

export default async function TrainerSessionsPage() {
  let sessions: any[] = [];
  let errorMsg = null;

  try {
    sessions = await getTrainerSessions();
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
          <h1 className="text-3xl font-bold text-gray-900">Classes & Sessions</h1>
          <p className="text-gray-500 mt-2">Manage your scheduled live classes and Google Meet sessions.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/trainer-workspace/sessions/new" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
            Schedule Session
          </Link>
        </div>
      </header>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {sessions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            You don't have any scheduled sessions yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Details</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.map((session: any) => (
                <tr key={session.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(session.scheduled_start).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(session.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{session.title}</div>
                    <div className="text-sm text-gray-500">{session.scheduled_end ? Math.round((new Date(session.scheduled_end).getTime() - new Date(session.scheduled_start).getTime()) / 60000) : '--'} mins</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{session.programmes?.programme_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                      session.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {session.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {session.google_meet_url && (
                      <a href={session.google_meet_url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-900 mr-4">
                        Join Meeting
                      </a>
                    )}
                    <Link href={`/trainer-workspace/sessions/${session.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                      Manage
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
