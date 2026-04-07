import { z } from "zod";

import type { AdminFormState } from "@/features/admin/utils/form-state";

const settingsSchema = z.object({
  defaultOgImageUrl: z
    .string()
    .trim()
    .refine((value) => value.length === 0 || value.startsWith("/") || value.startsWith("http://") || value.startsWith("https://"), {
      message: "Enter a relative path or absolute URL.",
    }),
  defaultSeoDescription: z.string().trim().min(10).max(320),
  defaultSeoTitleTemplate: z.string().trim().min(3).max(160),
  homepageHeroBody: z.string().trim().min(10).max(400),
  homepageHeroTitle: z.string().trim().min(3).max(160),
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
  "defaultOgImageUrl" | "twitterHandle"
> & {
  defaultOgImageUrl: string | null;
  twitterHandle: string | null;
};

export function validateSettingsForm(formData: FormData): AdminFormState<SettingsFormValues> & {
  parsed?: SettingsMutationInput;
} {
  const values: SettingsFormValues = {
    defaultOgImageUrl: String(formData.get("defaultOgImageUrl") ?? ""),
    defaultSeoDescription: String(formData.get("defaultSeoDescription") ?? ""),
    defaultSeoTitleTemplate: String(formData.get("defaultSeoTitleTemplate") ?? ""),
    homepageHeroBody: String(formData.get("homepageHeroBody") ?? ""),
    homepageHeroTitle: String(formData.get("homepageHeroTitle") ?? ""),
    newsletterDescription: String(formData.get("newsletterDescription") ?? ""),
    newsletterHeading: String(formData.get("newsletterHeading") ?? ""),
    siteDescription: String(formData.get("siteDescription") ?? ""),
    siteTitle: String(formData.get("siteTitle") ?? ""),
    siteUrl: String(formData.get("siteUrl") ?? ""),
    twitterHandle: String(formData.get("twitterHandle") ?? ""),
  };

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

  return {
    ok: true,
    parsed: {
      ...parsed.data,
      defaultOgImageUrl: parsed.data.defaultOgImageUrl || null,
      twitterHandle: parsed.data.twitterHandle || null,
    },
    values,
  };
}
