import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { authors, posts } from "@/lib/db/schema";

export interface AdminAuthorRecord {
  avatarUrl: string | null;
  bio: string | null;
  id: number;
  name: string;
  postCount: number;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function listAdminAuthors(searchQuery?: string, context?: DatabaseContext): AdminAuthorRecord[] {
  const resolvedContext = getContext(context);
  const searchLike = searchQuery ? `%${searchQuery.toLowerCase()}%` : null;

  return resolvedContext.sqlite
    .prepare<{ searchLike: string | null }, AdminAuthorRecord>(
      `
        select
          a.id,
          a.name,
          a.bio,
          a.avatar_url as avatarUrl,
          count(p.id) as postCount
        from authors a
        left join posts p on p.author_id = a.id
        where @searchLike is null or lower(a.name) like @searchLike or lower(ifnull(a.bio, '')) like @searchLike
        group by a.id
        order by a.name asc
      `,
    )
    .all({ searchLike });
}

export function getAdminAuthorById(id: number, context?: DatabaseContext): AdminAuthorRecord | null {
  return listAdminAuthors(undefined, context).find((author) => author.id === id) ?? null;
}

export function insertAdminAuthor(
  input: { avatarUrl: string | null; bio: string | null; name: string },
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const [inserted] = resolvedContext.db
    .insert(authors)
    .values({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .returning({ id: authors.id })
    .all();

  if (!inserted) {
    throw new Error("Failed to create author.");
  }

  return inserted.id;
}

export function updateAdminAuthor(
  id: number,
  input: { avatarUrl: string | null; bio: string | null; name: string },
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);
  resolvedContext.db
    .update(authors)
    .set({
      ...input,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(authors.id, id))
    .run();
}

export function deleteAdminAuthor(id: number, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);
  resolvedContext.db.delete(authors).where(eq(authors.id, id)).run();
}

export function countAdminAuthorPosts(id: number, context?: DatabaseContext): number {
  const resolvedContext = getContext(context);
  return resolvedContext.db.select({ id: posts.id }).from(posts).where(eq(posts.authorId, id)).all().length;
}
