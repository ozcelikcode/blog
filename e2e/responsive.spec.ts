import { expect, test } from "@playwright/test";

import { loginAsAdmin } from "./admin-helpers";

async function getViewportOverflow(page: import("@playwright/test").Page): Promise<{
  offenders?: Array<{ selector: string; width: number }>;
  innerWidth: number;
  scrollWidth: number;
}> {
  return page.evaluate(() => {
    const innerWidth = window.innerWidth;
    const scrollWidth = document.documentElement.scrollWidth;

    const offenders =
      scrollWidth > innerWidth + 1
        ? [...document.querySelectorAll("body *")]
            .map((element) => {
              const rect = element.getBoundingClientRect();
              const selector = element instanceof HTMLElement
                ? [element.tagName.toLowerCase(), element.className].filter(Boolean).join(".")
                : element.tagName.toLowerCase();

              return {
                selector,
                width: rect.width,
              };
            })
            .filter((item) => item.width > innerWidth + 1)
            .sort((left, right) => right.width - left.width)
            .slice(0, 12)
        : undefined;

    return {
      offenders,
      innerWidth,
      scrollWidth,
    };
  });
}

test.describe("responsive layouts", () => {
  test.use({ viewport: { height: 844, width: 390 } });

  test("public pages avoid horizontal overflow on mobile", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
    expect(await getViewportOverflow(page), "public home overflow").toEqual({
      offenders: undefined,
      innerWidth: 390,
      scrollWidth: 390,
    });

    await page.goto("/blog/astro-editorial-runtime");
    expect(await getViewportOverflow(page), "public post overflow").toEqual({
      offenders: undefined,
      innerWidth: 390,
      scrollWidth: 390,
    });
  });

  test("admin pages avoid horizontal overflow on mobile", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    expect(await getViewportOverflow(page), "admin dashboard overflow").toEqual({
      offenders: undefined,
      innerWidth: 390,
      scrollWidth: 390,
    });

    await page.goto("/admin/posts/new");
    await expect(page.getByRole("heading", { name: "New Post" })).toBeVisible();
    expect(await getViewportOverflow(page), "admin new post overflow").toEqual({
      offenders: undefined,
      innerWidth: 390,
      scrollWidth: 390,
    });
  });
});
