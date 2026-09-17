import { z } from "zod";

export const rplApplicationSchema = z.object({
  participant_id: z.string().uuid(),
  target_course_id: z.string().uuid().optional().nullable(),
  target_credential_id: z.string().uuid().optional().nullable(),
  experience_summary: z.string().min(20, "Please provide detailed experience summary (min 20 characters)"),
  years_of_experience: z.number().min(0.5, "Experience must be at least 6 months").default(1),
  portfolio_url: z.string().url().optional().or(z.literal("")).nullable(),
});

export type RPLApplicationFormData = z.infer<typeof rplApplicationSchema>;

export const rplEvidenceSchema = z.object({
  rpl_application_id: z.string().uuid(),
  title: z.string().min(2, "Evidence title required"),
  evidence_type: z.enum(["certificate", "work_sample", "letter_of_employment", "video", "transcript"]),
  file_url: z.string().url("Valid URL or storage file path required"),
  file_name: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RPLEvidenceFormData = z.infer<typeof rplEvidenceSchema>;
