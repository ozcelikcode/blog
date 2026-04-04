import { describe, expect, it } from "vitest";

import { calculateReadingTime } from "./reading-time";

describe("calculateReadingTime", () => {
  it("returns at least one minute for short content", () => {
    expect(calculateReadingTime("Short note")).toBe(1);
  });

  it("ignores markdown syntax while counting words", () => {
    const value = calculateReadingTime(`
# Title

This is a paragraph with enough words to count properly.

\`\`\`ts
console.log("ignore code fences");
\`\`\`
`);

    expect(value).toBe(1);
  });
});
