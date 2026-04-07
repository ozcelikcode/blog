import type { DatabaseContext } from "@/lib/db/client";
import { getDatabaseContext } from "@/lib/db/client";
import { activityLogs } from "@/lib/db/schema";

export interface ActivityLogRecord {
  action: string;
  actorEmail: string | null;
  actorName: string | null;
  actorRole: string | null;
  createdAt: string;
  entityId: string | null;
  entityLabel: string | null;
  entityType: string;
  id: number;
  ipAddress: string | null;
  metadataJson: string | null;
}

function getContext(context?: DatabaseContext): DatabaseContext {
  return context ?? getDatabaseContext();
}

export function createActivityLog(
  input: {
    action: string;
    actorAdminUserId?: number | undefined;
    entityId?: string | undefined;
    entityLabel?: string | undefined;
    entityType: string;
    ipAddress?: string | null | undefined;
    metadataJson?: string | undefined;
  },
  context?: DatabaseContext,
): void {
  const resolvedContext = getContext(context);

  resolvedContext.db.insert(activityLogs).values({
    action: input.action,
    actorAdminUserId: input.actorAdminUserId,
    entityId: input.entityId,
    entityLabel: input.entityLabel,
    entityType: input.entityType,
    ipAddress: input.ipAddress ?? null,
    metadataJson: input.metadataJson,
  }).run();
}

export function listActivityLogs(
  options: {
    action?: string | undefined;
    limit: number;
    offset: number;
  },
  context?: DatabaseContext,
): ActivityLogRecord[] {
  const resolvedContext = getContext(context);
  const actionFilter = options.action?.trim() ?? null;

  return resolvedContext.sqlite
    .prepare<{ actionFilter: string | null; limit: number; offset: number }, ActivityLogRecord>(
      `
        select
          l.id,
          l.action,
          l.entity_type as entityType,
          l.entity_id as entityId,
          l.entity_label as entityLabel,
          l.ip_address as ipAddress,
          l.metadata_json as metadataJson,
          l.created_at as createdAt,
          u.name as actorName,
          u.email as actorEmail,
          u.role as actorRole
        from activity_logs l
        left join admin_users u on u.id = l.actor_admin_user_id
        where (@actionFilter is null or l.action = @actionFilter)
        order by l.created_at desc, l.id desc
        limit @limit offset @offset
      `,
    )
    .all({
      actionFilter,
      limit: options.limit,
      offset: options.offset,
    });
}

export function countActivityLogs(
  options: {
    action?: string | undefined;
  } = {},
  context?: DatabaseContext,
): number {
  const resolvedContext = getContext(context);
  const actionFilter = options.action?.trim() ?? null;

  return (
    resolvedContext.sqlite
      .prepare<{ actionFilter: string | null }, { count: number }>(
        `
          select count(*) as count
          from activity_logs
          where (@actionFilter is null or action = @actionFilter)
        `,
      )
      .get({ actionFilter })?.count ?? 0
  );
}

export function listDistinctActivityActions(context?: DatabaseContext): string[] {
  const resolvedContext = getContext(context);

  return resolvedContext.sqlite
    .prepare<[], { action: string }>(
      `
        select distinct action
        from activity_logs
        order by action asc
      `,
    )
    .all()
    .map((row) => row.action);
}
