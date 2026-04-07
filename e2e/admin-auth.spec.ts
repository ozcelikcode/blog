import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./admin-helpers";

test("protected admin route redirects unauthenticated users", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
});

test("admin login and logout work", async ({ page }) => {
  await loginAsAdmin(page);

  await expect(page).toHaveURL("/admin");
  await expect(page.getByRole("heading", { name: "Curator's Overview" })).toBeVisible();

  await page.getByRole("button", { name: "Log Out" }).click();

  await expect(page).toHaveURL(/\/admin\/login\?logged-out=1/);
  await expect(page.getByText("You have been signed out.")).toBeVisible();
});
