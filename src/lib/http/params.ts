import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const integerIdSchema = z.coerce.number().int().positive();

export function parseSlugParam(value: string | undefined, label = "slug"): string {
  return slugSchema.parse(value ?? "", {
    error: () => `Invalid ${label}.`,
  });
}

export function parsePositiveIntParam(value: string | undefined, label = "id"): number {
  return integerIdSchema.parse(value ?? "", {
    error: () => `Invalid ${label}.`,
  });
}

export function parseOptionalPositiveIntParam(value: string | null | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
