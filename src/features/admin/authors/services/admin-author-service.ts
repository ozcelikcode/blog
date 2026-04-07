import type { APIContext } from "astro";

import { assertCanDeleteRecords } from "@/lib/auth/session";
import { setFlashMessage } from "@/lib/sessions/flash";
import type { AdminSessionUser } from "@/features/admin/types";
import type { AdminFormState } from "@/features/admin/utils/form-state";
import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import {
  countAdminAuthorPosts,
  deleteAdminAuthor,
  getAdminAuthorById,
  insertAdminAuthor,
  listAdminAuthors,
  updateAdminAuthor,
} from "../repositories/admin-author-repository";
import type { AuthorFormValues } from "../validators/author-form";
import { validateAuthorForm } from "../validators/author-form";

export function getAdminAuthorsPageData(input: {
  authorId?: number | undefined;
  query?: string | undefined;
}): {
  items: ReturnType<typeof listAdminAuthors>;
  query: string;
  selectedAuthor: ReturnType<typeof getAdminAuthorById>;
} {
  const query = input.query?.trim() ?? "";

  return {
    items: listAdminAuthors(query || undefined),
    query,
    selectedAuthor:
      typeof input.authorId === "number" ? getAdminAuthorById(input.authorId) : null,
  };
}

export async function saveAdminAuthor(
  formData: FormData,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): Promise<AdminFormState<AuthorFormValues>> {
  const validation = validateAuthorForm(formData);

  if (!validation.ok || !validation.parsed) {
    return validation;
  }

  let authorId = validation.parsed.authorId;

  if (authorId) {
    updateAdminAuthor(authorId, validation.parsed);
  } else {
    authorId = insertAdminAuthor(validation.parsed);
  }

  recordAdminActivity({
    action: validation.parsed.authorId ? "authors.update" : "authors.create",
    actor,
    entityId: String(authorId),
    entityLabel: validation.parsed.name,
    entityType: "author",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: validation.parsed.authorId ? "Author updated" : "Author created",
    tone: "success",
  });

  return {
    ok: true,
    redirectTo: "/admin/authors",
    values: validation.values,
  };
}

export function deleteAdminAuthorById(
  authorId: number,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): void {
  assertCanDeleteRecords(actor.role);

  const author = getAdminAuthorById(authorId);
  if (!author) {
    throw new Error("The author no longer exists.");
  }

  if (countAdminAuthorPosts(authorId) > 0) {
    throw new Error("Authors with posts cannot be deleted.");
  }

  deleteAdminAuthor(authorId);
  recordAdminActivity({
    action: "authors.delete",
    actor,
    entityId: String(authorId),
    entityLabel: author.name,
    entityType: "author",
    ipAddress: context.clientAddress,
  });
  setFlashMessage(context, {
    title: "Author deleted",
    tone: "success",
  });
}
