import { expect, test } from "@playwright/test";

test("blog list renders", async ({ page }) => {
  await page.goto("/blog");

  await expect(page.getByRole("heading", { name: "All posts" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Astro as an editorial runtime" })).toBeVisible();
});
