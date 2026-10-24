import { z } from "zod";

function emptyAsUndefined<T extends z.ZodTypeAny>(inner: T) {
  return z.preprocess(v => (v === "" ? undefined : v), inner.optional());
}

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("7d"),
  SUPABASE_URL: emptyAsUndefined(z.string().url()),
  SUPABASE_SECRET_KEY: emptyAsUndefined(z.string().min(1)),
  SUPABASE_BUCKET: z.string().min(1).default("repair-images"),
  RESEND_API_KEY: emptyAsUndefined(z.string().min(1)),
  MAIL_FROM: z.string().min(1).default("Welfo Service <onboarding@resend.dev>"),
  MAIL_REPLY_TO: emptyAsUndefined(z.string().email()),
  APP_TECH_URL: z.string().min(1).default("http://localhost:3003"),
});

export const config = schema.parse(process.env);
