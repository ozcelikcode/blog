import { describe, expect, it } from "vitest";

import { serializeSiteLinkItems } from "@/lib/site-chrome";

import { validateSettingsForm } from "../validators/settings-form";

function buildValidFormData(): FormData {
  const formData = new FormData();

  formData.set("defaultOgImageUrl", "/images/og-default.svg");
  formData.set("defaultSeoDescription", "A durable editorial stack with strict operational boundaries.");
  formData.set("defaultSeoTitleTemplate", "%s | Editorial Signal");
  formData.set(
    "footerLinksJson",
    serializeSiteLinkItems([
      { href: "/rss.xml", id: "rss", label: "RSS" },
      { href: "/sitemap.xml", id: "sitemap", label: "Sitemap" },
    ]),
  );
  formData.set("footerText", "Built for thoughtful publishing and calm maintenance.");
  formData.set("homepageHeroBody", "Server-rendered writing with durable full-stack boundaries.");
  formData.set("homepageHeroTitle", "Editorial systems that stay easy to run.");
  formData.set(
    "navigationItemsJson",
    serializeSiteLinkItems([
      { href: "/", id: "home", label: "Home" },
      { href: "/blog", id: "blog", label: "Blog" },
      { href: "/search", id: "search", label: "Search" },
    ]),
  );
  formData.set("newsletterDescription", "One practical note every few weeks.");
  formData.set("newsletterHeading", "Quiet technical notes");
  formData.set("siteDescription", "A calm blog about maintainable engineering systems.");
  formData.set("siteTitle", "Editorial Signal");
  formData.set("siteUrl", "https://example.com");
  formData.set("twitterHandle", "@editorialsignal");

  return formData;
}

describe("settings form validator", () => {
  it("parses valid navigation and footer link collections", () => {
    const result = validateSettingsForm(buildValidFormData());

    expect(result.ok).toBe(true);
    expect(result.parsed?.navigationItems).toHaveLength(3);
    expect(result.parsed?.navigationItems[1]?.label).toBe("Blog");
    expect(result.parsed?.footerLinks[0]?.href).toBe("/rss.xml");
    expect(result.parsed?.footerText).toBe("Built for thoughtful publishing and calm maintenance.");
  });

  it("rejects invalid navigation JSON", () => {
    const formData = buildValidFormData();
    formData.set("navigationItemsJson", "not-json");

    const result = validateSettingsForm(formData);

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.navigationItemsJson).toBeTruthy();
  });
});
