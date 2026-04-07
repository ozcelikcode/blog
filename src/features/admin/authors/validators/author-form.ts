import { z } from "zod";

import type { AdminFormState } from "@/features/admin/utils/form-state";

const authorSchema = z.object({
  authorId: z.coerce.number().int().positive().optional(),
  avatarUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"), {
      message: "Enter a relative path or absolute URL.",
    }),
  bio: z.string().trim().max(500),
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
});

export interface AuthorFormValues {
  authorId?: string | undefined;
  avatarUrl: string;
  bio: string;
  name: string;
}

export interface AuthorMutationInput {
  authorId?: number | undefined;
  avatarUrl: string | null;
  bio: string | null;
  name: string;
}

export function validateAuthorForm(formData: FormData): AdminFormState<AuthorFormValues> & {
  parsed?: AuthorMutationInput;
} {
  const values: AuthorFormValues = {
    authorId: typeof formData.get("authorId") === "string" ? String(formData.get("authorId")) : undefined,
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    bio: String(formData.get("bio") ?? ""),
    name: String(formData.get("name") ?? ""),
  };

  const parsed = authorSchema.safeParse(values);

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
    parsed: {
      ...parsed.data,
      avatarUrl: parsed.data.avatarUrl || null,
      bio: parsed.data.bio || null,
    },
    values,
  };
}
