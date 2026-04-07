import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { authors, postTags, posts, tags } from "@/lib/db/schema";

export interface AdminPostListRecord {
  authorName: string;
  id: number;
  isFeatured: boolean;
  publishedAt: string | null;
  slug: string;
  status: "draft" | "published" | "scheduled";
  tagNames: string[];
  title: string;
  updatedAt: string;
}

export interface AdminPostEditorRecord {
  authorId: number;
  canonicalUrl: string | null;
  contentMarkdown: string;
  coverImageUrl: string | null;
  createdAt: string;
  excerpt: string;
  id: number;
  isFeatured: boolean;
  publishedAt: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  status: "draft" | "published" | "scheduled";
  tagIds: number[];
  title: string;
  updatedAt: string;
}

export interface AdminPostPersistenceInput {
  authorId: number;
  canonicalUrl: string | null;
  contentMarkdown: string;
  coverImageUrl: string | null;
  excerpt: string;
  isFeatured: boolean;
  publishedAt: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  status: "draft" | "published" | "scheduled";
  title: string;
  updatedAt: string;
}

export interface AdminReferenceOption {
  id: number;
  label: string;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

function mapTagNames(value: string | null): string[] {
  if (!value) {
    return [];
  }

  return value.split(",").filter(Boolean);
}

export function listAdminPosts(
  options: {
    limit: number;
    offset: number;
    searchQuery?: string | undefined;
    sort: "created-desc" | "published-desc" | "title-asc" | "updated-desc";
    status?: "all" | "draft" | "published" | "scheduled" | undefined;
  },
  context?: DatabaseContext,
): AdminPostListRecord[] {
  const resolvedContext = getContext(context);
  const searchLike = options.searchQuery ? `%${options.searchQuery.toLowerCase()}%` : null;
  const status = options.status && options.status !== "all" ? options.status : null;
  const orderBy =
    options.sort === "title-asc"
      ? "p.title asc"
      : options.sort === "published-desc"
        ? "p.published_at desc, p.id desc"
        : options.sort === "created-desc"
          ? "p.created_at desc, p.id desc"
          : "p.updated_at desc, p.id desc";

  const rows = resolvedContext.sqlite
    .prepare<
      { limit: number; offset: number; searchLike: string | null; status: string | null },
      Omit<AdminPostListRecord, "isFeatured" | "tagNames"> & { isFeatured: number; tagNames: string | null }
    >(
      `
        select
          p.id,
          p.title,
          p.slug,
          p.status,
          p.is_featured as isFeatured,
          p.published_at as publishedAt,
          p.updated_at as updatedAt,
          a.name as authorName,
          group_concat(t.name, ',') as tagNames
        from posts p
        inner join authors a on a.id = p.author_id
        left join post_tags pt on pt.post_id = p.id
        left join tags t on t.id = pt.tag_id
        where
          (@status is null or p.status = @status)
          and (
            @searchLike is null
            or lower(p.title) like @searchLike
            or lower(p.slug) like @searchLike
            or lower(p.excerpt) like @searchLike
            or lower(a.name) like @searchLike
            or lower(t.name) like @searchLike
          )
        group by p.id
        order by ${orderBy}
        limit @limit offset @offset
      `,
    )
    .all({
      limit: options.limit,
      offset: options.offset,
      searchLike,
      status,
    });

  return rows.map((row) => ({
    ...row,
    isFeatured: Boolean(row.isFeatured),
    tagNames: mapTagNames(row.tagNames),
  }));
}

export function countAdminPosts(
  options: {
    searchQuery?: string | undefined;
    status?: "all" | "draft" | "published" | "scheduled" | undefined;
  },
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const searchLike = options.searchQuery ? `%${options.searchQuery.toLowerCase()}%` : null;
  const status = options.status && options.status !== "all" ? options.status : null;

  return (
    resolvedContext.sqlite
      .prepare<{ searchLike: string | null; status: string | null }, { count: number }>(
        `
          select count(distinct p.id) as count
          from posts p
          inner join authors a on a.id = p.author_id
          left join post_tags pt on pt.post_id = p.id
          left join tags t on t.id = pt.tag_id
          where
            (@status is null or p.status = @status)
            and (
              @searchLike is null
              or lower(p.title) like @searchLike
              or lower(p.slug) like @searchLike
              or lower(p.excerpt) like @searchLike
              or lower(a.name) like @searchLike
              or lower(t.name) like @searchLike
            )
        `,
      )
      .get({
        searchLike,
        status,
      })?.count ?? 0
  );
}

export function getAdminPostById(id: number, context?: DatabaseContext): AdminPostEditorRecord | null {
  const resolvedContext = getContext(context);
  const postRecord = resolvedContext.db
    .select({
      authorId: posts.authorId,
      canonicalUrl: posts.canonicalUrl,
      contentMarkdown: posts.contentMarkdown,
      coverImageUrl: posts.coverImageUrl,
      createdAt: posts.createdAt,
      excerpt: posts.excerpt,
      id: posts.id,
      isFeatured: posts.isFeatured,
      publishedAt: posts.publishedAt,
      seoDescription: posts.seoDescription,
      seoTitle: posts.seoTitle,
      slug: posts.slug,
      status: posts.status,
      title: posts.title,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
    .all()[0];

  if (!postRecord) {
    return null;
  }

  const tagIds = resolvedContext.db
    .select({ tagId: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.postId, id))
    .all()
    .map((entry) => entry.tagId);

  return {
    ...postRecord,
    tagIds,
  };
}

export function findAdminPostBySlug(
  slug: string,
  excludeId?: number | undefined,
  context?: DatabaseContext,
): { id: number } | null {
  const resolvedContext = getContext(context);
  const candidate = resolvedContext.db
    .select({
      id: posts.id,
    })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1)
    .all()[0];

  if (!candidate || candidate.id === excludeId) {
    return null;
  }

  return candidate;
}

export function insertAdminPost(
  input: AdminPostPersistenceInput,
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const [inserted] = resolvedContext.db
    .insert(posts)
    .values({
      ...input,
      createdAt: input.updatedAt,
    })
    .returning({
      id: posts.id,
    })
    .all();

  if (!inserted) {
    throw new Error("Failed to create post.");
  }

  return inserted.id;
}

export function updateAdminPost(
  id: number,
  input: AdminPostPersistenceInput,
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);

  resolvedContext.db
    .update(posts)
    .set(input)
    .where(eq(posts.id, id))
    .run();
}

export function deleteAdminPost(id: number, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);
  resolvedContext.db.delete(posts).where(eq(posts.id, id)).run();
}

export function replaceAdminPostTags(postId: number, tagIds: number[], context?: DatabaseContext): void {
  const resolvedContext = getContext(context);
  resolvedContext.db.delete(postTags).where(eq(postTags.postId, postId)).run();

  if (tagIds.length === 0) {
    return;
  }

  resolvedContext.db
    .insert(postTags)
    .values(tagIds.map((tagId) => ({ postId, tagId })))
    .run();
}

export function listAdminTagOptions(context?: DatabaseContext): AdminReferenceOption[] {
  const resolvedContext = getContext(context);

  return resolvedContext.db
    .select({
      id: tags.id,
      label: tags.name,
    })
    .from(tags)
    .orderBy(tags.name)
    .all();
}

export function listAdminAuthorOptions(context?: DatabaseContext): AdminReferenceOption[] {
  const resolvedContext = getContext(context);

  return resolvedContext.db
    .select({
      id: authors.id,
      label: authors.name,
    })
    .from(authors)
    .orderBy(authors.name)
    .all();
}
