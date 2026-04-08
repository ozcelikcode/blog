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
  await expect(
    page.locator("tr").filter({ hasText: initialName }).getByRole("cell", { name: initialName }),
  ).toBeVisible();

  const initialRow = page.locator("tr").filter({ hasText: initialName });
  await initialRow.getByRole("link", { name: "Edit" }).click();
  await page.getByLabel("Name").fill(updatedName);
  await page.getByLabel("Slug").fill(updatedSlug);
  await page.getByRole("button", { name: "Save Tag" }).click();

  await expect(page).toHaveURL("/admin/tags");
  await expect(
    page.locator("tr").filter({ hasText: updatedName }).getByRole("cell", { name: updatedName }),
  ).toBeVisible();

  const row = page.locator("tr").filter({ hasText: updatedName });
  page.once("dialog", async (dialog) => dialog.accept());
  await row.getByRole("button", { name: "Delete" }).click();
  await expect(row).toHaveCount(0);
});

test("settings update works", async ({ page }) => {
  const uniqueSuffix = Date.now().toString(36);
  const nextTitle = `Editorial Signal ${uniqueSuffix}`;
  const nextDescription = `Updated site description ${uniqueSuffix}`;
  const nextNavLabel = `Field Notes ${uniqueSuffix}`;
  const nextFooterText = `Minimal footer copy ${uniqueSuffix}`;
  const nextFooterLabel = `Status ${uniqueSuffix}`;
  const nextFooterHref = `/search?tag=${uniqueSuffix}`;

  await loginAsAdmin(page);
  await page.goto("/admin/settings");

  await page.getByLabel("Site title").fill(nextTitle);
  await page.getByLabel("Site description").fill(nextDescription);
  const navigationEditor = page.locator("[data-link-editor]").filter({ hasText: "Primary Navigation" });
  await navigationEditor.getByRole("button", { name: "Add Navigation Link" }).click();
  const newNavigationItem = navigationEditor.locator(".admin-link-editor-item").last();
  await newNavigationItem.getByLabel("Label").fill(nextNavLabel);
  await newNavigationItem.getByLabel("URL").fill("/blog");

  await page.getByLabel("Footer text").fill(nextFooterText);
  const footerEditor = page.locator("[data-link-editor]").filter({ hasText: "Footer Links" });
  await footerEditor.getByRole("button", { name: "Add Footer Link" }).click();
  const newFooterItem = footerEditor.locator(".admin-link-editor-item").last();
  await newFooterItem.getByLabel("Label").fill(nextFooterLabel);
  await newFooterItem.getByLabel("URL").fill(nextFooterHref);
  await page.getByRole("button", { name: "Save Settings" }).click();

  await expect(page).toHaveURL("/admin/settings");
  await expect(page.getByText(nextTitle, { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel("Site description")).toHaveValue(nextDescription);
  await expect(page.getByLabel("Footer text")).toHaveValue(nextFooterText);
  await page.goto("/");
  await expect(page.getByRole("link", { name: nextTitle })).toBeVisible();
  await expect(page.getByRole("link", { name: nextNavLabel })).toBeVisible();
  await expect(page.getByText(nextFooterText, { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: nextFooterLabel })).toBeVisible();
  await page.goto("/admin");
  await expect(page.getByRole("link", { name: nextTitle })).toBeVisible();
});
