import { expect, test } from "@playwright/test";

test("post detail renders", async ({ page }) => {
  await page.goto("/blog/astro-editorial-runtime");

  await expect(page.getByRole("heading", { name: "Astro as an editorial runtime" })).toBeVisible();
  await expect(page.getByText("Why this stack holds up")).toBeVisible();
});
