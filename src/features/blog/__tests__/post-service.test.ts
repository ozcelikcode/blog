import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSeededTestDatabase } from "@/lib/db/test-utils";

import {
  getBlogIndexData,
  getHomePageData,
  getPostPageData,
  getSearchPageData,
  getTagPageData,
} from "../services/post-service";

let cleanup: (() => void) | undefined;

beforeEach(() => {
  cleanup = createSeededTestDatabase().cleanup;
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("post service", () => {
  it("returns featured and latest content for the homepage", () => {
    const data = getHomePageData();

    expect(data.featuredPosts).toHaveLength(2);
    expect(data.latestPosts.length).toBeGreaterThanOrEqual(6);
  });

  it("excludes draft and future scheduled posts from public results", () => {
    expect(getPostPageData("draft-notes-on-content-operations")).toBeNull();
    expect(getPostPageData("scheduled-notes-on-the-next-release")).toBeNull();
  });

  it("supports search and tag archives", () => {
    const searchData = getSearchPageData("sqlite", 1);
    const tagData = getTagPageData("architecture", 1);

    expect(searchData.pagination.items.some((post) => post.slug === "sqlite-for-content-systems")).toBe(
      true,
    );
    expect(tagData?.pagination.items.length).toBeGreaterThan(0);
  });

  it("paginates the blog index", () => {
    const data = getBlogIndexData(1);

    expect(data.pagination.totalItems).toBe(6);
    expect(data.pagination.items).toHaveLength(6);
  });
});
