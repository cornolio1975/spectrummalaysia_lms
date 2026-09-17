import { createClient } from "@/utils/supabase/server";
import { MyLearningClient } from "@/components/learning/my-learning-client";

export const metadata = {
  title: "My Learning Portal | SpectrumMY",
  description: "Learner personal dashboard tracking enrolled courses, practical submissions, and credential pathways.",
};

export default async function MyLearningPage() {
  const supabase = await createClient();

  const [enrolmentsRes, submissionsRes, issuancesRes, credentialsRes] = await Promise.all([
    supabase
      .from("course_enrolments")
      .select(`
        *,
        courses (*)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("practical_submissions")
      .select(`
        *,
        practical_assessments (*)
      `)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("credential_issuances")
      .select(`
        *,
        credentials (*)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("credentials")
      .select("*")
      .eq("status", "active")
      .order("learning_hours", { ascending: true }),
  ]);

  const enrolments = enrolmentsRes.data || [];
  const submissions = submissionsRes.data || [];
  const credentialsEarned = issuancesRes.data || [];
  const availableCredentials = credentialsRes.data || [];

  return (
    <MyLearningClient
      enrolments={enrolments}
      submissions={submissions}
      credentialsEarned={credentialsEarned}
      availableCredentials={availableCredentials}
    />
  );
}
