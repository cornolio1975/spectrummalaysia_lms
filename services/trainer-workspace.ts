import { createClient } from '@/utils/supabase/server';

export type TrainerWorkspaceInfo = {
  trainerId: string;
  workspaceId: string;
};

/**
 * Ensures the authenticated user is a trainer and retrieves their isolated workspace information.
 * Throws an error if the user is not a trainer or lacks a workspace.
 */
export async function getTrainerWorkspace(): Promise<TrainerWorkspaceInfo> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Unauthorized');
  }

  // Find the trainer record associated with this user
  const { data: trainer, error: trainerError } = await supabase
    .from('trainers')
    .select('id')
    .eq('created_by', user.id)
    .single();

  if (trainerError || !trainer) {
    throw new Error('User is not registered as a trainer.');
  }

  // Find the workspace associated with this trainer
  const { data: workspace, error: workspaceError } = await supabase
    .from('trainer_workspaces')
    .select('id')
    .eq('trainer_id', trainer.id)
    .single();

  if (workspaceError || !workspace) {
    throw new Error('Trainer workspace not found. Please contact an administrator.');
  }

  return {
    trainerId: trainer.id,
    workspaceId: workspace.id,
  };
}

/**
 * Securely fetches all courses belonging to the authenticated trainer.
 * Validates ownership server-side regardless of client input.
 */
export async function getTrainerCourses() {
  const { workspaceId } = await getTrainerWorkspace();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('programmes')
    .select('*')
    .eq('trainer_workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Validates if the given resource (course, module, etc.) belongs to the trainer's workspace.
 */
export async function verifyTrainerOwnership(tableName: string, resourceId: string): Promise<boolean> {
  const { workspaceId } = await getTrainerWorkspace();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(tableName)
    .select('id')
    .eq('id', resourceId)
    .eq('trainer_workspace_id', workspaceId)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

/**
 * Creates an audit log entry for trainer actions.
 */
export async function logTrainerAction(
  action: string, 
  resourceType: string, 
  resourceId: string, 
  notes?: string
) {
  const { trainerId, workspaceId } = await getTrainerWorkspace();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('content_audit_logs').insert({
    user_id: user?.id,
    trainer_id: trainerId,
    trainer_workspace_id: workspaceId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    notes
  });
}
