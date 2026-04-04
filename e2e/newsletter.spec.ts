import { expect, test } from "@playwright/test";

test("newsletter submission basic flow works", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "Email address" }).fill("playwright-reader@example.com");
  await page.getByRole("button", { name: "Subscribe" }).click();

  await expect(page.getByText("You’re subscribed.")).toBeVisible();
});
