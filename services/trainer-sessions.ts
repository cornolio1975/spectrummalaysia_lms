import { createClient } from '@/utils/supabase/server';
import { getTrainerWorkspace } from '@/services/trainer-workspace';

export async function getTrainerSessions() {
  const { trainerId } = await getTrainerWorkspace();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('live_classes')
    .select(`
      id,
      title,
      scheduled_start,
      scheduled_end,
      status,
      google_meet_url,
      programmes ( id, programme_name )
    `)
    .eq('trainer_id', trainerId)
    .order('scheduled_start', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getSessionAttendance(sessionId: string) {
  const { trainerId } = await getTrainerWorkspace();
  const supabase = await createClient();

  // Ensure trainer owns this session
  const { data: session } = await supabase
    .from('live_classes')
    .select('id')
    .eq('id', sessionId)
    .eq('trainer_id', trainerId)
    .single();

  if (!session) {
    throw new Error('Unauthorized');
  }

  const { data, error } = await supabase
    .from('live_class_attendance')
    .select(`
      id,
      status,
      joined_at,
      participants ( id, name, email )
    `)
    .eq('live_class_id', sessionId);

  if (error) throw error;
  return data;
}
