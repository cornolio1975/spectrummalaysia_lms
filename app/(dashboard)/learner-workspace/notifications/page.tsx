import React from 'react';
import { getLearnerWorkspace } from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function LearnerNotificationsPage() {
  let errorMsg = null;
  let notifications: any[] = [];

  try {
    const { userId } = await getLearnerWorkspace();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data) notifications = data;

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Notifications</h1>
        <p>{errorMsg}</p>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated on your learning activities.</p>
        </div>
        {unreadCount > 0 && (
          <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-bold">
            {unreadCount} Unread
          </div>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 shadow-sm">
          <div className="text-4xl mb-4">🔔</div>
          <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
          <p>You have no notifications at this time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`bg-white rounded-xl border ${notification.is_read ? 'border-gray-200' : 'border-indigo-300 shadow-sm'} p-5 flex gap-4 items-start transition`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl ${
                notification.type === 'system' ? 'bg-gray-100 text-gray-600' :
                notification.type === 'assessment' ? 'bg-sky-100 text-sky-600' :
                notification.type === 'credential' ? 'bg-emerald-100 text-emerald-600' :
                'bg-indigo-100 text-indigo-600'
              }`}>
                {notification.type === 'system' ? '⚙️' :
                 notification.type === 'assessment' ? '📝' :
                 notification.type === 'credential' ? '🎓' : '🔔'}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start gap-4">
                  <h3 className={`text-base font-bold ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(notification.created_at).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-700'}`}>
                  {notification.message}
                </p>
                {notification.link && (
                  <Link href={notification.link} className="inline-block mt-3 text-sm font-semibold text-indigo-600 hover:underline">
                    View Details &rarr;
                  </Link>
                )}
              </div>
              
              {!notification.is_read && (
                <div className="w-3 h-3 bg-indigo-600 rounded-full shrink-0 mt-1"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
