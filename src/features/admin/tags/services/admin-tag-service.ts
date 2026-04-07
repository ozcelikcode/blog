import type { APIContext } from "astro";

import { assertCanDeleteRecords } from "@/lib/auth/session";
import { setFlashMessage } from "@/lib/sessions/flash";
import type { AdminSessionUser } from "@/features/admin/types";
import type { AdminFormState } from "@/features/admin/utils/form-state";
import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import {
  countAdminTagUsage,
  deleteAdminTag,
  findAdminTagByName,
  findAdminTagBySlug,
  getAdminTagById,
  insertAdminTag,
  listAdminTags,
  updateAdminTag,
} from "../repositories/admin-tag-repository";
import type { TagFormValues } from "../validators/tag-form";
import { validateTagForm } from "../validators/tag-form";

export function getAdminTagsPageData(input: {
  query?: string | undefined;
  tagId?: number | undefined;
}): {
  items: ReturnType<typeof listAdminTags>;
  query: string;
  selectedTag: ReturnType<typeof getAdminTagById>;
} {
  const query = input.query?.trim() ?? "";

  return {
    items: listAdminTags(query || undefined),
    query,
    selectedTag: typeof input.tagId === "number" ? getAdminTagById(input.tagId) : null,
  };
}

export async function saveAdminTag(
  formData: FormData,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): Promise<AdminFormState<TagFormValues>> {
  const validation = validateTagForm(formData);

  if (!validation.ok || !validation.parsed) {
    return validation;
  }

  if (findAdminTagByName(validation.parsed.name, validation.parsed.tagId)) {
    return {
      fieldErrors: {
        name: "This tag name already exists.",
      },
      ok: false,
      values: validation.values,
    };
  }

  if (findAdminTagBySlug(validation.parsed.slug, validation.parsed.tagId)) {
    return {
      fieldErrors: {
        slug: "This slug is already in use.",
      },
      ok: false,
      values: validation.values,
    };
  }

  let tagId = validation.parsed.tagId;

  if (tagId) {
    updateAdminTag(tagId, validation.parsed);
  } else {
    tagId = insertAdminTag(validation.parsed);
  }

  recordAdminActivity({
    action: validation.parsed.tagId ? "tags.update" : "tags.create",
    actor,
    entityId: String(tagId),
    entityLabel: validation.parsed.name,
    entityType: "tag",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: validation.parsed.tagId ? "Tag updated" : "Tag created",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: "/admin/tags",
    values: validation.values,
  };
}

export function deleteAdminTagById(
  tagId: number,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): void {
  assertCanDeleteRecords(actor.role);

  const tag = getAdminTagById(tagId);
  if (!tag) {
    throw new Error("The tag no longer exists.");
  }

  if (countAdminTagUsage(tagId) > 0) {
    throw new Error("Tags in use cannot be deleted.");
  }

  deleteAdminTag(tagId);
  recordAdminActivity({
    action: "tags.delete",
    actor,
    entityId: String(tagId),
    entityLabel: tag.name,
    entityType: "tag",
    ipAddress: context.clientAddress,
  });
  setFlashMessage(context, {
    title: "Tag deleted",
    tone: "success",
  });
}
