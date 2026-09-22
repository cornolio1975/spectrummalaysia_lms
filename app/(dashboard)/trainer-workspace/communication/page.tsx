import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import CommunicationClient from './CommunicationClient';

export default async function TrainerCommunicationPage() {
  let errorMsg = null;
  let courses: any[] = [];
  let learners: any[] = [];

  try {
    const { workspaceId } = await getTrainerWorkspace();
    const supabase = await createClient();

    // Fetch trainer's courses
    const { data: coursesData } = await supabase
      .from('programmes')
      .select('id, programme_name')
      .eq('trainer_workspace_id', workspaceId);
    
    if (coursesData) courses = coursesData;

    // Fetch trainer's learners (participants in their courses)
    if (courses.length > 0) {
      const courseIds = courses.map(c => c.id);
      const { data: participantsData } = await supabase
        .from('participant_programmes')
        .select(`
          participants ( id, name: full_name )
        `)
        .in('programme_id', courseIds);

      if (participantsData) {
        // Deduplicate learners
        const learnerMap = new Map();
        participantsData.forEach((p: any) => {
          if (p.participants) {
            learnerMap.set(p.participants.id, p.participants);
          }
        });
        learners = Array.from(learnerMap.values());
      }
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
          <h1 className="text-3xl font-bold text-gray-900">Communication</h1>
          <p className="text-gray-500 mt-2">Manage your trainer communication.</p>
        </div>
      </header>

      <CommunicationClient courses={courses} learners={learners} />
    </div>
  );
}
