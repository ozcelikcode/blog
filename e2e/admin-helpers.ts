import type { Page } from "@playwright/test";

export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("ChangeMe123!");
  await page.getByRole("button", { name: "Sign In" }).click();
  await page.waitForURL(/\/admin(?:\/?$|\?)/);
}

export async function fillRichTextEditor(page: Page, text: string): Promise<void> {
  await page.locator(".toastui-editor-ww-container [contenteditable='true']").first().fill(text);
}
