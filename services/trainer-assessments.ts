import { createClient } from '@/utils/supabase/server';
import { getTrainerWorkspace } from '@/services/trainer-workspace';

export async function getTrainerAssessments() {
  const { workspaceId } = await getTrainerWorkspace();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      id,
      title,
      assessment_type,
      max_score,
      pass_mark,
      created_at,
      programmes!inner ( id, programme_name, trainer_workspace_id )
    `)
    .eq('programmes.trainer_workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getTrainerAssignments() {
  const { workspaceId } = await getTrainerWorkspace();
  const supabase = await createClient();

  // Practical assessments act as assignments in this LMS
  const { data, error } = await supabase
    .from('practical_assessments')
    .select(`
      id,
      title,
      max_score,
      pass_mark,
      created_at,
      programmes!inner ( id, programme_name, trainer_workspace_id )
    `)
    .eq('programmes.trainer_workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
