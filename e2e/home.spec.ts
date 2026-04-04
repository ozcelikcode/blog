import { expect, test } from "@playwright/test";

test("homepage loads", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "A calm, durable blog stack for technical writing." })).toBeVisible();
});
