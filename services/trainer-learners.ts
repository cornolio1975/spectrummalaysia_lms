import { createClient } from '@/utils/supabase/server';
import { getTrainerWorkspace } from '@/services/trainer-workspace';

export async function getTrainerLearners() {
  const { workspaceId, trainerId } = await getTrainerWorkspace();
  const supabase = await createClient();

  // Get enrolments for all courses that belong to the trainer's workspace
  const { data, error } = await supabase
    .from('course_enrolments')
    .select(`
      id,
      participant_id,
      status,
      enrolled_at,
      courses!inner (
        id,
        title,
        trainer_id
      ),
      participants (
        id,
        full_name,
        email,
        phone,
        ic_number
      )
    `)
    .eq('courses.trainer_id', trainerId)
    .order('enrolled_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
