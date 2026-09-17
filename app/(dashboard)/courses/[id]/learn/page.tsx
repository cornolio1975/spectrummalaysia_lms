import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getCourseById } from "@/app/actions/courses";
import CourseLearnClient from "@/components/courses/course-learn-client";

export default async function CourseLearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lessonId?: string }>;
}) {
  const { id } = await params;
  const { lessonId } = await searchParams;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const res = await getCourseById(id);
  if (res.error || !res.data) {
    notFound();
  }

  // Find or create participant record for current user
  let participantId = "";
  const { data: part } = await supabase
    .from("participants")
    .select("id")
    .eq("email", authData.user.email)
    .maybeSingle();

  if (part) {
    participantId = part.id;
  } else {
    // Fallback to first participant in database or create
    const { data: firstPart } = await supabase
      .from("participants")
      .select("id")
      .limit(1)
      .maybeSingle();
    participantId = firstPart?.id || authData.user.id;
  }

  // Fetch current progress
  const { data: enrol } = await supabase
    .from("course_enrolments")
    .select("progress_pct")
    .eq("course_id", id)
    .eq("participant_id", participantId)
    .maybeSingle();

  return (
    <CourseLearnClient
      course={res.data}
      participantId={participantId}
      initialLessonId={lessonId}
      initialProgressPct={enrol?.progress_pct ? Number(enrol.progress_pct) : 0}
    />
  );
}
