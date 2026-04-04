import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { getCurrentIsoTimestamp } from "@/lib/utils/dates";
import { escapeLikePattern } from "@/lib/utils/sql";

interface PublishedPostQueryOptions {
  featuredOnly?: boolean;
  limit: number;
  offset: number;
  searchQuery?: string;
  tagSlug?: string;
}

interface RawPostRow {
  authorAvatarUrl: string | null;
  authorBio: string | null;
  authorId: number;
  authorName: string;
  canonicalUrl: string | null;
  contentMarkdown: string;
  coverImageUrl: string | null;
  excerpt: string;
  id: number;
  isFeatured: number;
  publishedAt: string | null;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  title: string;
  updatedAt: string;
}

interface RawTagRow {
  id: number;
  name: string;
  postCount?: number;
  postId: number;
  slug: string;
}

export interface PostRecord {
  author: {
    avatarUrl: string | null;
    bio: string | null;
    id: number;
    name: string;
  };
  canonicalUrl: string | null;
  contentMarkdown: string;
  coverImageUrl: string | null;
  excerpt: string;
  id: number;
  isFeatured: boolean;
  publishedAt: string;
  seoDescription: string | null;
  seoTitle: string | null;
  slug: string;
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  title: string;
  updatedAt: string;
}

export interface TagWithCountRecord {
  id: number;
  name: string;
  postCount: number;
  slug: string;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

function buildPublishedFilters(options: Omit<PublishedPostQueryOptions, "limit" | "offset">): {
  params: Record<string, string | number | null>;
  whereClause: string;
} {
  const now = getCurrentIsoTimestamp();
  const conditions = ["p.status != 'draft'", "p.published_at is not null", "p.published_at <= @now"];
  const params: Record<string, string | number | null> = {
    now,
    searchLike: null,
    tagSlug: options.tagSlug ?? null,
  };

  if (options.featuredOnly) {
    conditions.push("p.is_featured = 1");
  }

  if (options.tagSlug) {
    conditions.push(
      "exists (select 1 from post_tags pt_filter join tags t_filter on t_filter.id = pt_filter.tag_id where pt_filter.post_id = p.id and t_filter.slug = @tagSlug)",
    );
  }

  if (options.searchQuery) {
    conditions.push(
      "(lower(p.title) like @searchLike escape '\\' or lower(p.excerpt) like @searchLike escape '\\' or lower(t.name) like @searchLike escape '\\')",
    );
    params.searchLike = `%${escapeLikePattern(options.searchQuery.toLowerCase())}%`;
  }

  return {
    params,
    whereClause: conditions.join(" and "),
  };
}

function postSelectionSql(): string {
  return `
    select
      p.id,
      p.slug,
      p.title,
      p.excerpt,
      p.content_markdown as contentMarkdown,
      p.cover_image_url as coverImageUrl,
      p.is_featured as isFeatured,
      p.seo_title as seoTitle,
      p.seo_description as seoDescription,
      p.canonical_url as canonicalUrl,
      p.published_at as publishedAt,
      p.updated_at as updatedAt,
      a.id as authorId,
      a.name as authorName,
      a.bio as authorBio,
      a.avatar_url as authorAvatarUrl
    from posts p
    inner join authors a on a.id = p.author_id
    left join post_tags pt on pt.post_id = p.id
    left join tags t on t.id = pt.tag_id
  `;
}

function mapPostRows(rows: RawPostRow[], context: DatabaseContext): PostRecord[] {
  if (rows.length === 0) {
    return [];
  }

  const placeholders = rows.map(() => "?").join(", ");
  const tagRows = context.sqlite
    .prepare<[...number[]], RawTagRow>(
      `
        select
          pt.post_id as postId,
          t.id,
          t.slug,
          t.name
        from post_tags pt
        inner join tags t on t.id = pt.tag_id
        where pt.post_id in (${placeholders})
        order by t.name asc
      `,
    )
    .all(...rows.map((row) => row.id));

  const tagsByPostId = new Map<number, PostRecord["tags"]>();

  for (const tagRow of tagRows) {
    const existing = tagsByPostId.get(tagRow.postId) ?? [];
    existing.push({
      id: tagRow.id,
      name: tagRow.name,
      slug: tagRow.slug,
    });
    tagsByPostId.set(tagRow.postId, existing);
  }

  return rows
    .filter((row): row is RawPostRow & { publishedAt: string } => row.publishedAt !== null)
    .map((row) => ({
      author: {
        avatarUrl: row.authorAvatarUrl,
        bio: row.authorBio,
        id: row.authorId,
        name: row.authorName,
      },
      canonicalUrl: row.canonicalUrl,
      contentMarkdown: row.contentMarkdown,
      coverImageUrl: row.coverImageUrl,
      excerpt: row.excerpt,
      id: row.id,
      isFeatured: Boolean(row.isFeatured),
      publishedAt: row.publishedAt,
      seoDescription: row.seoDescription,
      seoTitle: row.seoTitle,
      slug: row.slug,
      tags: tagsByPostId.get(row.id) ?? [],
      title: row.title,
      updatedAt: row.updatedAt,
    }));
}

export function listPublishedPosts(
  options: PublishedPostQueryOptions,
  context?: DatabaseContext,
): PostRecord[] {
  const resolvedContext = getContext(context);
  const { params, whereClause } = buildPublishedFilters(options);

  const rows = resolvedContext.sqlite
    .prepare<Record<string, string | number | null>, RawPostRow>(
      `
        ${postSelectionSql()}
        where ${whereClause}
        group by p.id
        order by p.published_at desc, p.id desc
        limit @limit offset @offset
      `,
    )
    .all({
      ...params,
      limit: options.limit,
      offset: options.offset,
    });

  return mapPostRows(rows, resolvedContext);
}

export function countPublishedPosts(
  options: Pick<PublishedPostQueryOptions, "featuredOnly" | "searchQuery" | "tagSlug"> = {},
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const { params, whereClause } = buildPublishedFilters(options);

  const row = resolvedContext.sqlite
    .prepare<Record<string, string | number | null>, { count: number }>(
      `
        select count(distinct p.id) as count
        from posts p
        left join post_tags pt on pt.post_id = p.id
        left join tags t on t.id = pt.tag_id
        where ${whereClause}
      `,
    )
    .get(params);

  return row?.count ?? 0;
}

export function getPublishedPostBySlug(slug: string, context?: DatabaseContext): PostRecord | null {
  const resolvedContext = getContext(context);
  const now = getCurrentIsoTimestamp();

  const row = resolvedContext.sqlite
    .prepare<{ now: string; slug: string }, RawPostRow>(
      `
        ${postSelectionSql()}
        where
          p.slug = @slug
          and p.status != 'draft'
          and p.published_at is not null
          and p.published_at <= @now
        group by p.id
        limit 1
      `,
    )
    .get({ now, slug });

  if (!row) {
    return null;
  }

  return mapPostRows([row], resolvedContext)[0] ?? null;
}

export function listRelatedPosts(
  currentPostId: number,
  tagIds: number[],
  limit: number,
  context?: DatabaseContext,
): PostRecord[] {
  if (tagIds.length === 0) {
    return [];
  }

  const resolvedContext = getContext(context);
  const now = getCurrentIsoTimestamp();
  const placeholders = tagIds.map(() => "?").join(", ");

  const relatedIds = resolvedContext.sqlite
    .prepare<[number, string, ...number[], number], { id: number }>(
      `
        select p.id
        from posts p
        inner join post_tags pt on pt.post_id = p.id
        where
          p.id != ?
          and p.status != 'draft'
          and p.published_at is not null
          and p.published_at <= ?
          and pt.tag_id in (${placeholders})
        group by p.id
        order by count(pt.tag_id) desc, p.published_at desc
        limit ?
      `,
    )
    .all(currentPostId, now, ...tagIds, limit)
    .map((row) => row.id);

  if (relatedIds.length === 0) {
    return [];
  }

  return listPublishedPostsByIds(relatedIds, resolvedContext);
}

export function listPublishedPostsByIds(ids: number[], context?: DatabaseContext): PostRecord[] {
  if (ids.length === 0) {
    return [];
  }

  const resolvedContext = getContext(context);
  const placeholders = ids.map(() => "?").join(", ");

  const rows = resolvedContext.sqlite
    .prepare<[...number[]], RawPostRow>(
      `
        ${postSelectionSql()}
        where p.id in (${placeholders})
        group by p.id
      `,
    )
    .all(...ids);

  const rowById = new Map(mapPostRows(rows, resolvedContext).map((post) => [post.id, post]));
  return ids.map((id) => rowById.get(id)).filter((post): post is PostRecord => Boolean(post));
}

export function getTagBySlug(slug: string, context?: DatabaseContext): TagWithCountRecord | null {
  const resolvedContext = getContext(context);
  const now = getCurrentIsoTimestamp();

  return (
    resolvedContext.sqlite
      .prepare<{ now: string; slug: string }, TagWithCountRecord>(
        `
          select
            t.id,
            t.slug,
            t.name,
            count(distinct p.id) as postCount
          from tags t
          left join post_tags pt on pt.tag_id = t.id
          left join posts p on p.id = pt.post_id and p.status != 'draft' and p.published_at is not null and p.published_at <= @now
          where t.slug = @slug
          group by t.id
          limit 1
        `,
      )
      .get({ now, slug }) ?? null
  );
}

export function listTagsWithPostCount(context?: DatabaseContext): TagWithCountRecord[] {
  const resolvedContext = getContext(context);
  const now = getCurrentIsoTimestamp();

  return resolvedContext.sqlite
    .prepare<{ now: string }, TagWithCountRecord>(
      `
        select
          t.id,
          t.slug,
          t.name,
          count(distinct p.id) as postCount
        from tags t
        inner join post_tags pt on pt.tag_id = t.id
        inner join posts p on p.id = pt.post_id
        where p.status != 'draft' and p.published_at is not null and p.published_at <= @now
        group by t.id
        order by t.name asc
      `,
    )
    .all({ now });
}

export function listPublishedPostSlugs(
  context?: DatabaseContext,
): Array<{ publishedAt: string; slug: string; updatedAt: string }> {
  const resolvedContext = getContext(context);
  const now = getCurrentIsoTimestamp();

  return resolvedContext.sqlite
    .prepare<{ now: string }, { publishedAt: string; slug: string; updatedAt: string }>(
      `
        select slug, published_at as publishedAt, updated_at as updatedAt
        from posts
        where status != 'draft' and published_at is not null and published_at <= @now
        order by published_at desc
      `,
    )
    .all({ now });
}
