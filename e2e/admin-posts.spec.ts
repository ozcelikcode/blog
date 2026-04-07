import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./admin-helpers";

test("create, edit, and publish post works", async ({ page }) => {
  const uniqueSuffix = Date.now().toString(36);
  const draftTitle = `Admin Post ${uniqueSuffix}`;
  const draftSlug = `admin-post-${uniqueSuffix}`;
  const publishedTitle = `${draftTitle} Published`;
  const publishedSlug = `${draftSlug}-published`;

  await loginAsAdmin(page);
  await page.goto("/admin/posts/new");

  await page.locator("#title").fill(draftTitle);
  await page.locator('input[name="slug"]').fill(draftSlug);
  await page.locator('select[name="authorId"]').selectOption({ label: "Emre Ozcelik" });
  await page.locator('textarea[name="excerpt"]').fill("A post created through the admin panel to verify editorial workflows.");
  await page.locator('textarea[name="contentMarkdown"]').fill("# Admin flow\n\nThis post was created in Playwright.");
  await page.getByRole("button", { name: "Save Draft" }).click();

  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await expect(page.getByText("Post created", { exact: true })).toBeVisible();

  await page.locator("#title").fill(publishedTitle);
  await page.locator('input[name="slug"]').fill(publishedSlug);
  await page.getByRole("button", { name: "Publish Now" }).click();

  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await page.goto("/admin/posts");
  await expect(page.getByRole("link", { name: publishedTitle })).toBeVisible();
  await expect(page.getByText(publishedSlug)).toBeVisible();

  await page.goto(`/blog/${publishedSlug}`);
  await expect(page.getByRole("heading", { name: publishedTitle })).toBeVisible();
});
