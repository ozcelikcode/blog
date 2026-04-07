export const ADMIN_ROLES = ["admin", "editor"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const ADMIN_POST_STATUSES = ["draft", "scheduled", "published"] as const;
export type AdminPostStatus = (typeof ADMIN_POST_STATUSES)[number];

export const SUBSCRIBER_STATUSES = ["active", "unsubscribed"] as const;
export type SubscriberStatus = (typeof SUBSCRIBER_STATUSES)[number];

export interface AdminSessionUser {
  email: string;
  id: number;
  name: string;
  role: AdminRole;
}

export interface FlashMessage {
  description?: string | undefined;
  title: string;
  tone: "error" | "success";
}

export interface AdminNavItem {
  href: string;
  label: string;
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/authors", label: "Authors" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
  { href: "/admin/activity", label: "Activity" },
];
