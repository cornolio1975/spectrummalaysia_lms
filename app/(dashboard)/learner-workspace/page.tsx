import React from 'react';
import type { Metadata } from 'next';
import { 
  getLearnerWorkspace, 
  getLearnerEnrolments, 
  getLearnerSessions, 
  getLearnerAssessments, 
  getLearnerAssignments 
} from '@/services/learner-workspace';
import { createClient } from '@/utils/supabase/server';
import { LearnerDashboardClient } from '@/components/learner/LearnerDashboardClient';

export const metadata: Metadata = {
  title: 'Learner Workspace & Dashboard | SpectrumMY',
  description: 'National programme learner dashboard, micro-credentials, live sessions, and AI study coach.'
};

export const dynamic = 'force-dynamic';

export default async function LearnerDashboardPage() {
  let errorMsg = null;
  let enrolments: any[] = [];
  let userProfile: any = null;
  let achievements = { certificates: 0, badges: 0 };
  let upcomingSessions: any[] = [];
  let assessments: any[] = [];
  let assignments: any[] = [];

  try {
    const { userId } = await getLearnerWorkspace();
    const supabase = await createClient();

    // Fetch user profile info
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', userId)
      .single();
    
    userProfile = profileData;

    // Fetch learner enrolments, sessions, assessments, and assignments in parallel
    const [enrolmentsRes, sessionsRes, assessmentsRes, assignmentsRes, issuancesRes] = await Promise.all([
      getLearnerEnrolments().catch(() => []),
      getLearnerSessions().catch(() => []),
      getLearnerAssessments().catch(() => []),
      getLearnerAssignments().catch(() => []),
      Promise.resolve(
        supabase
          .from('credential_issuances')
          .select('credentials(type)')
          .eq('status', 'issued')
      ).catch(() => ({ data: [] }))
    ]);

    enrolments = enrolmentsRes || [];
    upcomingSessions = sessionsRes || [];
    assessments = assessmentsRes || [];
    assignments = assignmentsRes || [];

    const issuances = issuancesRes?.data || [];
    if (issuances.length > 0) {
      achievements.certificates = issuances.filter((i: any) => i.credentials?.type === 'certificate').length;
      achievements.badges = issuances.filter((i: any) => i.credentials?.type === 'badge').length;
    }

  } catch (error: any) {
    errorMsg = error.message;
  }

  if (errorMsg) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 bg-white rounded-2xl border border-rose-200 shadow-md text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
          !
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Access Authorization Notice</h1>
        <p className="text-sm text-slate-600 mb-6">{errorMsg}</p>
        <a 
          href="/login?redirectTo=/learner-workspace" 
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-xs hover:bg-indigo-700 transition"
        >
          Sign In as Learner
        </a>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <LearnerDashboardClient
        userProfile={userProfile}
        enrolments={enrolments}
        upcomingSessions={upcomingSessions}
        assessments={assessments}
        assignments={assignments}
        achievements={achievements}
      />
    </div>
  );
}
