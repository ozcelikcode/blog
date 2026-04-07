import fs from "node:fs";
import path from "node:path";

import type { APIContext } from "astro";

import { assertCanDeleteRecords, assertCanManageMedia } from "@/lib/auth/session";
import { setFlashMessage } from "@/lib/sessions/flash";
import { slugify } from "@/lib/utils/slugify";
import type { AdminSessionUser } from "@/features/admin/types";
import type { AdminFormState } from "@/features/admin/utils/form-state";
import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import {
  countAdminMediaAssets,
  deleteAdminMediaAsset,
  getAdminMediaAssetById,
  insertAdminMediaAsset,
  listAdminMediaAssets,
  listMediaUsages,
  updateAdminMediaAsset,
} from "../repositories/admin-media-repository";
import type { MediaDetailsValues, MediaUploadValues } from "../validators/media-form";
import { validateMediaDetailsForm, validateMediaUploadForm } from "../validators/media-form";

function getUploadDirectory(): string {
  return path.resolve(process.cwd(), "public/uploads/media");
}

function getFileExtension(file: File): string {
  const extension = path.extname(file.name);
  return extension.length > 0 ? extension.toLowerCase() : ".bin";
}

async function writeUploadedFile(file: File): Promise<{
  fileName: string;
  publicUrl: string;
  storagePath: string;
}> {
  const uploadDirectory = getUploadDirectory();
  fs.mkdirSync(uploadDirectory, { recursive: true });

  const baseName = slugify(path.basename(file.name, path.extname(file.name))) || "asset";
  const fileName = `${Date.now()}-${baseName}${getFileExtension(file)}`;
  const storagePath = path.join(uploadDirectory, fileName);
  const publicUrl = `/uploads/media/${fileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  fs.writeFileSync(storagePath, buffer);

  return {
    fileName,
    publicUrl,
    storagePath,
  };
}

export function getAdminMediaPageData(input: {
  assetId?: number | undefined;
  page: number;
  query?: string | undefined;
}) {
  const query = input.query?.trim() ?? "";
  const limit = 20;
  const offset = (input.page - 1) * limit;
  const selectedAsset = typeof input.assetId === "number" ? getAdminMediaAssetById(input.assetId) : null;
  const totalItems = countAdminMediaAssets(query || undefined);

  return {
    items: listAdminMediaAssets({
      limit,
      offset,
      searchQuery: query || undefined,
    }),
    query,
    selectedAsset: selectedAsset
      ? {
          ...selectedAsset,
          usages: listMediaUsages(selectedAsset.publicUrl),
        }
      : null,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

export async function uploadAdminMedia(
  formData: FormData,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): Promise<AdminFormState<MediaUploadValues>> {
  assertCanManageMedia(actor.role);
  const validation = validateMediaUploadForm(formData);

  if (!validation.ok || !validation.parsed) {
    return validation;
  }

  const { fileName, publicUrl, storagePath } = await writeUploadedFile(validation.parsed.file);
  const timestamp = new Date().toISOString();

  const assetId = insertAdminMediaAsset({
    altText: validation.parsed.altText,
    fileName,
    fileSizeBytes: validation.parsed.file.size,
    mimeType: validation.parsed.file.type,
    originalFileName: validation.parsed.file.name,
    publicUrl,
    storagePath,
    timestamp,
    uploadedByAdminUserId: actor.id,
  });

  recordAdminActivity({
    action: "media.upload",
    actor,
    entityId: String(assetId),
    entityLabel: fileName,
    entityType: "media_asset",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: "Media uploaded",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: `/admin/media?asset=${assetId}`,
    values: validation.values,
  };
}

export async function updateAdminMediaDetails(
  formData: FormData,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): Promise<AdminFormState<MediaDetailsValues>> {
  assertCanManageMedia(actor.role);
  const validation = validateMediaDetailsForm(formData);

  if (!validation.ok || !validation.parsed) {
    return validation;
  }

  const asset = getAdminMediaAssetById(validation.parsed.mediaAssetId);
  if (!asset) {
    return {
      formError: "The selected asset no longer exists.",
      ok: false,
      values: validation.values,
    };
  }

  updateAdminMediaAsset(asset.id, {
    altText: validation.parsed.altText,
    updatedAt: new Date().toISOString(),
  });

  recordAdminActivity({
    action: "media.update",
    actor,
    entityId: String(asset.id),
    entityLabel: asset.fileName,
    entityType: "media_asset",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: "Media details updated",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: `/admin/media?asset=${asset.id}`,
    values: validation.values,
  };
}

export function deleteAdminMediaById(
  assetId: number,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): void {
  assertCanDeleteRecords(actor.role);
  const asset = getAdminMediaAssetById(assetId);

  if (!asset) {
    throw new Error("The media asset no longer exists.");
  }

  if (listMediaUsages(asset.publicUrl).length > 0) {
    throw new Error("This media asset is still attached to one or more posts.");
  }

  deleteAdminMediaAsset(assetId);

  if (fs.existsSync(asset.storagePath)) {
    fs.rmSync(asset.storagePath, { force: true });
  }

  recordAdminActivity({
    action: "media.delete",
    actor,
    entityId: String(asset.id),
    entityLabel: asset.fileName,
    entityType: "media_asset",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: "Media deleted",
    tone: "success",
  });
}
