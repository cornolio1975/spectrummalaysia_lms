'use client'

import { useState } from 'react';
import { markNotificationAsRead, markAllNotificationsAsRead } from './actions';
import Link from 'next/link';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
};

export default function NotificationsClient({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isMarking, setIsMarking] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    // Optimistic UI update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarking(true);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    await markAllNotificationsAsRead();
    setIsMarking(false);
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'system': return '⚙️';
      case 'course': return '📚';
      case 'assignment': return '📝';
      case 'alert': return '⚠️';
      case 'message': return '✉️';
      default: return '🔔';
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Inbox 
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadCount} unread
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead} 
            disabled={isMarking}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-lg font-medium">All caught up!</p>
            <p className="text-sm">You have no new notifications.</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-6 transition-colors ${notification.is_read ? 'bg-white' : 'bg-blue-50/30'}`}
            >
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1 text-2xl">
                  {getIconForType(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className={`text-base font-semibold ${notification.is_read ? 'text-gray-900' : 'text-blue-900'}`}>
                      {notification.title}
                    </h3>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(notification.created_at).toLocaleString()}
                      </span>
                      {!notification.is_read && (
                        <button 
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm ${notification.is_read ? 'text-gray-600' : 'text-gray-800'}`}>
                    {notification.message}
                  </p>
                  
                  {notification.action_url && (
                    <div className="mt-3">
                      <Link 
                        href={notification.action_url}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          if (!notification.is_read) handleMarkAsRead(notification.id);
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
