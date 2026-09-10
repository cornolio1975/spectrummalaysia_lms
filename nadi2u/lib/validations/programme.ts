import { z } from "zod";

export const programmeSchema = z.object({
  programme_code: z.string().min(3).max(20),
  programme_name: z.string().min(3).max(100),
  description: z.string().optional(),
  category: z.string().optional(),
  target_age_group: z.string().optional(),
  target_gender: z.enum(["all", "male", "female"]).default("all"),
  status: z.enum(["draft", "published", "active", "completed", "archived"]).default("draft"),
  certificate_enabled: z.boolean().default(true),
  completion_percentage_required: z.number().min(0).max(100).default(80),
});

export type ProgrammeFormData = z.infer<typeof programmeSchema>;
