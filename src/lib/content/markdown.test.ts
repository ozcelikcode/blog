import { describe, expect, it } from "vitest";

import { renderMarkdownToHtml } from "./markdown";

describe("renderMarkdownToHtml", () => {
  it("renders supported markdown elements", () => {
    const html = renderMarkdownToHtml("# Title\n\nA [link](https://example.com)");

    expect(html).toContain("<h1>");
    expect(html).toContain("<a");
  });

  it("removes unsafe html", () => {
    const html = renderMarkdownToHtml('Hello <script>alert("x")</script>');

    expect(html).not.toContain("<script>");
  });
});
