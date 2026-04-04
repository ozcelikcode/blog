import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

marked.setOptions({
  breaks: false,
  gfm: true,
});

export function renderMarkdownToHtml(markdown: string): string {
  const rawHtml = marked.parse(markdown, { async: false });

  return sanitizeHtml(rawHtml, {
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      code: ["class"],
      img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    },
    allowedClasses: {
      code: [/^language-[a-z0-9-]+$/],
    },
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "strong",
      "em",
      "code",
      "pre",
      "img",
      "hr",
    ],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
      img: sanitizeHtml.simpleTransform("img", {
        decoding: "async",
        loading: "lazy",
      }),
    },
  });
}
