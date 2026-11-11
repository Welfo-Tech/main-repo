import { UserRole } from "@repo/db";
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum([UserRole.ADMIN, UserRole.OPERATIONS, UserRole.FINANCE]),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  isActive: z.boolean().optional(),
});

export const ListUsersQuerySchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.enum(["true", "false"]).transform(v => v === "true").optional(),
});
