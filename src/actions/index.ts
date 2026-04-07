import { defineAction } from "astro:actions";

import { getAdminSessionUser } from "@/lib/auth/session";
import { loginAdmin } from "@/features/admin/auth/services/auth-service";
import { deleteAdminAuthorById, saveAdminAuthor } from "@/features/admin/authors/services/admin-author-service";
import { uploadAdminMedia, updateAdminMediaDetails, deleteAdminMediaById } from "@/features/admin/media/services/admin-media-service";
import { mutateAdminPost } from "@/features/admin/posts/services/admin-post-service";
import { saveAdminSettings } from "@/features/admin/settings/services/admin-settings-service";
import { unsubscribeSubscriberById } from "@/features/admin/subscribers/services/admin-subscriber-service";
import { deleteAdminTagById, saveAdminTag } from "@/features/admin/tags/services/admin-tag-service";

function parsePositiveId(formData: FormData, fieldName: string): number {
  const rawValue = String(formData.get(fieldName) ?? "");
  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return parsedValue;
}

export const server = {
  admin: {
    authors: {
      delete: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, redirectTo: "/admin/login", values: {} };
          }

          try {
            deleteAdminAuthorById(parsePositiveId(formData, "authorId"), actor, context);
            return { ok: true, redirectTo: "/admin/authors", values: {} };
          } catch (error) {
            return {
              formError: error instanceof Error ? error.message : "Author deletion failed.",
              ok: false,
              values: {},
            };
          }
        },
      }),
      save: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, values: { authorId: "", avatarUrl: "", bio: "", name: "" } };
          }

          return saveAdminAuthor(formData, actor, context);
        },
      }),
    },
    login: defineAction({
      accept: "form",
      handler: async (formData, context) => loginAdmin(formData, context),
    }),
    media: {
      delete: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, redirectTo: "/admin/login", values: {} };
          }

          try {
            deleteAdminMediaById(parsePositiveId(formData, "mediaAssetId"), actor, context);
            return { ok: true, redirectTo: "/admin/media", values: {} };
          } catch (error) {
            return {
              formError: error instanceof Error ? error.message : "Media deletion failed.",
              ok: false,
              values: {},
            };
          }
        },
      }),
      update: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, values: { altText: "", mediaAssetId: "" } };
          }

          return updateAdminMediaDetails(formData, actor, context);
        },
      }),
      upload: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, values: { altText: "" } };
          }

          try {
            return uploadAdminMedia(formData, actor, context);
          } catch {
            return {
              formError: "Media upload failed. Try a different image or try again.",
              ok: false,
              values: {
                altText: String(formData.get("altText") ?? ""),
              },
            };
          }
        },
      }),
    },
    posts: {
      save: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return {
              formError: "Authentication required.",
              ok: false,
              values: {
                authorId: "",
                canonicalUrl: "",
                contentMarkdown: "",
                coverImageUrl: "",
                excerpt: "",
                intent: "save",
                isFeatured: false,
                publishedAt: "",
                seoDescription: "",
                seoTitle: "",
                slug: "",
                status: "draft",
                tagIds: [],
                title: "",
              },
            };
          }

          return mutateAdminPost(formData, actor, context);
        },
      }),
    },
    settings: {
      save: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return {
              formError: "Authentication required.",
              ok: false,
              values: {
                defaultOgImageUrl: "",
                defaultSeoDescription: "",
                defaultSeoTitleTemplate: "",
                homepageHeroBody: "",
                homepageHeroTitle: "",
                newsletterDescription: "",
                newsletterHeading: "",
                siteDescription: "",
                siteTitle: "",
                siteUrl: "",
                twitterHandle: "",
              },
            };
          }

          try {
            return saveAdminSettings(formData, actor, context);
          } catch {
            return {
              formError: "Settings could not be saved. Try again.",
              ok: false,
              values: {
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
              },
            };
          }
        },
      }),
    },
    subscribers: {
      unsubscribe: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, redirectTo: "/admin/login", values: {} };
          }

          try {
            unsubscribeSubscriberById(parsePositiveId(formData, "subscriberId"), actor, context);
            return { ok: true, redirectTo: "/admin/subscribers", values: {} };
          } catch (error) {
            return {
              formError: error instanceof Error ? error.message : "Subscriber update failed.",
              ok: false,
              values: {},
            };
          }
        },
      }),
    },
    tags: {
      delete: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, redirectTo: "/admin/login", values: {} };
          }

          try {
            deleteAdminTagById(parsePositiveId(formData, "tagId"), actor, context);
            return { ok: true, redirectTo: "/admin/tags", values: {} };
          } catch (error) {
            return {
              formError: error instanceof Error ? error.message : "Tag deletion failed.",
              ok: false,
              values: {},
            };
          }
        },
      }),
      save: defineAction({
        accept: "form",
        handler: async (formData, context) => {
          const actor = await getAdminSessionUser(context);
          if (!actor) {
            return { formError: "Authentication required.", ok: false, values: { name: "", slug: "" } };
          }

          return saveAdminTag(formData, actor, context);
        },
      }),
    },
  },
};
