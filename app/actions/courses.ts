"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CourseFormData, courseSchema, moduleSchema, lessonSchema, contentSchema } from "@/lib/validations/course";

export async function getCourses(filters?: { category?: string; status?: string; search?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("courses")
    .select(`
      *,
      trainers (name, specialization),
      course_modules (id, title, sort_order)
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.ilike("title", `%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching courses:", error);
    return { error: error.message };
  }

  return { data: data || [] };
}

export async function getCourseById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select(`
      *,
      trainers (id, name, specialization, email),
      course_modules (
        id,
        title,
        description,
        sort_order,
        course_lessons (
          id,
          title,
          description,
          duration_min,
          is_mandatory,
          sort_order,
          course_contents (*)
        )
      ),
      practical_assessments (*)
    `)
    .eq("id", id)
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

export async function createCourse(formData: CourseFormData) {
  const parsed = courseSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("courses")
    .insert([{
      ...parsed.data,
      created_by: user.user?.id,
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating course:", error);
    return { error: error.message };
  }

  revalidatePath("/courses");
  return { data };
}

export async function updateCourse(id: string, formData: CourseFormData) {
  const parsed = courseSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: "Invalid form data", details: parsed.error.format() };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating course:", error);
    return { error: error.message };
  }

  revalidatePath(`/courses/${id}`);
  revalidatePath("/courses");
  return { data };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("courses")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/courses");
  return { success: true };
}

export async function addCourseModule(courseId: string, title: string, description?: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_modules")
    .insert([{
      course_id: courseId,
      title,
      description,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  return { data };
}

export async function addCourseLesson(moduleId: string, courseId: string, title: string, durationMin: number = 30) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_lessons")
    .insert([{
      module_id: moduleId,
      title,
      duration_min: durationMin,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  return { data };
}

export async function addLessonContent(lessonId: string, courseId: string, payload: {
  title: string;
  contentType: string;
  contentBody?: string;
  fileUrl?: string;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_contents")
    .insert([{
      lesson_id: lessonId,
      title: payload.title,
      content_type: payload.contentType,
      content_body: payload.contentBody,
      file_url: payload.fileUrl,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  return { data };
}

export async function enrollParticipantInCourse(courseId: string, participantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("course_enrolments")
    .upsert({
      course_id: courseId,
      participant_id: participantId,
      status: "in_progress",
      enrolled_at: new Date().toISOString(),
    }, { onConflict: "course_id, participant_id" })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/my-learning");
  return { data };
}

export async function completeCourseLesson(courseId: string, lessonId: string, participantId: string) {
  const supabase = await createClient();

  // 1. Mark lesson as completed
  await supabase
    .from("course_lesson_progress")
    .upsert({
      course_id: courseId,
      lesson_id: lessonId,
      participant_id: participantId,
      is_completed: true,
      completed_at: new Date().toISOString(),
      last_accessed_at: new Date().toISOString(),
    }, { onConflict: "lesson_id, participant_id" });

  // 2. Calculate new percentage
  const { data: allLessons } = await supabase
    .from("course_lessons")
    .select("id, course_modules!inner(course_id)")
    .eq("course_modules.course_id", courseId);

  const totalLessons = allLessons?.length || 1;

  const { data: completedLessons } = await supabase
    .from("course_lesson_progress")
    .select("id")
    .eq("course_id", courseId)
    .eq("participant_id", participantId)
    .eq("is_completed", true);

  const completedCount = completedLessons?.length || 0;
  const progressPct = Math.min(100, Math.round((completedCount / totalLessons) * 100));

  // 3. Update course_enrolments
  await supabase
    .from("course_enrolments")
    .upsert({
      course_id: courseId,
      participant_id: participantId,
      progress_pct: progressPct,
      status: progressPct >= 100 ? "completed" : "in_progress",
      completed_at: progressPct >= 100 ? new Date().toISOString() : null,
    }, { onConflict: "course_id, participant_id" });

  let certificateResult: any = null;
  if (progressPct >= 100) {
    try {
      const { evaluateMC001CertificateEligibility, issueMC001Certificate } = await import("@/services/certificate-engine");
      const evalResult = await evaluateMC001CertificateEligibility(participantId);
      if (evalResult.isEligible) {
        certificateResult = await issueMC001Certificate({
          participantId,
          courseId,
          issuedBy: "SYSTEM_AUTOMATION",
        });
      }
    } catch (certErr) {
      console.error("Auto certificate issuance check failed:", certErr);
    }
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/my-learning");
  revalidatePath("/wallet");
  revalidatePath("/certificates");
  return { progressPct, certificateResult };
}
