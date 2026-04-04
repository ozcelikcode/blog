import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("./data/blog.db"),
  SITE_URL: z.url().default("http://localhost:4321"),
});

export type ServerEnv = z.infer<typeof envSchema>;

export function getServerEnv(): ServerEnv {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SITE_URL: process.env.SITE_URL,
  });
}
