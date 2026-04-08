import { z } from "zod";

import type { AdminFormState } from "@/features/admin/utils/form-state";
import {
  DEFAULT_FOOTER_TEXT,
  getDefaultFooterLinks,
  getDefaultNavigationItems,
  serializeSiteLinkItems,
  siteLinkCollectionSchema,
} from "@/lib/site-chrome";

const settingsSchema = z.object({
  defaultOgImageUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"), {
      message: "Enter a relative path or absolute URL.",
    }),
  defaultSeoDescription: z.string().trim().min(10).max(320),
  defaultSeoTitleTemplate: z.string().trim().min(3).max(160),
  footerLinksJson: z.string(),
  footerText: z.string().trim().min(10).max(240),
  homepageHeroBody: z.string().trim().min(10).max(400),
  homepageHeroTitle: z.string().trim().min(3).max(160),
  navigationItemsJson: z.string(),
  newsletterDescription: z.string().trim().min(10).max(320),
  newsletterHeading: z.string().trim().min(3).max(120),
  siteDescription: z.string().trim().min(10).max(320),
  siteTitle: z.string().trim().min(2).max(120),
  siteUrl: z.url(),
  twitterHandle: z.string().trim().max(80),
});

export type SettingsFormValues = z.input<typeof settingsSchema>;
export type SettingsMutationInput = Omit<
  z.output<typeof settingsSchema>,
  "defaultOgImageUrl" | "footerLinksJson" | "navigationItemsJson" | "twitterHandle"
> & {
  defaultOgImageUrl: string | null;
  footerLinks: z.output<typeof siteLinkCollectionSchema>;
  navigationItems: z.output<typeof siteLinkCollectionSchema>;
  twitterHandle: string | null;
};

export function createDefaultSettingsFormValues(): SettingsFormValues {
  return {
    defaultOgImageUrl: "",
    defaultSeoDescription: "",
    defaultSeoTitleTemplate: "",
    footerLinksJson: serializeSiteLinkItems(getDefaultFooterLinks()),
    footerText: DEFAULT_FOOTER_TEXT,
    homepageHeroBody: "",
    homepageHeroTitle: "",
    navigationItemsJson: serializeSiteLinkItems(getDefaultNavigationItems()),
    newsletterDescription: "",
    newsletterHeading: "",
    siteDescription: "",
    siteTitle: "",
    siteUrl: "",
    twitterHandle: "",
  };
}

export function getSettingsFormValues(formData: FormData): SettingsFormValues {
  return {
    defaultOgImageUrl: String(formData.get("defaultOgImageUrl") ?? ""),
    defaultSeoDescription: String(formData.get("defaultSeoDescription") ?? ""),
    defaultSeoTitleTemplate: String(formData.get("defaultSeoTitleTemplate") ?? ""),
    footerLinksJson: String(formData.get("footerLinksJson") ?? serializeSiteLinkItems(getDefaultFooterLinks())),
    footerText: String(formData.get("footerText") ?? DEFAULT_FOOTER_TEXT),
    homepageHeroBody: String(formData.get("homepageHeroBody") ?? ""),
    homepageHeroTitle: String(formData.get("homepageHeroTitle") ?? ""),
    navigationItemsJson: String(
      formData.get("navigationItemsJson") ?? serializeSiteLinkItems(getDefaultNavigationItems()),
    ),
    newsletterDescription: String(formData.get("newsletterDescription") ?? ""),
    newsletterHeading: String(formData.get("newsletterHeading") ?? ""),
    siteDescription: String(formData.get("siteDescription") ?? ""),
    siteTitle: String(formData.get("siteTitle") ?? ""),
    siteUrl: String(formData.get("siteUrl") ?? ""),
    twitterHandle: String(formData.get("twitterHandle") ?? ""),
  };
}

export function validateSettingsForm(formData: FormData): AdminFormState<SettingsFormValues> & {
  parsed?: SettingsMutationInput;
} {
  const values = getSettingsFormValues(formData);

  const parsed = settingsSchema.safeParse(values);

  if (!parsed.success) {
    return {
      fieldErrors: Object.fromEntries(
        parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
      ),
      ok: false,
      values,
    };
  }

  let navigationJsonValue: unknown;
  try {
    navigationJsonValue = JSON.parse(parsed.data.navigationItemsJson);
  } catch {
    return {
      fieldErrors: {
        navigationItemsJson: "Review the primary navigation links before saving.",
      },
      ok: false,
      values,
    };
  }

  const navigationItems = siteLinkCollectionSchema.safeParse(navigationJsonValue);
  if (!navigationItems.success) {
    return {
      fieldErrors: {
        navigationItemsJson: "Review the primary navigation links before saving.",
      },
      ok: false,
      values,
    };
  }

  let footerJsonValue: unknown;
  try {
    footerJsonValue = JSON.parse(parsed.data.footerLinksJson);
  } catch {
    return {
      fieldErrors: {
        footerLinksJson: "Review the footer links before saving.",
      },
      ok: false,
      values,
    };
  }

  const footerLinks = siteLinkCollectionSchema.safeParse(footerJsonValue);
  if (!footerLinks.success) {
    return {
      fieldErrors: {
        footerLinksJson: "Review the footer links before saving.",
      },
      ok: false,
      values,
    };
  }

  return {
    ok: true,
    parsed: {
      ...parsed.data,
      defaultOgImageUrl: parsed.data.defaultOgImageUrl || null,
      footerLinks: footerLinks.data,
      navigationItems: navigationItems.data,
      twitterHandle: parsed.data.twitterHandle || null,
    },
    values,
  };
}
