import { expect, test } from "@playwright/test";

import { fillRichTextEditor, loginAsAdmin } from "./admin-helpers";

test("create, edit, and publish post works", async ({ page }) => {
  const uniqueSuffix = Date.now().toString(36);
  const draftTitle = `Admin Post ${uniqueSuffix}`;
  const draftSlug = `admin-post-${uniqueSuffix}`;
  const publishedTitle = `${draftTitle} Published`;
  const publishedSlug = `${draftSlug}-published`;

  await loginAsAdmin(page);
  await page.goto("/admin/posts/new");

  await expect(page.getByText("Author selection is locked for this workflow.")).toBeVisible();
  await expect(page.locator('input[name="authorId"][type="hidden"]')).toHaveValue("1");
  await page.locator("#title").fill(draftTitle);
  await page.locator('input[name="slug"]').fill(draftSlug);
  await page.locator('textarea[name="excerpt"]').fill("A post created through the admin panel to verify editorial workflows.");
  await fillRichTextEditor(page, "This post was created in Playwright through the admin editor.");
  await page.getByRole("button", { name: "Save Draft" }).click();

  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await expect(page.getByText("Post created", { exact: true })).toBeVisible();

  await page.locator("#title").fill(publishedTitle);
  await page.locator('input[name="slug"]').fill(publishedSlug);
  await page.getByRole("button", { name: "Publish Now" }).click();

  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await page.goto("/admin/posts");
  await page.locator("tr").filter({ hasText: publishedTitle }).getByRole("link", { name: "Edit" }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);
  await expect(page.locator("#title")).toHaveValue(publishedTitle);

  await page.goto("/admin/posts");
  await expect(page.getByRole("link", { name: publishedTitle })).toBeVisible();
  await expect(
    page.locator("tr").filter({ hasText: publishedTitle }).getByText(publishedSlug, { exact: true }),
  ).toBeVisible();

  await page.goto(`/blog/${publishedSlug}`);
  await expect(page.getByRole("heading", { name: publishedTitle })).toBeVisible();
  await expect(page.getByText("by Emre Ozcelik")).toBeVisible();

  await page.goto("/admin/posts");
  await page.locator("tr").filter({ hasText: publishedTitle }).getByRole("link", { name: "Edit" }).click();
  await page.locator('input[name="showAuthorInMeta"]').uncheck();
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/\d+$/);

  await page.goto(`/blog/${publishedSlug}`);
  await expect(page.getByText("by Emre Ozcelik")).toHaveCount(0);
});
