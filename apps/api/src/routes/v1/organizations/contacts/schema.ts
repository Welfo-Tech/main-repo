import { z } from "zod";

export const CreateContactSchema = z.object({
  name: z.string().min(1).max(255),
  designation: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().max(50).optional(),
  isPrimary: z.boolean().optional(),
});

export const UpdateContactSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  designation: z.string().max(100).nullable().optional(),
  email: z.string().email().max(255).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  isPrimary: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
