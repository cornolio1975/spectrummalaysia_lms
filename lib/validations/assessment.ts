import { z } from "zod";

export const practicalAssessmentSchema = z.object({
  course_id: z.string().uuid().optional().nullable(),
  programme_id: z.string().uuid().optional().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
  required_evidence_types: z.array(z.string()).default(["document", "photo", "video"]),
  rubrics: z.array(
    z.object({
      criterion: z.string().min(1, "Criterion title required"),
      max_points: z.number().min(1),
      description: z.string().optional(),
    })
  ).min(1, "At least one rubric criterion is required"),
  max_score: z.number().min(1).default(100),
  pass_mark: z.number().min(1).max(100).default(70),
  due_date: z.string().optional().nullable(),
});

export type PracticalAssessmentFormData = z.infer<typeof practicalAssessmentSchema>;

export const practicalSubmissionSchema = z.object({
  assessment_id: z.string().uuid(),
  participant_id: z.string().uuid(),
  evidence_urls: z.array(z.string().url()).min(1, "At least one evidence file or link required"),
  submission_notes: z.string().optional().nullable(),
});

export type PracticalSubmissionFormData = z.infer<typeof practicalSubmissionSchema>;

export const gradingSchema = z.object({
  submission_id: z.string().uuid(),
  score: z.number().min(0).max(100),
  is_competent: z.boolean(),
  rubric_evaluation: z.record(z.string(), z.number()).optional(),
  trainer_observation: z.string().min(5, "Trainer observation feedback is required"),
});

export type GradingFormData = z.infer<typeof gradingSchema>;
