import { listAdminAuthors } from "@/features/admin/authors/repositories/admin-author-repository";
import { listAdminMediaAssets } from "@/features/admin/media/repositories/admin-media-repository";
import { listAdminPosts } from "@/features/admin/posts/repositories/admin-post-repository";
import { listAdminTags } from "@/features/admin/tags/repositories/admin-tag-repository";
import { adminNavItems } from "@/features/admin/types";

export interface AdminCommandItem {
  description?: string;
  group: string;
  href: string;
  keywords: string;
  label: string;
}

export function getAdminCommandItems(): AdminCommandItem[] {
  const navigationItems: AdminCommandItem[] = [
    ...adminNavItems.map((item) => ({
      group: "Navigation",
      href: item.href,
      keywords: `${item.label} ${item.href}`,
      label: item.label,
    })),
    {
      description: "Create and open a new draft immediately.",
      group: "Navigation",
      href: "/admin/posts/new",
      keywords: "new post create draft compose",
      label: "New Post",
    },
  ];

  const postItems = listAdminPosts({
    limit: 8,
    offset: 0,
    sort: "updated-desc",
    status: "all",
  }).map((post) => ({
    description: `${post.status} | ${post.slug}`,
    group: "Recent Posts",
    href: `/admin/posts/${post.id}`,
    keywords: `${post.title} ${post.slug} ${post.authorName} ${post.tagNames.join(" ")}`,
    label: post.title,
  }));

  const tagItems = listAdminTags()
    .slice(0, 8)
    .map((tag) => ({
      description: `${tag.postCount} linked posts`,
      group: "Tags",
      href: `/admin/tags?edit=${tag.id}`,
      keywords: `${tag.name} ${tag.slug} tag taxonomy`,
      label: tag.name,
    }));

  const authorItems = listAdminAuthors()
    .slice(0, 8)
    .map((author) => ({
      description: `${author.postCount} authored posts`,
      group: "Authors",
      href: `/admin/authors?edit=${author.id}`,
      keywords: `${author.name} ${author.bio ?? ""} author`,
      label: author.name,
    }));

  const mediaItems = listAdminMediaAssets({
    limit: 6,
    offset: 0,
  }).map((asset) => ({
    description: asset.altText ?? asset.mimeType,
    group: "Media",
    href: `/admin/media?asset=${asset.id}`,
    keywords: `${asset.fileName} ${asset.originalFileName} ${asset.altText ?? ""}`,
    label: asset.fileName,
  }));

  return [...navigationItems, ...postItems, ...tagItems, ...authorItems, ...mediaItems];
}
