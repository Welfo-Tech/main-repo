import { zValidator } from "@hono/zod-validator";
import type { z } from "zod";

export function validate<T extends z.ZodTypeAny>(
  target: "json" | "query" | "param",
  schema: T,
) {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      const message =
        result.error.issues[0]?.message ?? "invalid request body";
      return c.json({ error: message }, 400);
    }
  });
}
