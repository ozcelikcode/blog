import type { AdminRole } from "@/features/admin/types";

export function canManageSettings(role: AdminRole): boolean {
  return role === "admin";
}

export function canDeleteRecords(role: AdminRole): boolean {
  return role === "admin";
}

export function canManageMedia(role: AdminRole): boolean {
  return role === "admin" || role === "editor";
}
