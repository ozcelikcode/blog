import type { APIContext } from "astro";

import { getDatabaseContext } from "@/lib/db/client";
import { getCurrentIsoTimestamp } from "@/lib/utils/dates";
import { assertCanDeleteRecords } from "@/lib/auth/session";
import { setFlashMessage } from "@/lib/sessions/flash";
import type { AdminSessionUser } from "@/features/admin/types";
import { listAdminMediaAssets } from "@/features/admin/media/repositories/admin-media-repository";
import type { AdminFormState } from "@/features/admin/utils/form-state";
import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import {
  countAdminPosts,
  deleteAdminPost,
  findAdminPostBySlug,
  getAdminPostById,
  insertAdminPost,
  listAdminAuthorOptions,
  listAdminPosts,
  listAdminTagOptions,
  replaceAdminPostTags,
  updateAdminPost,
} from "../repositories/admin-post-repository";
import type { PostFormValues, PostMutationInput } from "../validators/post-form";
import { validatePostForm } from "../validators/post-form";

export interface AdminPostsPageData {
  filters: {
    query: string;
    sort: "created-desc" | "published-desc" | "title-asc" | "updated-desc";
    status: "all" | "draft" | "published" | "scheduled";
  };
  items: ReturnType<typeof listAdminPosts>;
  totalItems: number;
  totalPages: number;
}

export interface AdminPostEditorPageData {
  authors: ReturnType<typeof listAdminAuthorOptions>;
  sessionAuthor: {
    email: string;
    id: number | null;
    name: string;
  } | null;
  mediaAssets: Array<{
    altText: string | null;
    fileName: string;
    id: number;
    publicUrl: string;
  }>;
  post: {
    authorId: string;
    canonicalUrl: string;
    contentMarkdown: string;
    coverImageUrl: string;
    excerpt: string;
    isFeatured: boolean;
    postId?: string;
    publishedAt: string;
    showAuthorInMeta: boolean;
    seoDescription: string;
    seoTitle: string;
    slug: string;
    status: "draft" | "published" | "scheduled";
    tagIds: string[];
    title: string;
  };
  tags: ReturnType<typeof listAdminTagOptions>;
}

function toEditorValues(post?: ReturnType<typeof getAdminPostById>): AdminPostEditorPageData["post"] {
  if (!post) {
    return {
      authorId: "",
      canonicalUrl: "",
      contentMarkdown: "",
      coverImageUrl: "",
      excerpt: "",
      isFeatured: false,
      publishedAt: "",
      showAuthorInMeta: true,
      seoDescription: "",
      seoTitle: "",
      slug: "",
      status: "draft",
      tagIds: [],
      title: "",
    };
  }

  return {
    authorId: String(post.authorId),
    canonicalUrl: post.canonicalUrl ?? "",
    contentMarkdown: post.contentMarkdown,
    coverImageUrl: post.coverImageUrl ?? "",
    excerpt: post.excerpt,
    isFeatured: post.isFeatured,
    postId: String(post.id),
    publishedAt: post.publishedAt ? post.publishedAt.slice(0, 16) : "",
    showAuthorInMeta: post.showAuthorInMeta,
    seoDescription: post.seoDescription ?? "",
    seoTitle: post.seoTitle ?? "",
    slug: post.slug,
    status: post.status,
    tagIds: post.tagIds.map(String),
    title: post.title,
  };
}

function resolvePreferredAuthorId(
  authors: ReturnType<typeof listAdminAuthorOptions>,
  actor?: AdminSessionUser,
): string {
  if (actor?.authorId && authors.some((author) => author.id === actor.authorId)) {
    return String(actor.authorId);
  }

  const matchedAuthor = actor
    ? authors.find((author) => author.label.toLowerCase() === actor.name.trim().toLowerCase())
    : undefined;

  return matchedAuthor ? String(matchedAuthor.id) : "";
}

function resolvePostPersistence(input: PostMutationInput): {
  actionLabel: string;
  publishedAt: string | null;
  status: "draft" | "published" | "scheduled";
} | { fieldErrors: { publishedAt: string } } {
  const now = getCurrentIsoTimestamp();

  if (input.intent === "save-draft" || input.intent === "unpublish") {
    return {
      actionLabel: input.intent === "unpublish" ? "posts.unpublish" : "posts.save_draft",
      publishedAt: null,
      status: "draft",
    };
  }

  if (input.intent === "publish-now") {
    return {
      actionLabel: "posts.publish",
      publishedAt: now,
      status: "published",
    };
  }

  if (input.intent === "schedule") {
    if (!input.publishedAt) {
      return {
        fieldErrors: {
          publishedAt: "Choose a schedule date and time.",
        },
      };
    }

    return {
      actionLabel: "posts.schedule",
      publishedAt: input.publishedAt,
      status: "scheduled",
    };
  }

  if (input.status === "published") {
    if (input.publishedAt && input.publishedAt > now) {
      return {
        fieldErrors: {
          publishedAt: "Future dates must use scheduled status.",
        },
      };
    }

    return {
      actionLabel: "posts.save",
      publishedAt: input.publishedAt ?? now,
      status: "published",
    };
  }

  if (input.status === "scheduled") {
    if (!input.publishedAt) {
      return {
        fieldErrors: {
          publishedAt: "Choose a schedule date and time.",
        },
      };
    }

    return {
      actionLabel: "posts.save",
      publishedAt: input.publishedAt,
      status: "scheduled",
    };
  }

  return {
    actionLabel: "posts.save",
    publishedAt: null,
    status: "draft",
  };
}

export function getAdminPostsPageData(input: {
  page: number;
  query?: string;
  sort?: "created-desc" | "published-desc" | "title-asc" | "updated-desc";
  status?: "all" | "draft" | "published" | "scheduled";
}): AdminPostsPageData {
  const query = input.query?.trim() ?? "";
  const sort = input.sort ?? "updated-desc";
  const status = input.status ?? "all";
  const limit = 10;
  const offset = (input.page - 1) * limit;
  const totalItems = countAdminPosts({
    searchQuery: query || undefined,
    status,
  });

  return {
    filters: {
      query,
      sort,
      status,
    },
    items: listAdminPosts({
      limit,
      offset,
      searchQuery: query || undefined,
      sort,
      status,
    }),
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

export function getAdminPostEditorPageData(
  postId?: number,
  actor?: AdminSessionUser,
): AdminPostEditorPageData | null {
  const post = typeof postId === "number" ? getAdminPostById(postId) : undefined;

  if (typeof postId === "number" && !post) {
    return null;
  }

  const authors = listAdminAuthorOptions();
  const preferredAuthorId = resolvePreferredAuthorId(authors, actor);
  const parsedPreferredAuthorId = Number.parseInt(preferredAuthorId, 10);
  const sessionAuthor =
    actor && preferredAuthorId
      ? {
          email: actor.email,
          id: Number.isFinite(parsedPreferredAuthorId) ? parsedPreferredAuthorId : null,
          name: actor.name,
        }
      : actor
        ? {
            email: actor.email,
            id: null,
            name: actor.name,
          }
        : null;

  return {
    authors,
    sessionAuthor,
    mediaAssets: listAdminMediaAssets({
      limit: 12,
      offset: 0,
    }).map((asset) => ({
      altText: asset.altText,
      fileName: asset.fileName,
      id: asset.id,
      publicUrl: asset.publicUrl,
    })),
    post: post
      ? toEditorValues(post)
      : {
          ...toEditorValues(),
          authorId: preferredAuthorId,
        },
    tags: listAdminTagOptions(),
  };
}

export function getAdminDashboardPostSummary(): {
  drafts: number;
  published: number;
  recentPosts: ReturnType<typeof listAdminPosts>;
  scheduled: number;
  total: number;
} {
  return {
    drafts: countAdminPosts({ status: "draft" }),
    published: countAdminPosts({ status: "published" }),
    recentPosts: listAdminPosts({
      limit: 5,
      offset: 0,
      sort: "updated-desc",
      status: "all",
    }),
    scheduled: countAdminPosts({ status: "scheduled" }),
    total: countAdminPosts({ status: "all" }),
  };
}

export async function mutateAdminPost(
  formData: FormData,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): Promise<AdminFormState<PostFormValues>> {
  const validation = validatePostForm(formData);

  if (!validation.ok || !validation.parsed) {
    return validation;
  }

  const input = validation.parsed;
  const dbContext = getDatabaseContext();

  if (input.intent === "delete") {
    if (!input.postId) {
      return {
        formError: "Choose a post to delete.",
        ok: false,
        values: validation.values,
      };
    }

    assertCanDeleteRecords(actor.role);
    const existing = getAdminPostById(input.postId, dbContext);

    if (!existing) {
      return {
        formError: "The post no longer exists.",
        ok: false,
        values: validation.values,
      };
    }

    deleteAdminPost(input.postId, dbContext);
    recordAdminActivity({
      action: "posts.delete",
      actor,
      entityId: String(input.postId),
      entityLabel: existing.title,
      entityType: "post",
      ipAddress: context.clientAddress,
    });
    setFlashMessage(context, {
      title: "Post deleted",
      tone: "success",
    });

    return {
      ok: true,
      redirectTo: "/admin/posts",
      values: validation.values,
    };
  }

  if (findAdminPostBySlug(input.slug, input.postId, dbContext)) {
    return {
      fieldErrors: {
        slug: "This slug is already in use.",
      },
      ok: false,
      values: validation.values,
    };
  }

  const persistence = resolvePostPersistence(input);

  if ("fieldErrors" in persistence) {
    return {
      fieldErrors: persistence.fieldErrors,
      ok: false,
      values: validation.values,
    };
  }

  const timestamp = getCurrentIsoTimestamp();
  const persistenceInput = {
    authorId: input.authorId,
    canonicalUrl: input.canonicalUrl,
    contentMarkdown: input.contentMarkdown,
    coverImageUrl: input.coverImageUrl,
    excerpt: input.excerpt,
    isFeatured: input.isFeatured,
    publishedAt: persistence.publishedAt,
    showAuthorInMeta: input.showAuthorInMeta,
    seoDescription: input.seoDescription,
    seoTitle: input.seoTitle,
    slug: input.slug,
    status: persistence.status,
    title: input.title,
    updatedAt: timestamp,
  } as const;

  let postId = input.postId;
  const existing = typeof postId === "number" ? getAdminPostById(postId, dbContext) : null;
  const authorIdForPersistence = existing?.authorId ?? actor.authorId ?? input.authorId;

  dbContext.sqlite.transaction(() => {
    if (existing) {
      updateAdminPost(
        existing.id,
        {
          ...persistenceInput,
          authorId: authorIdForPersistence,
        },
        dbContext,
      );
      replaceAdminPostTags(existing.id, input.tagIds, dbContext);
    } else {
      postId = insertAdminPost(
        {
          ...persistenceInput,
          authorId: authorIdForPersistence,
        },
        dbContext,
      );
      replaceAdminPostTags(postId, input.tagIds, dbContext);
    }
  })();

  if (!postId) {
    throw new Error("Post save failed.");
  }

  recordAdminActivity({
    action: existing ? persistence.actionLabel : "posts.create",
    actor,
    entityId: String(postId),
    entityLabel: input.title,
    entityType: "post",
    ipAddress: context.clientAddress,
    metadata: {
      status: persistence.status,
    },
  });

  setFlashMessage(context, {
    title: existing ? "Post updated" : "Post created",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: `/admin/posts/${postId}`,
    values: validation.values,
  };
}
