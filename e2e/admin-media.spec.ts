import path from "node:path";

import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./admin-helpers";

test("media upload works", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/media");

  await page.getByLabel("Alt text").fill("Uploaded through Playwright");
  await page.getByLabel("Image file").setInputFiles(
    path.resolve("public/images/og-default.svg"),
  );
  await page.getByRole("button", { name: "Upload" }).click();

  await expect(page).toHaveURL(/\/admin\/media\?asset=\d+$/);
  await expect(page.locator("section").filter({ hasText: "Selected asset" }).getByRole("img")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy URL" })).toBeVisible();
});
