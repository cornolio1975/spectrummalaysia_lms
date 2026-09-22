import React from 'react';
import { getTrainerWorkspace } from '@/services/trainer-workspace';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function TrainerLearnerDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ courseId?: string }>
}) {
  const { id } = await params;
  const { courseId } = await searchParams;
  let errorMsg = null;
  let learner: any = null;
  let progressData: any = null;

  try {
    const { workspaceId } = await getTrainerWorkspace();
    const supabase = await createClient();

    // Verify trainer has access to this learner (learner must be enrolled in one of trainer's courses)
    const { data: enrolment, error: enrolError } = await supabase
      .from('course_enrolments')
      .select(`
        *,
        programmes!inner ( id, programme_name, trainer_workspace_id ),
        participants!inner ( id, name, email, phone )
      `)
      .eq('participant_id', id)
      .eq('programmes.trainer_workspace_id', workspaceId)
      .eq(courseId ? 'programme_id' : '', courseId ? courseId : '')
      .limit(1)
      .single();

    if (enrolError || !enrolment) {
      throw new Error('Learner not found or you do not have permission to view them.');
    }

    learner = enrolment.participants;
    
    // Fetch progress if available (mocked stats for now)
    progressData = {
      courseName: enrolment.programmes.programme_name,
      status: enrolment.status,
      completedLessons: 0,
      totalLessons: 10,
      attendanceRate: 100,
      averageScore: 0
    };

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p>{errorMsg}</p>
        <Link href="/trainer-workspace/learners" className="text-blue-600 hover:underline mt-4 inline-block">&larr; Back to Learners</Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-4">
        <Link href="/trainer-workspace/learners" className="text-sm text-gray-500 hover:text-blue-600">&larr; Back to Learners</Link>
      </div>
      
      <header className="flex justify-between items-start pb-4 border-b">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
            {learner.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{learner.name}</h1>
            <p className="text-gray-500 mt-1">{learner.email} | {learner.phone}</p>
            <p className="text-sm font-medium text-blue-600 mt-1">Course: {progressData.courseName}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium">
            Message Learner
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Progress</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{Math.round((progressData.completedLessons / progressData.totalLessons) * 100) || 0}%</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{progressData.attendanceRate}%</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Score</h3>
          <p className="text-3xl font-bold mt-2 text-gray-900">{progressData.averageScore}%</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 text-center">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</h3>
          <p className={`text-xl font-bold mt-3 ${progressData.status === 'active' ? 'text-green-600' : 'text-gray-900'}`}>
            {progressData.status.toUpperCase()}
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-8 text-center text-gray-500">
        <p>Detailed learner insights, assessment results, and assignment submissions are currently under active development.</p>
      </div>
    </div>
  );
}
