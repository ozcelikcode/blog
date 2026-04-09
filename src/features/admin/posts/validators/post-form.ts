import { z } from "zod";

import { ADMIN_POST_STATUSES } from "@/features/admin/types";
import { slugify } from "@/lib/utils/slugify";

import type { AdminFormState } from "@/features/admin/utils/form-state";

const relativeOrAbsoluteUrlSchema = z
  .string()
  .trim()
  .refine((value) => value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"), {
    message: "Enter a relative path or absolute URL.",
  });

const postSchema = z.object({
  authorId: z.coerce.number().int().positive("Select an author."),
  canonicalUrl: z.union([z.literal(""), relativeOrAbsoluteUrlSchema]).transform((value) => value || null),
  contentMarkdown: z.string().trim().min(1, "Content is required."),
  coverImageUrl: z.union([z.literal(""), relativeOrAbsoluteUrlSchema]).transform((value) => value || null),
  excerpt: z.string().trim().min(12, "Excerpt must be at least 12 characters.").max(320),
  intent: z.enum(["delete", "publish-now", "save", "save-draft", "schedule", "unpublish"]),
  isFeatured: z.boolean(),
  postId: z.coerce.number().int().positive().optional(),
  publishedAt: z.string().trim(),
  showAuthorInMeta: z.boolean(),
  seoDescription: z.string().trim().max(320).optional(),
  seoTitle: z.string().trim().max(160).optional(),
  slug: z
    .string()
    .trim()
    .min(3, "Slug must be at least 3 characters.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens."),
  status: z.enum(ADMIN_POST_STATUSES),
  tagIds: z.array(z.coerce.number().int().positive()).default([]),
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(160),
});

export type PostFormValues = {
  authorId: string;
  canonicalUrl: string;
  contentMarkdown: string;
  coverImageUrl: string;
  excerpt: string;
  intent: string;
  isFeatured: boolean;
  postId?: string | undefined;
  publishedAt: string;
  showAuthorInMeta: boolean;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: string;
  tagIds: string[];
  title: string;
};

export interface PostMutationInput {
  authorId: number;
  canonicalUrl: string | null;
  contentMarkdown: string;
  coverImageUrl: string | null;
  excerpt: string;
  intent: "delete" | "publish-now" | "save" | "save-draft" | "schedule" | "unpublish";
  isFeatured: boolean;
  postId?: number | undefined;
  publishedAt: string | null;
  showAuthorInMeta: boolean;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  status: "draft" | "published" | "scheduled";
  tagIds: number[];
  title: string;
}

function buildValues(formData: FormData): PostFormValues {
  const rawTitle = String(formData.get("title") ?? "");
  const rawSlug = String(formData.get("slug") ?? "");

  return {
    authorId: String(formData.get("authorId") ?? ""),
    canonicalUrl: String(formData.get("canonicalUrl") ?? ""),
    contentMarkdown: String(formData.get("contentMarkdown") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    intent: String(formData.get("intent") ?? "save"),
    isFeatured: formData.get("isFeatured") === "on",
    postId: typeof formData.get("postId") === "string" ? String(formData.get("postId")) : undefined,
    publishedAt: String(formData.get("publishedAt") ?? ""),
    showAuthorInMeta: formData.get("showAuthorInMeta") === "on",
    seoDescription: String(formData.get("seoDescription") ?? ""),
    seoTitle: String(formData.get("seoTitle") ?? ""),
    slug: rawSlug || slugify(rawTitle),
    status: String(formData.get("status") ?? "draft"),
    tagIds: formData.getAll("tagIds").map((value) => String(value)),
    title: rawTitle,
  };
}

export function validatePostForm(formData: FormData): AdminFormState<PostFormValues> & {
  parsed?: PostMutationInput;
} {
  const values = buildValues(formData);
  const parsed = postSchema.safeParse({
    ...values,
    isFeatured: values.isFeatured,
    postId: values.postId,
    tagIds: values.tagIds,
  });

  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      ),
      ok: false,
      values,
    };
  }

  if (parsed.data.intent === "schedule") {
    if (!parsed.data.publishedAt) {
      return {
        fieldErrors: {
          publishedAt: "Choose a publish date and time.",
        },
        ok: false,
        values,
      };
    }

    if (new Date(parsed.data.publishedAt).toISOString() <= new Date().toISOString()) {
      return {
        fieldErrors: {
          publishedAt: "Scheduled posts must be set in the future.",
        },
        ok: false,
        values,
      };
    }
  }

  return {
    ok: true,
    parsed: {
      ...parsed.data,
      publishedAt: parsed.data.publishedAt ? new Date(parsed.data.publishedAt).toISOString() : null,
      seoDescription: parsed.data.seoDescription || null,
      seoTitle: parsed.data.seoTitle || null,
    },
    values,
  };
}
