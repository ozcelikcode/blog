import { relations, sql } from "drizzle-orm";
import { check, index, integer, primaryKey, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const nowExpression = sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

export const authors = sqliteTable(
  "authors",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    bio: text("bio"),
    avatarUrl: text("avatar_url"),
    createdAt: text("created_at").notNull().default(nowExpression),
    updatedAt: text("updated_at").notNull().default(nowExpression),
  },
  (table) => [index("authors_name_idx").on(table.name)],
);

export const posts = sqliteTable(
  "posts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    contentMarkdown: text("content_markdown").notNull(),
    coverImageUrl: text("cover_image_url"),
    status: text("status", {
      enum: ["draft", "scheduled", "published"],
    }).notNull(),
    isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
    showAuthorInMeta: integer("show_author_in_meta", { mode: "boolean" }).notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    canonicalUrl: text("canonical_url"),
    publishedAt: text("published_at"),
    updatedAt: text("updated_at").notNull().default(nowExpression),
    createdAt: text("created_at").notNull().default(nowExpression),
    authorId: integer("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "restrict", onUpdate: "cascade" }),
  },
  (table) => [
    uniqueIndex("posts_slug_unique").on(table.slug),
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
    index("posts_featured_published_at_idx").on(table.isFeatured, table.publishedAt),
    index("posts_author_updated_at_idx").on(table.authorId, table.updatedAt),
    check("posts_status_check", sql`${table.status} in ('draft', 'scheduled', 'published')`),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: text("created_at").notNull().default(nowExpression),
    updatedAt: text("updated_at").notNull().default(nowExpression),
  },
  (table) => [
    uniqueIndex("tags_slug_unique").on(table.slug),
    uniqueIndex("tags_name_unique").on(table.name),
  ],
);

export const postTags = sqliteTable(
  "post_tags",
  {
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade", onUpdate: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "restrict", onUpdate: "cascade" }),
    createdAt: text("created_at").notNull().default(nowExpression),
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.tagId] }),
    index("post_tags_tag_id_idx").on(table.tagId),
  ],
);

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  siteTitle: text("site_title").notNull(),
  siteDescription: text("site_description").notNull(),
  siteUrl: text("site_url").notNull(),
  navigationItemsJson: text("navigation_items_json").notNull(),
  footerText: text("footer_text").notNull(),
  footerLinksJson: text("footer_links_json").notNull(),
  defaultOgImageUrl: text("default_og_image_url"),
  twitterHandle: text("twitter_handle"),
  newsletterHeading: text("newsletter_heading").notNull(),
  newsletterDescription: text("newsletter_description").notNull(),
  defaultSeoTitleTemplate: text("default_seo_title_template").notNull(),
  defaultSeoDescription: text("default_seo_description").notNull(),
  homepageHeroTitle: text("homepage_hero_title").notNull(),
  homepageHeroBody: text("homepage_hero_body").notNull(),
  updatedAt: text("updated_at").notNull().default(nowExpression),
  createdAt: text("created_at").notNull().default(nowExpression),
});

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    status: text("status", {
      enum: ["active", "unsubscribed"],
    }).notNull().default("active"),
    source: text("source").notNull().default("website"),
    unsubscribedAt: text("unsubscribed_at"),
    updatedAt: text("updated_at").notNull().default(nowExpression),
    createdAt: text("created_at").notNull().default(nowExpression),
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_unique").on(table.email),
    index("newsletter_subscribers_status_created_at_idx").on(table.status, table.createdAt),
    check(
      "newsletter_subscribers_status_check",
      sql`${table.status} in ('active', 'unsubscribed')`,
    ),
  ],
);

export const adminUsers = sqliteTable(
  "admin_users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    authorId: integer("author_id").references(() => authors.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    role: text("role", {
      enum: ["admin", "editor"],
    }).notNull().default("admin"),
    lastLoginAt: text("last_login_at"),
    createdAt: text("created_at").notNull().default(nowExpression),
    updatedAt: text("updated_at").notNull().default(nowExpression),
  },
  (table) => [
    uniqueIndex("admin_users_email_unique").on(table.email),
    index("admin_users_role_idx").on(table.role),
    check("admin_users_role_check", sql`${table.role} in ('admin', 'editor')`),
  ],
);

export const mediaAssets = sqliteTable(
  "media_assets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    fileName: text("file_name").notNull(),
    originalFileName: text("original_file_name").notNull(),
    mimeType: text("mime_type").notNull(),
    fileSizeBytes: integer("file_size_bytes").notNull(),
    storagePath: text("storage_path").notNull(),
    publicUrl: text("public_url").notNull(),
    altText: text("alt_text"),
    uploadedByAdminUserId: integer("uploaded_by_admin_user_id").references(() => adminUsers.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    createdAt: text("created_at").notNull().default(nowExpression),
    updatedAt: text("updated_at").notNull().default(nowExpression),
  },
  (table) => [
    uniqueIndex("media_assets_storage_path_unique").on(table.storagePath),
    uniqueIndex("media_assets_public_url_unique").on(table.publicUrl),
    index("media_assets_created_at_idx").on(table.createdAt),
  ],
);

export const activityLogs = sqliteTable(
  "activity_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actorAdminUserId: integer("actor_admin_user_id").references(() => adminUsers.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    entityLabel: text("entity_label"),
    ipAddress: text("ip_address"),
    metadataJson: text("metadata_json"),
    createdAt: text("created_at").notNull().default(nowExpression),
  },
  (table) => [
    index("activity_logs_created_at_idx").on(table.createdAt),
    index("activity_logs_action_created_at_idx").on(table.action, table.createdAt),
    index("activity_logs_actor_created_at_idx").on(table.actorAdminUserId, table.createdAt),
  ],
);

export const authorsRelations = relations(authors, ({ many }) => ({
  adminUsers: many(adminUsers),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(authors, {
    fields: [posts.authorId],
    references: [authors.id],
  }),
  postTags: many(postTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ many, one }) => ({
  author: one(authors, {
    fields: [adminUsers.authorId],
    references: [authors.id],
  }),
  activityLogs: many(activityLogs),
  mediaAssets: many(mediaAssets),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  uploadedBy: one(adminUsers, {
    fields: [mediaAssets.uploadedByAdminUserId],
    references: [adminUsers.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  actor: one(adminUsers, {
    fields: [activityLogs.actorAdminUserId],
    references: [adminUsers.id],
  }),
}));
