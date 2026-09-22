import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getLearnerSkills } from "@/app/actions/skills";
import { getLearnerWalletCredentials } from "@/app/actions/credentials";
import { getLearnerInterventions } from "@/app/actions/interventions";
import { getCourses } from "@/app/actions/courses";
import { LearnerProfile360Client } from "@/components/learner-360/learner-profile-360-client";

export const metadata = {
  title: "Learner 360° Profile | SpectrumMY",
  description: "Comprehensive learner 360 profile with attendance, progress, competencies, and interventions.",
};

export default async function Learner360ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [participantRes, enrolmentsRes, skillsRes, credentialsRes, interventionsRes, coursesRes] =
    await Promise.all([
      supabase
        .from("participants")
        .select(`
          *,
          states (state_name),
          nadi_sites (site_name)
        `)
        .eq("id", id)
        .single(),
      supabase
        .from("course_enrolments")
        .select(`
          *,
          courses (*)
        `)
        .eq("participant_id", id),
      getLearnerSkills(id),
      getLearnerWalletCredentials(id),
      getLearnerInterventions(id),
      getCourses(),
    ]);

  if (participantRes.error || !participantRes.data) {
    notFound();
  }

  const participant = participantRes.data;
  const enrolments = enrolmentsRes.data || [];
  const skillsData = skillsRes.data || { skills: [], competencies: [] };
  const credentials = credentialsRes.data || [];
  const interventions = interventionsRes.data || [];
  const courses = (coursesRes.data || []).map((c: any) => ({
    id: c.id,
    title: c.title,
    course_code: c.course_code,
  }));

  return (
    <LearnerProfile360Client
      participant={participant}
      enrolments={enrolments}
      skillsData={skillsData}
      credentials={credentials}
      interventions={interventions}
      courses={courses}
    />
  );
}
