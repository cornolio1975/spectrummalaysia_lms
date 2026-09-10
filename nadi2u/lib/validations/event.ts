import { z } from "zod";

export const eventSchema = z.object({
  programme_id: z.string().uuid("Please select a programme"),
  nadi_id: z.string().uuid("Please select a NADI site"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "scheduled", "registration_open", "registration_closed", "in_progress", "completed", "cancelled"]).default("draft"),
  capacity: z.number().min(1, "Capacity must be at least 1").default(30),
});

export type EventFormData = z.infer<typeof eventSchema>;

export const sessionSchema = z.object({
  session_name: z.string().min(3, "Session name must be at least 3 characters"),
  session_date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  trainer_id: z.string().uuid("Please select a trainer").optional().or(z.literal("")),
  status: z.enum(["draft", "scheduled", "in_progress", "completed", "cancelled"]).default("draft"),
});

export type SessionFormData = z.infer<typeof sessionSchema>;
