import { expect, test } from "@playwright/test";

test("search works", async ({ page }) => {
  await page.goto("/search");
  await page.getByRole("searchbox", { name: "Search posts" }).fill("sqlite");
  await page.getByRole("button", { name: "Search" }).click();

  await expect(page.getByRole("link", { name: "SQLite for content systems" })).toBeVisible();
});
