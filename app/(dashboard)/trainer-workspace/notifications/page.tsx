import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import NotificationsClient from './NotificationsClient';

export default async function TrainerNotificationsPage() {
  let errorMsg = null;
  let notifications: any[] = [];
  try {
    await getTrainerWorkspace();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (data) notifications = data;
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-2">Manage your trainer notifications.</p>
        </div>
      </header>

      <NotificationsClient initialNotifications={notifications} />
    </div>
  );
}
