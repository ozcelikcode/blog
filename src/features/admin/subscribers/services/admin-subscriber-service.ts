import type { APIContext } from "astro";

import { buildCsv } from "@/lib/utils/csv";
import { assertCanDeleteRecords } from "@/lib/auth/session";
import { setFlashMessage } from "@/lib/sessions/flash";
import type { AdminSessionUser } from "@/features/admin/types";
import { recordAdminActivity } from "@/features/admin/activity/services/activity-service";

import {
  countAdminSubscribers,
  getAdminSubscriberById,
  getAdminSubscriberStats,
  listAdminSubscribers,
  updateAdminSubscriberStatus,
} from "../repositories/admin-subscriber-repository";

export function getAdminSubscribersPageData(input: { page: number; query?: string }) {
  const query = input.query?.trim() ?? "";
  const limit = 20;
  const offset = (input.page - 1) * limit;
  const totalItems = countAdminSubscribers(query || undefined);

  return {
    items: listAdminSubscribers({
      limit,
      offset,
      searchQuery: query || undefined,
    }),
    query,
    stats: getAdminSubscriberStats(),
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / limit)),
  };
}

export function exportSubscribersCsv(query?: string): string {
  const rows = listAdminSubscribers({
    searchQuery: query?.trim() || undefined,
  }).map((subscriber) => ({
    createdAt: subscriber.createdAt,
    email: subscriber.email,
    source: subscriber.source,
    status: subscriber.status,
    unsubscribedAt: subscriber.unsubscribedAt ?? "",
    updatedAt: subscriber.updatedAt,
  }));

  return buildCsv(rows);
}

export function unsubscribeSubscriberById(
  subscriberId: number,
  actor: AdminSessionUser,
  context: Pick<APIContext, "clientAddress" | "session">,
): void {
  assertCanDeleteRecords(actor.role);
  const subscriber = getAdminSubscriberById(subscriberId);

  if (!subscriber) {
    throw new Error("The subscriber no longer exists.");
  }

  if (subscriber.status === "unsubscribed") {
    return;
  }

  const timestamp = new Date().toISOString();
  updateAdminSubscriberStatus(subscriberId, {
    status: "unsubscribed",
    unsubscribedAt: timestamp,
    updatedAt: timestamp,
  });

  recordAdminActivity({
    action: "subscribers.unsubscribe",
    actor,
    entityId: String(subscriberId),
    entityLabel: subscriber.email,
    entityType: "subscriber",
    ipAddress: context.clientAddress,
  });

  setFlashMessage(context, {
    title: "Subscriber unsubscribed",
    tone: "success",
  });
}
