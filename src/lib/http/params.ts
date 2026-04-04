import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export function parseSlugParam(value: string | undefined, label = "slug"): string {
  return slugSchema.parse(value ?? "", {
    error: () => `Invalid ${label}.`,
  });
}
