import { createClient } from "@/utils/supabase/server";
import CourseBuilderClient from "@/components/courses/course-builder-client";

export default async function NewCoursePage() {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("training_categories")
    .select("id, name, code")
    .order("name");

  const { data: trainers } = await supabase
    .from("trainers")
    .select("id, name")
    .eq("status", "active")
    .order("name");

  return (
    <CourseBuilderClient
      categories={categories || []}
      trainers={trainers || []}
    />
  );
}
