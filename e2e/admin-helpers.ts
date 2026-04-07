import type { Page } from "@playwright/test";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin(?:\/?$|\?)/);
}
