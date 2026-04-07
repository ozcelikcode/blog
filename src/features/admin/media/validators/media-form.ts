import { z } from "zod";

import type { AdminFormState } from "@/features/admin/utils/form-state";

const allowedMimeTypes = new Set(["image/gif", "image/jpeg", "image/png", "image/svg+xml", "image/webp"]);
const maxFileSizeBytes = 5 * 1024 * 1024;

export interface MediaUploadValues {
  altText: string;
}

export interface MediaUploadInput {
  altText: string | null;
  file: File;
}

export function validateMediaUploadForm(formData: FormData): AdminFormState<MediaUploadValues> & {
  parsed?: MediaUploadInput;
} {
  const fileValue = formData.get("file");
  const altText = String(formData.get("altText") ?? "").trim();

  if (!(fileValue instanceof File) || fileValue.size === 0) {
    return {
      formError: "Choose an image to upload.",
      ok: false,
      values: { altText },
    };
  }

  if (!allowedMimeTypes.has(fileValue.type)) {
    return {
      formError: "Only GIF, JPEG, PNG, SVG, and WEBP images are supported.",
      ok: false,
      values: { altText },
    };
  }

  if (fileValue.size > maxFileSizeBytes) {
    return {
      formError: "Images must be 5 MB or smaller.",
      ok: false,
      values: { altText },
    };
  }

  return {
    ok: true,
    parsed: {
      altText: altText || null,
      file: fileValue,
    },
    values: { altText },
  };
}

const mediaDetailsSchema = z.object({
  altText: z.string().trim().max(240),
  mediaAssetId: z.coerce.number().int().positive(),
});

export interface MediaDetailsValues {
  altText: string;
  mediaAssetId: string;
}

export interface MediaDetailsInput {
  altText: string | null;
  mediaAssetId: number;
}

export function validateMediaDetailsForm(formData: FormData): AdminFormState<MediaDetailsValues> & {
  parsed?: MediaDetailsInput;
} {
  const values: MediaDetailsValues = {
    altText: String(formData.get("altText") ?? ""),
    mediaAssetId: String(formData.get("mediaAssetId") ?? ""),
  };

  const parsed = mediaDetailsSchema.safeParse(values);

  if (!parsed.success) {
    return {
      formError: "Update the asset details and try again.",
      ok: false,
      values,
    };
  }

  return {
    ok: true,
    parsed: {
      altText: parsed.data.altText || null,
      mediaAssetId: parsed.data.mediaAssetId,
    },
    values,
  };
}
