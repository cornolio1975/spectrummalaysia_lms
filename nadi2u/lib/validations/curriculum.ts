import { z } from "zod";

export const moduleSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().optional(),
  sequence: z.number().int().min(1).default(1),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().optional(),
  content_type: z.enum(["video", "pdf", "powerpoint", "word", "image", "audio", "text", "external", "activity", "quiz", "assessment"]).default("video"),
  duration_minutes: z.number().int().min(1).optional(),
  sequence: z.number().int().min(1).default(1),
  is_required: z.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
