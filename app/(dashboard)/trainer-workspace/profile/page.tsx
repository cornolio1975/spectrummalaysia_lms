import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { createClient } from '@/utils/supabase/server';
import ProfileClient from './ProfileClient';
import ChangePasswordClient from '@/components/profile/change-password-client';

export default async function TrainerProfilePage() {
  let errorMsg = null;
  let trainer = null;
  
  try {
    const { trainerId } = await getTrainerWorkspace();
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();
      
    if (error) throw error;
    trainer = data;
    
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
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-end pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-2">View and manage your trainer information.</p>
        </div>
      </header>

      {trainer && <ProfileClient trainer={trainer} />}
      <ChangePasswordClient />
    </div>
  );
}
