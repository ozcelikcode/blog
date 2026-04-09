import type { SiteLinkItem } from "@/lib/site-chrome";

export const BLOG_PAGE_SIZE = 6;
export const SEARCH_PAGE_SIZE = 10;
export const RELATED_POSTS_LIMIT = 3;

export interface AuthorSummary {
  avatarUrl: string | null;
  bio: string | null;
  id: number;
  name: string;
}

export interface TagSummary {
  id: number;
  name: string;
  postCount?: number;
  slug: string;
}

export interface PostListItem {
  author: AuthorSummary;
  coverImageUrl: string | null;
  excerpt: string;
  id: number;
  isFeatured: boolean;
  publishedAt: string;
  readingTimeMinutes: number;
  showAuthorInMeta: boolean;
  slug: string;
  tags: TagSummary[];
  title: string;
  updatedAt: string;
}

export interface PostDetail extends PostListItem {
  canonicalUrl: string | null;
  contentHtml: string;
  contentMarkdown: string;
  seoDescription: string | null;
  seoTitle: string | null;
}

export interface PaginationResult<T> {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isOutOfRange: boolean;
  items: T[];
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface SiteSettingsRecord {
  defaultOgImageUrl: string | null;
  defaultSeoDescription: string;
  defaultSeoTitleTemplate: string;
  footerLinks: SiteLinkItem[];
  footerText: string;
  homepageHeroBody: string;
  homepageHeroTitle: string;
  navigationItems: SiteLinkItem[];
  newsletterDescription: string;
  newsletterHeading: string;
  siteDescription: string;
  siteTitle: string;
  siteUrl: string;
  twitterHandle: string | null;
}
