import { expect, test } from "@playwright/test";

test("post detail renders", async ({ page }) => {
  await page.goto("/blog/search-without-premature-complexity");

  await expect(page.getByRole("heading", { name: "Search without premature complexity" })).toBeVisible();
  await expect(page.getByText("by Deniz Kara")).toBeVisible();
  await expect(page.getByText("Search in v1 should be boring, obvious, and correct.")).toBeVisible();
});
