import { createClient } from '@/utils/supabase/server';

export type LearnerContext = {
  userId: string;
  participantId?: string; // May be undefined if just relying on RLS
};

/**
 * Ensures the user is authenticated and retrieves basic learner context.
 * For the Learner Console, Row Level Security (RLS) handles data isolation natively,
 * so we primarily need to ensure a valid session exists.
 */
export async function getLearnerWorkspace(): Promise<LearnerContext> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized. Please log in.');
  }

  // Attempt to find the participant profile tied to this user, though RLS 
  // on course_enrolments handles security automatically.
  // Assuming participants are matched via email or a specific user_id linkage if present.
  const { data: participant } = await supabase
    .from('participants')
    .select('id')
    .eq('email', user.email)
    .single();

  return {
    userId: user.id,
    participantId: participant?.id,
  };
}

/**
 * Helper to fetch active enrolments for the learner, relying on Supabase RLS 
 * to filter to the auth.uid().
 */
export async function getLearnerEnrolments() {
  const supabase = await createClient();
  
  // RLS will automatically restrict this to the user's enrolments
  const { data, error } = await supabase
    .from('course_enrolments')
    .select(`
      *,
      courses (
        *,
        programmes (*)
      )
    `)
    .order('enrolled_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
}

/**
 * Fetch live sessions for courses the learner is enrolled in.
 * Relies on RLS or explicit course_id IN (...) filtering.
 */
export async function getLearnerSessions() {
  const supabase = await createClient();
  const enrolments = await getLearnerEnrolments();
  const programmeIds = enrolments.map(e => e.courses?.programme_id).filter(Boolean);

  if (programmeIds.length === 0) return [];

  const { data, error } = await supabase
    .from('live_classes')
    .select(`
      *,
      programmes ( id, programme_name )
    `)
    .in('programme_id', programmeIds)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getLearnerAssessments() {
  const supabase = await createClient();
  const enrolments = await getLearnerEnrolments();
  const programmeIds = enrolments.map(e => e.courses?.programme_id).filter(Boolean);

  if (programmeIds.length === 0) return [];

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      programmes ( id, programme_name )
    `)
    .in('programme_id', programmeIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getLearnerAssignments() {
  const supabase = await createClient();
  const enrolments = await getLearnerEnrolments();
  const courseIds = enrolments.map(e => e.course_id);

  if (courseIds.length === 0) return [];

  const { data, error } = await supabase
    .from('practical_assessments')
    .select(`
      *,
      programmes ( id, programme_name )
    `)
    .in('course_id', courseIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
