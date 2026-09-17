import { z } from "zod";

export const credentialSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  credential_code: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  credential_type: z.enum([
    "certificate_of_completion",
    "certificate_of_achievement",
    "micro_credential",
    "competency_credential",
    "digital_badge",
    "workshop_certificate",
    "attendance_certificate",
    "stacked_micro_credential",
    "custom_credential",
  ]).default("micro_credential"),
  level: z.string().default("Level 3 - Intermediate"),
  learning_hours: z.number().min(1).default(12),
  approval_workflow: z.enum([
    "automatic",
    "trainer_approval",
    "trainer_and_admin_approval",
  ]).default("automatic"),
  expiry_months: z.number().int().min(0).default(24),
  certificate_template_id: z.string().uuid().optional().nullable(),
  badge_config: z.record(z.string(), z.any()).default({ color: "#0ea5e9", icon: "Award", shape: "hexagon" }),
  is_active: z.boolean().default(true),
});

export type CredentialFormData = z.input<typeof credentialSchema>;

export const requirementSchema = z.object({
  credential_id: z.string().uuid(),
  requirement_type: z.enum([
    "course_completion",
    "module_completion",
    "lesson_completion",
    "video_completion",
    "assessment_pass",
    "minimum_score",
    "assignment_completion",
    "practical_assessment",
    "trainer_approval",
    "admin_approval",
    "minimum_learning_hours",
    "competency_achieved",
    "skill_level_achieved",
    "prerequisite_credential",
    "minimum_attendance",
  ]),
  course_id: z.string().uuid().optional().nullable(),
  programme_id: z.string().uuid().optional().nullable(),
  min_score: z.number().min(0).max(100).optional().nullable(),
  min_attendance_pct: z.number().min(0).max(100).optional().nullable(),
  min_hours: z.number().min(0).optional().nullable(),
  competency_id: z.string().uuid().optional().nullable(),
  logic_group: z.string().default("AND_1"),
  is_mandatory: z.boolean().default(true),
  description: z.string().optional().nullable(),
});

export type RequirementFormData = z.infer<typeof requirementSchema>;

export const learningOutcomeSchema = z.object({
  credential_id: z.string().uuid(),
  outcome_code: z.string().min(1),
  description: z.string().min(5),
  skill_id: z.string().uuid().optional().nullable(),
  competency_id: z.string().uuid().optional().nullable(),
  assessment_method: z.string().default("practical_rubric"),
  is_required: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export type LearningOutcomeFormData = z.infer<typeof learningOutcomeSchema>;
