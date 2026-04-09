import { renderMarkdownToHtml } from "@/lib/content/markdown";
import { calculateReadingTime } from "@/lib/utils/reading-time";

import {
  BLOG_PAGE_SIZE,
  RELATED_POSTS_LIMIT,
  SEARCH_PAGE_SIZE,
  type PaginationResult,
  type PostDetail,
  type PostListItem,
  type SiteSettingsRecord,
  type TagSummary,
} from "../types";
import {
  countPublishedPosts,
  getPublishedPostBySlug,
  getTagBySlug,
  listPublishedPostSlugs,
  listPublishedPosts,
  listRelatedPosts,
  listTagsWithPostCount,
} from "../repositories/post-repository";
import { getSiteSettings } from "../repositories/site-repository";

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripDuplicateLeadingTitle(markdown: string, title: string): string {
  const expression = new RegExp(`^#\\s+${escapeRegExp(title)}\\s*(?:\\r?\\n){1,2}`);
  return markdown.replace(expression, "");
}

function mapPostListItem(post: ReturnType<typeof listPublishedPosts>[number]): PostListItem {
  return {
    author: post.author,
    coverImageUrl: post.coverImageUrl,
    excerpt: post.excerpt,
    id: post.id,
    isFeatured: post.isFeatured,
    publishedAt: post.publishedAt,
    readingTimeMinutes: calculateReadingTime(post.contentMarkdown),
    showAuthorInMeta: post.showAuthorInMeta,
    slug: post.slug,
    tags: post.tags,
    title: post.title,
    updatedAt: post.updatedAt,
  };
}

function mapPostDetail(post: ReturnType<typeof getPublishedPostBySlug> extends infer T ? Exclude<T, null> : never): PostDetail {
  const contentMarkdown = stripDuplicateLeadingTitle(post.contentMarkdown, post.title);

  return {
    ...mapPostListItem(post),
    canonicalUrl: post.canonicalUrl,
    contentHtml: renderMarkdownToHtml(contentMarkdown),
    contentMarkdown,
    seoDescription: post.seoDescription,
    seoTitle: post.seoTitle,
  };
}

function buildPagination<T>(
  items: T[],
  currentPage: number,
  totalItems: number,
  pageSize: number,
): PaginationResult<T> {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  return {
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isOutOfRange: totalItems > 0 && currentPage > totalPages,
    items,
    pageSize,
    totalItems,
    totalPages,
  };
}

export interface HomePageData {
  featuredPosts: PostListItem[];
  latestPosts: PostListItem[];
  settings: SiteSettingsRecord;
  tags: TagSummary[];
}

export interface BlogIndexData {
  pagination: PaginationResult<PostListItem>;
  settings: SiteSettingsRecord;
}

export interface PostPageData {
  post: PostDetail;
  relatedPosts: PostListItem[];
  settings: SiteSettingsRecord;
}

export interface TagPageData {
  pagination: PaginationResult<PostListItem>;
  settings: SiteSettingsRecord;
  tag: TagSummary;
}

export interface SearchPageData {
  pagination: PaginationResult<PostListItem>;
  query: string | null;
  settings: SiteSettingsRecord;
}

export function getHomePageData(): HomePageData {
  const settings = getSiteSettings();

  return {
    featuredPosts: listPublishedPosts({
      featuredOnly: true,
      limit: 2,
      offset: 0,
    }).map(mapPostListItem),
    latestPosts: listPublishedPosts({
      limit: 6,
      offset: 0,
    }).map(mapPostListItem),
    settings,
    tags: listTagsWithPostCount(),
  };
}

export function getBlogIndexData(page: number): BlogIndexData {
  const offset = (page - 1) * BLOG_PAGE_SIZE;
  const totalItems = countPublishedPosts();
  const items = listPublishedPosts({
    limit: BLOG_PAGE_SIZE,
    offset,
  }).map(mapPostListItem);

  return {
    pagination: buildPagination(items, page, totalItems, BLOG_PAGE_SIZE),
    settings: getSiteSettings(),
  };
}

export function getPostPageData(slug: string): PostPageData | null {
  const post = getPublishedPostBySlug(slug);

  if (!post) {
    return null;
  }

  return {
    post: mapPostDetail(post),
    relatedPosts: listRelatedPosts(
      post.id,
      post.tags.map((tag) => tag.id),
      RELATED_POSTS_LIMIT,
    ).map(mapPostListItem),
    settings: getSiteSettings(),
  };
}

export function getTagPageData(slug: string, page: number): TagPageData | null {
  const tag = getTagBySlug(slug);

  if (!tag) {
    return null;
  }

  const offset = (page - 1) * BLOG_PAGE_SIZE;
  const totalItems = countPublishedPosts({ tagSlug: slug });
  const items = listPublishedPosts({
    limit: BLOG_PAGE_SIZE,
    offset,
    tagSlug: slug,
  }).map(mapPostListItem);

  return {
    pagination: buildPagination(items, page, totalItems, BLOG_PAGE_SIZE),
    settings: getSiteSettings(),
    tag,
  };
}

export function getSearchPageData(query: string | null, page: number): SearchPageData {
  const normalizedQuery = query?.trim() ?? null;

  if (!normalizedQuery) {
    return {
      pagination: buildPagination([], page, 0, SEARCH_PAGE_SIZE),
      query: null,
      settings: getSiteSettings(),
    };
  }

  const offset = (page - 1) * SEARCH_PAGE_SIZE;
  const totalItems = countPublishedPosts({ searchQuery: normalizedQuery });
  const items = listPublishedPosts({
    limit: SEARCH_PAGE_SIZE,
    offset,
    searchQuery: normalizedQuery,
  }).map(mapPostListItem);

  return {
    pagination: buildPagination(items, page, totalItems, SEARCH_PAGE_SIZE),
    query: normalizedQuery,
    settings: getSiteSettings(),
  };
}

export function getFeedPosts(): PostListItem[] {
  return listPublishedPosts({
    limit: 50,
    offset: 0,
  }).map(mapPostListItem);
}

export function getSitemapEntries(): Array<{ path: string; updatedAt: string }> {
  const posts = listPublishedPostSlugs();
  const tags = listTagsWithPostCount();

  return [
    { path: "/", updatedAt: new Date().toISOString() },
    { path: "/blog", updatedAt: new Date().toISOString() },
    { path: "/search", updatedAt: new Date().toISOString() },
    ...posts.map((post) => ({
      path: `/blog/${post.slug}`,
      updatedAt: post.updatedAt,
    })),
    ...tags.map((tag) => ({
      path: `/tags/${tag.slug}`,
      updatedAt: new Date().toISOString(),
    })),
  ];
}
