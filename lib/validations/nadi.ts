import { z } from "zod";

export const nadiSchema = z.object({
  nadi_code: z.string().min(3, "Code must be at least 3 characters").max(20),
  nadi_name: z.string().min(3, "Name must be at least 3 characters").max(100),
  state_id: z.string().uuid("Invalid state selected"),
  address: z.string().optional(),
  district: z.string().optional(),
  postcode: z.string().optional(),
  contact_person: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type NadiFormData = z.infer<typeof nadiSchema>;
