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
    check(
      "posts_status_check",
      sql`${table.status} in ('draft', 'scheduled', 'published')`,
    ),
  ],
);

export const tags = sqliteTable(
  "tags",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    createdAt: text("created_at").notNull().default(nowExpression),
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
      .references(() => tags.id, { onDelete: "cascade", onUpdate: "cascade" }),
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
  defaultOgImageUrl: text("default_og_image_url"),
  twitterHandle: text("twitter_handle"),
  newsletterHeading: text("newsletter_heading").notNull(),
  newsletterDescription: text("newsletter_description").notNull(),
  updatedAt: text("updated_at").notNull().default(nowExpression),
  createdAt: text("created_at").notNull().default(nowExpression),
});

export const newsletterSubscribers = sqliteTable(
  "newsletter_subscribers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    createdAt: text("created_at").notNull().default(nowExpression),
  },
  (table) => [
    uniqueIndex("newsletter_subscribers_email_unique").on(table.email),
    index("newsletter_subscribers_created_at_idx").on(table.createdAt),
  ],
);

export const authorsRelations = relations(authors, ({ many }) => ({
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
