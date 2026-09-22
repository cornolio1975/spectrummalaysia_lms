import { notFound } from "next/navigation";
import { getCourseById } from "@/app/actions/courses";
import { getLearnerWorkspace } from "@/services/learner-workspace";
import CatalogueDetailClient from "@/components/learning/catalogue-detail-client";
import { createClient } from "@/utils/supabase/server";

export const metadata = {
  title: "Course Details | SpectrumMY LMS",
  description: "View course details and enroll in the learning pathway.",
};

export default async function CatalogueCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { participantId } = await getLearnerWorkspace();
  const res = await getCourseById(id);

  if (res.error || !res.data) {
    notFound();
  }

  const course = res.data;

  // Check if the user is already enrolled
  let isEnrolled = false;
  if (participantId) {
    const supabase = await createClient();
    const { data: enrolment } = await supabase
      .from("course_enrolments")
      .select("id")
      .eq("course_id", id)
      .eq("participant_id", participantId)
      .maybeSingle();

    if (enrolment) {
      isEnrolled = true;
    }
  }

  return (
    <CatalogueDetailClient 
      course={course} 
      participantId={participantId} 
      isEnrolled={isEnrolled} 
    />
  );
}
