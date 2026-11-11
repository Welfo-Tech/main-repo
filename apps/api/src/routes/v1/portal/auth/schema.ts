import { z } from "zod";

export const portalLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const portalRefreshSchema = z.object({
  refreshToken: z.string().min(1),
});
