import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  course_code: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).default("Intermediate"),
  learning_hours: z.number().min(0.5, "Learning hours must be at least 30 minutes").default(10),
  trainer_id: z.string().uuid().optional().nullable(),
  programme_id: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "review", "published", "active", "completed", "archived"]).default("draft"),
  thumbnail_url: z.string().url().optional().or(z.literal("")).nullable(),
  prerequisites: z.string().optional().nullable(),
  attendance_required_pct: z.number().min(0).max(100).default(80),
  min_pass_score: z.number().min(0).max(100).default(70),
});

export type CourseFormData = z.infer<typeof courseSchema>;

export const moduleSchema = z.object({
  course_id: z.string().uuid(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
  sort_order: z.number().int().default(0),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional().nullable(),
  duration_min: z.number().int().min(1).default(30),
  is_mandatory: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type LessonFormData = z.infer<typeof lessonSchema>;

export const contentSchema = z.object({
  lesson_id: z.string().uuid(),
  title: z.string().min(2, "Title is required"),
  content_type: z.enum(["video", "pdf", "document", "text", "audio", "quiz", "practical"]),
  content_body: z.string().optional().nullable(),
  file_url: z.string().optional().nullable(),
  file_name: z.string().optional().nullable(),
  file_size: z.number().optional().nullable(),
  duration_sec: z.number().optional().nullable(),
  is_required: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type ContentFormData = z.infer<typeof contentSchema>;
