import { z } from "zod";

export const CreateTechnicianSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  employeeId: z.string().min(1).max(50),
  phone: z.string().max(50).optional(),
  specializations: z.array(z.string()).optional(),
});

export const UpdateTechnicianSchema = z.object({
  phone: z.string().max(50).optional(),
  specializations: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const ListTechniciansQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  specialization: z.string().optional(),
});
