import type { DatabaseContext } from "@/lib/db/client";

import type { AdminSessionUser } from "@/features/admin/types";

import {
  countActivityLogs,
  createActivityLog,
  listActivityLogs,
  listDistinctActivityActions,
} from "../repositories/activity-repository";

export interface ActivityLogListItem {
  action: string;
  actorLabel: string;
  createdAt: string;
  entityLabel: string;
  entityType: string;
  id: number;
  ipAddress: string | null;
}

export function recordAdminActivity(
  input: {
    action: string;
    actor?: AdminSessionUser | undefined;
    entityId?: string | undefined;
    entityLabel?: string | undefined;
    entityType: string;
    ipAddress?: string | null | undefined;
    metadata?: Record<string, unknown> | undefined;
  },
  context?: DatabaseContext,
): void {
  createActivityLog(
    {
      action: input.action,
      actorAdminUserId: input.actor?.id,
      entityId: input.entityId,
      entityLabel: input.entityLabel,
      entityType: input.entityType,
      ipAddress: input.ipAddress ?? null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : undefined,
    },
    context,
  );
}

export function getAdminActivityFeed(input: {
  action?: string | undefined;
  limit: number;
  page: number;
}): {
  items: ActivityLogListItem[];
  totalItems: number;
  totalPages: number;
} {
  const offset = (input.page - 1) * input.limit;
  const totalItems = countActivityLogs({ action: input.action });
  const totalPages = Math.max(1, Math.ceil(totalItems / input.limit));

  return {
    items: listActivityLogs({
      action: input.action,
      limit: input.limit,
      offset,
    }).map((item) => ({
      action: item.action,
      actorLabel: item.actorName ? `${item.actorName} (${item.actorEmail ?? "unknown"})` : "System",
      createdAt: item.createdAt,
      entityLabel: item.entityLabel ?? item.entityType,
      entityType: item.entityType,
      id: item.id,
      ipAddress: item.ipAddress,
    })),
    totalItems,
    totalPages,
  };
}

export function getAdminActivityPageData(input: {
  action?: string | undefined;
  page: number;
}): {
  actions: string[];
  filters: {
    action: string;
  };
  items: ActivityLogListItem[];
  totalItems: number;
  totalPages: number;
} {
  const action = input.action?.trim() ?? "";
  const feed = getAdminActivityFeed({
    action: action || undefined,
    limit: 20,
    page: input.page,
  });

  return {
    actions: listDistinctActivityActions(),
    filters: {
      action,
    },
    items: feed.items,
    totalItems: feed.totalItems,
    totalPages: feed.totalPages,
  };
}
