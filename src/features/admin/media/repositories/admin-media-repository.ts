import { eq } from "drizzle-orm";

import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { mediaAssets, posts } from "@/lib/db/schema";

export interface AdminMediaAssetRecord {
  altText: string | null;
  createdAt: string;
  fileName: string;
  fileSizeBytes: number;
  id: number;
  mimeType: string;
  originalFileName: string;
  publicUrl: string;
  storagePath: string;
  updatedAt: string;
}

export interface MediaUsageRecord {
  postId: number;
  postTitle: string;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function listAdminMediaAssets(
  options: {
    limit: number;
    offset: number;
    searchQuery?: string | undefined;
  },
  context?: DatabaseContext,
): AdminMediaAssetRecord[] {
  const resolvedContext = getContext(context);
  const searchLike = options.searchQuery ? `%${options.searchQuery.toLowerCase()}%` : null;

  return resolvedContext.sqlite
    .prepare<
      { limit: number; offset: number; searchLike: string | null },
      AdminMediaAssetRecord
    >(
      `
        select
          id,
          file_name as fileName,
          original_file_name as originalFileName,
          mime_type as mimeType,
          file_size_bytes as fileSizeBytes,
          storage_path as storagePath,
          public_url as publicUrl,
          alt_text as altText,
          created_at as createdAt,
          updated_at as updatedAt
        from media_assets
        where
          @searchLike is null
          or lower(file_name) like @searchLike
          or lower(original_file_name) like @searchLike
          or lower(ifnull(alt_text, '')) like @searchLike
        order by created_at desc, id desc
        limit @limit offset @offset
      `,
    )
    .all({
      limit: options.limit,
      offset: options.offset,
      searchLike,
    });
}

export function countAdminMediaAssets(
  searchQuery?: string | undefined,
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const searchLike = searchQuery ? `%${searchQuery.toLowerCase()}%` : null;

  return (
    resolvedContext.sqlite
      .prepare<{ searchLike: string | null }, { count: number }>(
        `
          select count(*) as count
          from media_assets
          where
            @searchLike is null
            or lower(file_name) like @searchLike
            or lower(original_file_name) like @searchLike
            or lower(ifnull(alt_text, '')) like @searchLike
        `,
      )
      .get({ searchLike })?.count ?? 0
  );
}

export function getAdminMediaAssetById(id: number, context?: DatabaseContext): AdminMediaAssetRecord | null {
  const resolvedContext = getContext(context);

  return (
    resolvedContext.db
      .select({
        altText: mediaAssets.altText,
        createdAt: mediaAssets.createdAt,
        fileName: mediaAssets.fileName,
        fileSizeBytes: mediaAssets.fileSizeBytes,
        id: mediaAssets.id,
        mimeType: mediaAssets.mimeType,
        originalFileName: mediaAssets.originalFileName,
        publicUrl: mediaAssets.publicUrl,
        storagePath: mediaAssets.storagePath,
        updatedAt: mediaAssets.updatedAt,
      })
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1)
      .all()[0] ?? null
  );
}

export function insertAdminMediaAsset(
  input: {
    altText: string | null;
    fileName: string;
    fileSizeBytes: number;
    mimeType: string;
    originalFileName: string;
    publicUrl: string;
    storagePath: string;
    timestamp: string;
    uploadedByAdminUserId: number;
  },
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const [inserted] = resolvedContext.db
    .insert(mediaAssets)
    .values({
      altText: input.altText,
      createdAt: input.timestamp,
      fileName: input.fileName,
      fileSizeBytes: input.fileSizeBytes,
      mimeType: input.mimeType,
      originalFileName: input.originalFileName,
      publicUrl: input.publicUrl,
      storagePath: input.storagePath,
      updatedAt: input.timestamp,
      uploadedByAdminUserId: input.uploadedByAdminUserId,
    })
    .returning({ id: mediaAssets.id })
    .all();

  if (!inserted) {
    throw new Error("Failed to create media asset.");
  }

  return inserted.id;
}

export function updateAdminMediaAsset(
  id: number,
  input: { altText: string | null; updatedAt: string },
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);
  resolvedContext.db
    .update(mediaAssets)
    .set(input)
    .where(eq(mediaAssets.id, id))
    .run();
}

export function deleteAdminMediaAsset(id: number, context?: DatabaseContext): void {
  const resolvedContext = getContext(context);
  resolvedContext.db.delete(mediaAssets).where(eq(mediaAssets.id, id)).run();
}

export function listMediaUsages(publicUrl: string, context?: DatabaseContext): MediaUsageRecord[] {
  const resolvedContext = getContext(context);
  return resolvedContext.db
    .select({
      postId: posts.id,
      postTitle: posts.title,
    })
    .from(posts)
    .where(eq(posts.coverImageUrl, publicUrl))
    .all();
}
