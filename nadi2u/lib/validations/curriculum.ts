import { z } from "zod";

export const moduleSchema = z.object({
  module_code: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().optional(),
  sort_order: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;

export const lessonSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  description: z.string().optional(),
  duration_min: z.number().int().min(1).optional(),
  sort_order: z.number().int().min(0).default(0),
  is_mandatory: z.boolean().default(true),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
