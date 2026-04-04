import { describe, expect, it } from "vitest";

import { parsePageQuery, parseSearchQuery } from "../validators/post-queries";

describe("blog query validators", () => {
  it("defaults invalid pages to one", () => {
    expect(parsePageQuery(new URLSearchParams({ page: "0" }))).toBe(1);
    expect(parsePageQuery(new URLSearchParams({ page: "-5" }))).toBe(1);
  });

  it("parses search query text and page", () => {
    expect(parseSearchQuery(new URLSearchParams({ page: "2", q: "astro" }))).toEqual({
      page: 2,
      query: "astro",
    });
  });
});
