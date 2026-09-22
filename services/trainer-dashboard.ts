import { createClient } from '@/utils/supabase/server';
import { getTrainerWorkspace } from '@/services/trainer-workspace';

export async function getTrainerDashboardStats() {
  const { workspaceId, trainerId } = await getTrainerWorkspace();
  const supabase = await createClient();

  // Active Courses
  const { count: activeCourses } = await supabase
    .from('programmes')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_workspace_id', workspaceId)
    .eq('status', 'published');

  // Active Learners (Enrolments in trainer's courses)
  const { count: activeLearners } = await supabase
    .from('course_enrolments')
    .select('id, courses!inner(programmes!inner(trainer_workspace_id))', { count: 'exact', head: true })
    .eq('courses.programmes.trainer_workspace_id', workspaceId)
    .eq('status', 'in_progress');

  // Upcoming Sessions
  const { count: upcomingSessions } = await supabase
    .from('live_classes')
    .select('*', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .gte('scheduled_at', new Date().toISOString());
    
  return {
    activeCourses: activeCourses || 0,
    activeLearners: activeLearners || 0,
    upcomingSessions: upcomingSessions || 0,
    pendingAssessments: 0, // Placeholder until assessments table is fully integrated
    pendingAssignments: 0, 
    averageCompletion: 0,
    attendanceRate: 0
  };
}

export async function getTrainerTodaysActivity() {
  const { trainerId } = await getTrainerWorkspace();
  const supabase = await createClient();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data } = await supabase
    .from('live_classes')
    .select('id, title, scheduled_at, duration_minutes, programmes(programme_name)')
    .eq('trainer_id', trainerId)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true });
    
  return data || [];
}
