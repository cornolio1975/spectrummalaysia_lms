"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { CourseFormData, courseSchema, moduleSchema, lessonSchema, contentSchema } from "@/lib/validations/course";

export async function getCourses(filters?: { category?: string; status?: string; search?: string; includeArchived?: boolean }) {
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

  // Exclude archived courses by default from public and learner queries
  if (!filters?.includeArchived && filters?.status !== "archived") {
    query = query.neq("status", "archived").eq("is_archived", false);
  }

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
  revalidatePath("/catalogue");
  
  // Revalidate SpectrumMY-WEB landing page
  await revalidateSpectrumWeb();
  
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
  revalidatePath("/catalogue");
  
  // Revalidate SpectrumMY-WEB landing page
  await revalidateSpectrumWeb();
  
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
  revalidatePath("/catalogue");
  
  // Revalidate SpectrumMY-WEB landing page
  await revalidateSpectrumWeb();
  
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

export async function getCurriculumOverviewData() {
  const supabase = await createClient();

  // 1. Fetch all programmes
  const { data: programmes, error: progErr } = await supabase
    .from("programmes")
    .select("id, programme_code, programme_name, category, status")
    .is("deleted_at", null)
    .order("programme_code");

  if (progErr) {
    console.error("Error fetching programmes:", progErr);
  }

  // 2. Fetch all training categories
  const { data: categories, error: catErr } = await supabase
    .from("training_categories")
    .select("id, name, code, description")
    .order("name");

  if (catErr) {
    console.error("Error fetching categories:", catErr);
  }

  // 3. Fetch all courses with full hierarchical counts and relations
  const { data: courses, error: courseErr } = await supabase
    .from("courses")
    .select(`
      id,
      course_code,
      title,
      description,
      category,
      category_id,
      level,
      level_designation,
      learning_hours,
      contact_hours,
      self_study_hours,
      assessment_hours,
      learning_objectives,
      learning_outcomes,
      prerequisites,
      min_pass_score,
      attendance_required_pct,
      status,
      is_archived,
      archived_at,
      updated_at,
      created_at,
      programme_id,
      trainer_id,
      programmes (
        id,
        programme_code,
        programme_name,
        category
      ),
      training_categories (
        id,
        name,
        code
      ),
      trainers (
        id,
        name,
        email,
        specialization
      ),
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
          course_contents (
            id,
            title,
            content_type,
            content_body
          )
        )
      ),
      practical_assessments (
        id,
        title,
        instructions,
        max_score,
        pass_mark,
        rubrics
      )
    `)
    .is("deleted_at", null)
    .order("course_code");

  if (courseErr) {
    console.error("Error fetching courses for curriculum overview:", courseErr);
    return { error: courseErr.message, programmes: [], categories: [], courses: [] };
  }

  // Calculate deep instructional completeness & 8-stage governance review states
  const processedCourses = (courses || []).map((c: any) => {
    const modules = c.course_modules || [];
    const lessons = modules.flatMap((m: any) => m.course_lessons || []);
    const contents = lessons.flatMap((l: any) => l.course_contents || []);
    const practicals = c.practical_assessments || [];

    const quizzes = contents.filter((ct: any) => ct.content_type === "quiz");
    const trainerGuides = contents.filter(
      (ct: any) =>
        ct.content_body &&
        (ct.content_body.includes("Trainer Delivery Guide") ||
          ct.content_body.includes("Teaching Notes") ||
          ct.content_body.includes("delivery guide") ||
          ct.content_body.includes("TRAINER DELIVERY MANUAL"))
    );
    const learnerContents = contents.filter(
      (ct: any) =>
        ct.content_type === "reading" ||
        ct.content_type === "video" ||
        ct.content_type === "assignment" ||
        (ct.content_body && (ct.content_body.includes("Learner") || ct.content_body.includes("exercise-card") || ct.content_body.includes("Guided Activity")))
    );

    const hasInfo = Boolean(
      c.title &&
        ((c.learning_objectives && c.learning_objectives.length > 0) ||
          (c.learning_outcomes && c.learning_outcomes.length > 0))
    );
    const hasModules = modules.length > 0;
    const hasLessons = lessons.length > 0;
    const hasSubstantiveContent = contents.filter((ct: any) => ct.content_body && ct.content_body.trim().length >= 100).length > 0;
    const hasAssessment = practicals.length > 0 || quizzes.length > 0;
    const hasTrainerGuide = trainerGuides.length > 0;
    const hasLearnerContent = learnerContents.length > 0 || contents.length > 0;
    const isArchived = Boolean(c.is_archived || c.status === "archived");

    // Check if course requires certified subject-matter expert review
    const progCode = c.programmes?.programme_code || "";
    const isGlcp = progCode === "PROG-NADI-GLCP-2027";
    const isOshOrCyber = c.course_code === "NG-OSH-L2-2027" || c.course_code === "NG-CYBER-L2-2027";
    const isMaxisLegal = c.course_code === "CRS-MFP-08";
    const isTextAwaiting =
      (c.description && c.description.includes("Awaiting Subject-Matter Review")) ||
      c.title.includes("Awaiting");
    const isSmeRequired = !isArchived && (isGlcp || isOshOrCyber || isMaxisLegal || isTextAwaiting);

    // Compute standard 8 review states
    // 1. Not Started | 2. Structure Created | 3. Content In Progress | 4. Content Complete
    // 5. SME Review Required | 6. Approved for Publication | 7. Published | 8. Archived / Legacy
    let review_state:
      | "Not Started"
      | "Structure Created"
      | "Content In Progress"
      | "Content Complete"
      | "SME Review Required"
      | "Approved for Publication"
      | "Published"
      | "Archived / Legacy" = "Not Started";

    if (isArchived) {
      review_state = "Archived / Legacy";
    } else if (c.status === "published") {
      review_state = "Published";
    } else if (!hasModules) {
      review_state = "Not Started";
    } else if (!hasLessons || !hasSubstantiveContent) {
      review_state = "Structure Created";
    } else if (!hasTrainerGuide || !hasAssessment) {
      review_state = "Content In Progress";
    } else if (isSmeRequired) {
      review_state = "SME Review Required";
    } else {
      review_state = "Content Complete";
    }

    // Completeness badge rating (separate from publication lifecycle)
    let completeness: "Complete" | "Incomplete" | "Review Required" | "Not Verified" | "Archived" = "Incomplete";
    if (isArchived) {
      completeness = "Archived";
    } else if (review_state === "SME Review Required") {
      completeness = "Review Required";
    } else if (hasInfo && hasModules && hasLessons && hasSubstantiveContent && hasAssessment && hasTrainerGuide) {
      completeness = "Complete";
    } else if (!hasModules) {
      completeness = "Not Verified";
    }

    const checklist = {
      course_info: hasInfo,
      modules: hasModules,
      lessons: hasLessons,
      learner_content: hasLearnerContent,
      trainer_guidance: hasTrainerGuide,
      assessments: hasAssessment,
      learning_hours: Boolean(c.learning_hours || c.contact_hours),
      sme_reviewed: !isSmeRequired,
      is_archived: isArchived,
    };

    return {
      ...c,
      is_archived: isArchived,
      modules_count: modules.length,
      lessons_count: lessons.length,
      contents_count: contents.length,
      quizzes_count: quizzes.length,
      practical_assessments_count: practicals.length,
      trainer_guides_count: trainerGuides.length,
      learner_contents_count: learnerContents.length,
      completeness,
      review_state,
      sme_status: isSmeRequired ? "Pending Review" : "Approved",
      checklist,
    };
  });

  return {
    programmes: programmes || [],
    categories: categories || [],
    courses: processedCourses,
  };
}

export async function updateCourseCategory(courseId: string, categoryId: string | null) {
  const supabase = await createClient();

  let categoryName: string | null = null;
  if (categoryId) {
    const { data: cat } = await supabase
      .from("training_categories")
      .select("name")
      .eq("id", categoryId)
      .single();
    if (cat) categoryName = cat.name;
  }

  const { data, error } = await supabase
    .from("courses")
    .update({
      category_id: categoryId,
      ...(categoryName ? { category: categoryName } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", courseId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/courses");
  return { data };
}

export async function bulkAssignCategory(courseIds: string[], categoryId: string | null) {
  const supabase = await createClient();

  let categoryName: string | null = null;
  if (categoryId) {
    const { data: cat } = await supabase
      .from("training_categories")
      .select("name")
      .eq("id", categoryId)
      .single();
    if (cat) categoryName = cat.name;
  }

  const { data, error } = await supabase
    .from("courses")
    .update({
      category_id: categoryId,
      ...(categoryName ? { category: categoryName } : {}),
      updated_at: new Date().toISOString(),
    })
    .in("id", courseIds)
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/courses");
  return { data };
}

export async function bulkUpdateStatus(courseIds: string[], status: "draft" | "published" | "archived") {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .in("id", courseIds)
    .select();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/courses");
  return { data };
}

// Helper function to auto-update SpectrumMY-WEB landing page
async function revalidateSpectrumWeb() {
  try {
    const landingUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || "https://spectrummalaysia.org";
    await fetch(`${landingUrl}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: "courses" }),
    });
  } catch (error) {
    console.error("Failed to revalidate SpectrumMY-WEB:", error);
  }
}


