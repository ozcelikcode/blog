import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./admin-helpers";

test("tags CRUD basic flow works", async ({ page }) => {
  const uniqueSuffix = Date.now().toString(36);
  const initialName = `Admin Tag ${uniqueSuffix}`;
  const initialSlug = `admin-tag-${uniqueSuffix}`;
  const updatedName = `${initialName} Updated`;
  const updatedSlug = `${initialSlug}-updated`;

  await loginAsAdmin(page);
  await page.goto("/admin/tags");

  await page.getByLabel("Name").fill(initialName);
  await page.getByLabel("Slug").fill(initialSlug);
  await page.getByRole("button", { name: "Create Tag" }).click();

  await expect(page).toHaveURL("/admin/tags");
  await expect(page.getByText(initialName)).toBeVisible();

  const initialRow = page.locator("tr").filter({ hasText: initialName });
  await initialRow.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Name").fill(updatedName);
  await page.getByLabel("Slug").fill(updatedSlug);
  await page.getByRole("button", { name: "Save Tag" }).click();

  await expect(page).toHaveURL("/admin/tags");
  await expect(page.getByText(updatedName)).toBeVisible();

  const row = page.locator("tr").filter({ hasText: updatedName });
  page.once("dialog", async (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row).toHaveCount(0);
});

test("settings update works", async ({ page }) => {
  const uniqueSuffix = Date.now().toString(36);
  const nextDescription = `Updated site description ${uniqueSuffix}`;

  await loginAsAdmin(page);
  await page.goto("/admin/settings");

  await page.getByLabel("Site description").fill(nextDescription);
  await page.getByRole("button", { name: "Save Settings" }).click();

  await expect(page).toHaveURL("/admin/settings");
  await expect(page.getByLabel("Site description")).toHaveValue(nextDescription);
});
