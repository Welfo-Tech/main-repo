import { z } from "zod";

export const TrackQuerySchema = z.object({
  ref: z.string().min(3).max(32),
  email: z.string().email(),
});
