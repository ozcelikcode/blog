import { z } from "zod";

import { slugify } from "@/lib/utils/slugify";

import type { AdminFormState } from "@/features/admin/utils/form-state";

const tagSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  tagId: z.coerce.number().int().positive().optional(),
});

export interface TagFormValues {
  name: string;
  slug: string;
  tagId?: string | undefined;
}

export interface TagMutationInput {
  name: string;
  slug: string;
  tagId?: number | undefined;
}

export function validateTagForm(formData: FormData): AdminFormState<TagFormValues> & {
  parsed?: TagMutationInput;
} {
  const values: TagFormValues = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? "") || slugify(String(formData.get("name") ?? "")),
    tagId: typeof formData.get("tagId") === "string" ? String(formData.get("tagId")) : undefined,
  };

  const parsed = tagSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      ),
      ok: false,
      values,
    };
  }

  return {
    ok: true,
    parsed: parsed.data,
    values,
  };
}
