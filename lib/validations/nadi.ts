import { z } from "zod";

export const nadiSchema = z.object({
  entity_name: z.string().optional(),
  phase: z.string().optional(),
  state_id: z.string().uuid("Invalid state selected"),
  site_name: z.string().min(3, "Site Name must be at least 3 characters").max(100),
  ref_id: z.string().min(3, "RefID must be at least 3 characters").max(50),
  region: z.string().optional(),
  tp_dusp: z.string().optional(),
  contact_person: z.string().optional(),
  status: z.string().default("In Operation"),
});

export type NadiFormData = z.infer<typeof nadiSchema>;
