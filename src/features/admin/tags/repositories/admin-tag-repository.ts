import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { postTags, tags } from "@/lib/db/schema";

export interface AdminTagRecord {
  id: number;
  name: string;
  postCount: number;
  slug: string;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function listAdminTags(
  searchQuery?: string | undefined,
  context?: DatabaseContext,
): AdminTagRecord[] {
  const resolvedContext = getContext(context);
  const searchLike = searchQuery ? `%${searchQuery.toLowerCase()}%` : null;

  return resolvedContext.sqlite
    .prepare<{ searchLike: string | null }, AdminTagRecord>(
      `
        select
          t.id,
          t.name,
          t.slug,
          count(pt.post_id) as postCount
        from tags t
        left join post_tags pt on pt.tag_id = t.id
        where @searchLike is null or lower(t.name) like @searchLike or lower(t.slug) like @searchLike
        group by t.id
        order by t.name asc
      `,
    )
    .all({ searchLike });
}

export function getAdminTagById(id: number, context?: DatabaseContext): AdminTagRecord | null {
  return listAdminTags(undefined, context).find((tag) => tag.id === id) ?? null;
}

export function findAdminTagByName(
  name: string,
  excludeId?: number | undefined,
  context?: DatabaseContext,
): { id: number } | null {
  const resolvedContext = getContext(context);
  const candidate =
    resolvedContext.db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.name, name))
      .limit(1)
      .all()[0] ?? null;

  if (!candidate || candidate.id === excludeId) {
    return null;
  }

  return candidate;
}

export function findAdminTagBySlug(
  slug: string,
  excludeId?: number | undefined,
  context?: DatabaseContext,
): { id: number } | null {
  const resolvedContext = getContext(context);
  const candidate =
    resolvedContext.db
      .select({ id: tags.id })
      .from(tags)
      .where(eq(tags.slug, slug))
      .limit(1)
      .all()[0] ?? null;

  if (!candidate || candidate.id === excludeId) {
    return null;
  }

  return candidate;
}

export function insertAdminTag(input: { name: string; slug: string }, context?: DatabaseContext): number {
  const resolvedContext = getContext(context);
  const [inserted] = resolvedContext.db
    .insert(tags)
    .values({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: tags.id })
    .all();

  if (!inserted) {
    throw new Error("Failed to create tag.");
  }

  return inserted.id;
}

export function updateAdminTag(
  id: number,
  input: { name: string; slug: string },
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);
  resolvedContext.db
    .update(tags)
    .set({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(tags.id, id))
    .run();
}

export function deleteAdminTag(id: number, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);
  resolvedContext.db.delete(tags).where(eq(tags.id, id)).run();
}

export function countAdminTagUsage(id: number, context?: DatabaseContext): number {
  const resolvedContext = getContext(context);
  return resolvedContext.db
    .select({ count: postTags.tagId })
    .from(postTags)
    .where(eq(postTags.tagId, id))
    .all().length;
}
