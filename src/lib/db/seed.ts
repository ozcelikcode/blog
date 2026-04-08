import { hashPasswordSync } from "@/lib/auth/password";
import {
  DEFAULT_FOOTER_TEXT,
  getDefaultFooterLinks,
  getDefaultNavigationItems,
  serializeSiteLinkItems,
} from "@/lib/site-chrome";

import { createDatabaseContext, deleteDatabaseFiles, resolveDatabasePath } from "./client";
import {
  activityLogs,
  adminUsers,
  authors,
  mediaAssets,
  newsletterSubscribers,
  postTags,
  posts,
  siteSettings,
  tags,
} from "./schema";

interface SeedOptions {
  databaseUrl?: string;
  reset?: boolean;
}

const seedAuthors = [
  {
    avatarUrl: "/images/author-emre.svg",
    bio: "Writes about engineering systems, software delivery, and quiet product design.",
    name: "Emre Ozcelik",
  },
  {
    avatarUrl: "/images/author-deniz.svg",
    bio: "Focuses on frontend systems, documentation, and durable developer experience.",
    name: "Deniz Kara",
  },
];

const seedTags = [
  { name: "Architecture", slug: "architecture" },
  { name: "Astro", slug: "astro" },
  { name: "SQLite", slug: "sqlite" },
  { name: "TypeScript", slug: "typescript" },
  { name: "Performance", slug: "performance" },
  { name: "Testing", slug: "testing" },
];

const seedPosts = [
  {
    authorName: "Emre Ozcelik",
    canonicalUrl: null,
    contentMarkdown: `# Astro as an editorial runtime

Astro works well for blogs when the route layer stays thin and the data layer is disciplined.

## Why this stack holds up

- SQLite keeps the operational footprint small.
- Drizzle keeps schema drift explicit.
- Astro lets the rendered HTML stay fast by default.

> Good publishing systems optimize for maintenance first.

### Code that stays readable

\`\`\`ts
export function publishWindowIsOpen(publishedAt: string, now: string): boolean {
  return publishedAt <= now;
}
\`\`\`

Inline markdown stays clean, and [links](https://astro.build) remain readable without extra ceremony.

---

![Developer notebook](/images/post-editorial-runtime.svg)
`,
    coverImageUrl: "/images/post-editorial-runtime.svg",
    excerpt:
      "A practical case for Astro, SQLite, and server-rendered publishing when the goal is longevity instead of novelty.",
    isFeatured: true,
    publishedAt: "2026-03-28T09:00:00.000Z",
    seoDescription:
      "A production-oriented walkthrough of why Astro and SQLite make sense for a disciplined editorial stack.",
    seoTitle: "Astro as an editorial runtime",
    slug: "astro-editorial-runtime",
    status: "published" as const,
    tagSlugs: ["architecture", "astro", "sqlite"],
    title: "Astro as an editorial runtime",
  },
  {
    authorName: "Deniz Kara",
    canonicalUrl: null,
    contentMarkdown: `# Building less, maintaining more

Minimal software is not small because it avoids features. It is small because each feature keeps a narrow boundary.

## Review checklist

1. Move route logic into services.
2. Keep repositories focused on data access.
3. Make tests prove the edge cases.

> Thin routes age better than clever pages.

\`\`\`ts
const page = Number.parseInt(input, 10);
return Number.isFinite(page) && page > 0 ? page : 1;
\`\`\`
`,
    coverImageUrl: "/images/post-less-maintenance.svg",
    excerpt:
      "The fastest way to reduce future cost is to design for calm maintenance pressure today.",
    isFeatured: true,
    publishedAt: "2026-03-24T10:30:00.000Z",
    seoDescription:
      "A practical framing for thin routes, narrow services, and low-maintenance full-stack code.",
    seoTitle: "Building less, maintaining more",
    slug: "building-less-maintaining-more",
    status: "published" as const,
    tagSlugs: ["architecture", "typescript"],
    title: "Building less, maintaining more",
  },
  {
    authorName: "Emre Ozcelik",
    canonicalUrl: null,
    contentMarkdown: `# SQLite for content systems

SQLite is often dismissed too early. For a focused blog, it keeps the system operationally light without removing structure.

## What matters

- Foreign keys
- Explicit migrations
- Backups that are tested

\`\`\`sql
select slug, title
from posts
order by published_at desc;
\`\`\`
`,
    coverImageUrl: "/images/post-sqlite-content.svg",
    excerpt:
      "SQLite works extremely well for content-heavy systems when schema discipline and backup strategy are treated seriously.",
    isFeatured: false,
    publishedAt: "2026-03-19T07:15:00.000Z",
    seoDescription: "Why SQLite remains a strong option for focused publishing systems.",
    seoTitle: "SQLite for content systems",
    slug: "sqlite-for-content-systems",
    status: "published" as const,
    tagSlugs: ["sqlite", "architecture", "performance"],
    title: "SQLite for content systems",
  },
  {
    authorName: "Deniz Kara",
    canonicalUrl: null,
    contentMarkdown: `# Search without premature complexity

Search in v1 should be boring, obvious, and correct.

## Scope

- title
- excerpt
- tags

That is enough until the editorial volume proves otherwise.
`,
    coverImageUrl: "/images/post-pragmatic-search.svg",
    excerpt:
      "A pragmatic search implementation for a blog does not need a heavyweight indexing system on day one.",
    isFeatured: false,
    publishedAt: "2026-03-14T11:00:00.000Z",
    seoDescription: "Pragmatic search design for a small publishing stack.",
    seoTitle: "Search without premature complexity",
    slug: "search-without-premature-complexity",
    status: "published" as const,
    tagSlugs: ["architecture", "performance", "testing"],
    title: "Search without premature complexity",
  },
  {
    authorName: "Emre Ozcelik",
    canonicalUrl: null,
    contentMarkdown: `# Writing tests that protect refactors

Integration tests belong around the seams where regressions actually happen.

## Healthy coverage

- unit tests for pure logic
- repository tests for query behavior
- browser tests for primary user flows

Testing is about preserving confidence, not inflating numbers.
`,
    coverImageUrl: "/images/post-refactor-tests.svg",
    excerpt:
      "The useful testing split is small unit tests, direct repository coverage, and a thin end-to-end layer.",
    isFeatured: false,
    publishedAt: "2026-03-10T13:45:00.000Z",
    seoDescription: "A balanced testing strategy for a maintainable blog stack.",
    seoTitle: "Writing tests that protect refactors",
    slug: "writing-tests-that-protect-refactors",
    status: "published" as const,
    tagSlugs: ["testing", "typescript"],
    title: "Writing tests that protect refactors",
  },
  {
    authorName: "Deniz Kara",
    canonicalUrl: null,
    contentMarkdown: `# TypeScript boundaries that earn their keep

TypeScript is most valuable at the seams: route params, query parsing, validation, and data contracts.

## Focus on boundaries

- request parsing
- repository outputs
- shared UI props

The goal is not maximal typing. The goal is fewer surprising states.
`,
    coverImageUrl: "/images/post-typescript-boundaries.svg",
    excerpt:
      "Typing every line is not the point. Strong boundaries are what keep the system easy to reason about.",
    isFeatured: false,
    publishedAt: "2026-03-05T08:20:00.000Z",
    seoDescription: "Where strict TypeScript adds meaningful leverage in a content platform.",
    seoTitle: "TypeScript boundaries that earn their keep",
    slug: "typescript-boundaries-that-earn-their-keep",
    status: "published" as const,
    tagSlugs: ["typescript", "architecture"],
    title: "TypeScript boundaries that earn their keep",
  },
  {
    authorName: "Emre Ozcelik",
    canonicalUrl: null,
    contentMarkdown: `# Draft notes on content operations

This draft stays hidden until it is intentionally published.`,
    coverImageUrl: null,
    excerpt: "A hidden draft used to validate status-based visibility.",
    isFeatured: false,
    publishedAt: null,
    seoDescription: "Draft example",
    seoTitle: "Draft notes on content operations",
    slug: "draft-notes-on-content-operations",
    status: "draft" as const,
    tagSlugs: ["architecture"],
    title: "Draft notes on content operations",
  },
  {
    authorName: "Deniz Kara",
    canonicalUrl: null,
    contentMarkdown: `# Scheduled notes on the next release

This post should remain hidden until the scheduled publish window opens.`,
    coverImageUrl: null,
    excerpt: "A scheduled post for visibility tests.",
    isFeatured: false,
    publishedAt: "2026-04-20T09:00:00.000Z",
    seoDescription: "Scheduled example",
    seoTitle: "Scheduled notes on the next release",
    slug: "scheduled-notes-on-the-next-release",
    status: "scheduled" as const,
    tagSlugs: ["testing"],
    title: "Scheduled notes on the next release",
  },
];

const seedMediaAssets = [
  {
    altText: "Editorial notebook and keyboard in soft contrast lighting.",
    fileName: "editorial-runtime.svg",
    fileSizeBytes: 1850,
    mimeType: "image/svg+xml",
    originalFileName: "post-editorial-runtime.svg",
    publicUrl: "/images/post-editorial-runtime.svg",
    storagePath: "public/images/post-editorial-runtime.svg",
  },
  {
    altText: "Abstract layout blocks representing publishing structure.",
    fileName: "sqlite-content.svg",
    fileSizeBytes: 1650,
    mimeType: "image/svg+xml",
    originalFileName: "post-sqlite-content.svg",
    publicUrl: "/images/post-sqlite-content.svg",
    storagePath: "public/images/post-sqlite-content.svg",
  },
];

export function seedDatabase(options: SeedOptions = {}): void {
  const databaseUrl = options.databaseUrl;
  const databasePath = resolveDatabasePath(databaseUrl);

  if (options.reset) {
    deleteDatabaseFiles(databasePath);
  }

  const context = createDatabaseContext(databaseUrl, { runMigrations: true });
  const { db, sqlite } = context;

  sqlite.transaction(() => {
    db.delete(activityLogs).run();
    db.delete(mediaAssets).run();
    db.delete(postTags).run();
    db.delete(newsletterSubscribers).run();
    db.delete(posts).run();
    db.delete(tags).run();
    db.delete(adminUsers).run();
    db.delete(authors).run();
    db.delete(siteSettings).run();

    db.insert(siteSettings)
      .values({
        createdAt: "2026-03-01T09:00:00.000Z",
        defaultOgImageUrl: "/images/og-default.svg",
        defaultSeoDescription:
          "A focused blog about maintainable full-stack systems, editorial architecture, and disciplined engineering.",
        defaultSeoTitleTemplate: "%s | Developer Blog",
        footerLinksJson: serializeSiteLinkItems(getDefaultFooterLinks()),
        footerText: DEFAULT_FOOTER_TEXT,
        homepageHeroBody:
          "Server-rendered publishing with Astro, SQLite, and strict TypeScript. Minimal UI, disciplined architecture, and content stored where the application can own it.",
        homepageHeroTitle: "A calm, durable blog stack for technical writing.",
        id: 1,
        navigationItemsJson: serializeSiteLinkItems(getDefaultNavigationItems()),
        newsletterDescription:
          "One practical note on engineering, architecture, or editorial systems every few weeks.",
        newsletterHeading: "Quiet technical notes in your inbox",
        siteDescription:
          "A focused blog about maintainable full-stack systems, editorial architecture, and disciplined engineering.",
        siteTitle: "Developer Blog",
        siteUrl: "http://localhost:4321",
        twitterHandle: "@developerblog",
        updatedAt: "2026-03-01T09:00:00.000Z",
      })
      .run();

    const insertedAuthors = db
      .insert(authors)
      .values(
        seedAuthors.map((author) => ({
          ...author,
          createdAt: "2026-03-01T09:00:00.000Z",
          updatedAt: "2026-03-01T09:00:00.000Z",
        })),
      )
      .returning({ id: authors.id, name: authors.name })
      .all();
    const authorByName = new Map(insertedAuthors.map((author) => [author.name, author.id]));

    const defaultAdminAuthorId = authorByName.get("Emre Ozcelik");

    if (!defaultAdminAuthorId) {
      throw new Error("Missing default admin author.");
    }

    const [seededAdmin] = db
      .insert(adminUsers)
      .values({
        authorId: defaultAdminAuthorId,
        createdAt: "2026-03-01T09:00:00.000Z",
        email: "admin@example.com",
        lastLoginAt: "2026-04-01T08:00:00.000Z",
        name: "Emre Ozcelik",
        passwordHash: hashPasswordSync("ChangeMe123!"),
        role: "admin",
        updatedAt: "2026-04-01T08:00:00.000Z",
      })
      .returning({
        authorId: adminUsers.authorId,
        email: adminUsers.email,
        id: adminUsers.id,
        name: adminUsers.name,
        role: adminUsers.role,
      })
      .all();

    if (!seededAdmin) {
      throw new Error("Failed to seed admin user.");
    }

    db.insert(mediaAssets)
      .values(
        seedMediaAssets.map((asset) => ({
          ...asset,
          createdAt: "2026-03-02T10:00:00.000Z",
          updatedAt: "2026-03-02T10:00:00.000Z",
          uploadedByAdminUserId: seededAdmin.id,
        })),
      )
      .run();

    const insertedTags = db
      .insert(tags)
      .values(
        seedTags.map((tag) => ({
          ...tag,
          createdAt: "2026-03-01T09:00:00.000Z",
          updatedAt: "2026-03-01T09:00:00.000Z",
        })),
      )
      .returning({ id: tags.id, slug: tags.slug })
      .all();
    const tagBySlug = new Map(insertedTags.map((tag) => [tag.slug, tag.id]));

    for (const post of seedPosts) {
      const authorId = authorByName.get(post.authorName);

      if (!authorId) {
        throw new Error(`Missing seed author: ${post.authorName}`);
      }

      const [insertedPost] = db
        .insert(posts)
        .values({
          authorId,
          canonicalUrl: post.canonicalUrl,
          contentMarkdown: post.contentMarkdown,
          coverImageUrl: post.coverImageUrl,
          createdAt: post.publishedAt ?? "2026-03-01T09:00:00.000Z",
          excerpt: post.excerpt,
          isFeatured: post.isFeatured,
          publishedAt: post.publishedAt,
          seoDescription: post.seoDescription,
          seoTitle: post.seoTitle,
          slug: post.slug,
          status: post.status,
          title: post.title,
          updatedAt: post.publishedAt ?? "2026-03-01T09:00:00.000Z",
        })
        .returning({ id: posts.id, slug: posts.slug, title: posts.title })
        .all();

      if (!insertedPost) {
        throw new Error(`Failed to insert seed post: ${post.slug}`);
      }

      db.insert(postTags)
        .values(
          post.tagSlugs.map((tagSlug) => {
            const tagId = tagBySlug.get(tagSlug);

            if (!tagId) {
              throw new Error(`Missing seed tag: ${tagSlug}`);
            }

            return {
              postId: insertedPost.id,
              tagId,
            };
          }),
        )
        .run();
    }

    db.insert(newsletterSubscribers)
      .values([
        {
          createdAt: "2026-03-30T08:00:00.000Z",
          email: "reader@example.com",
          source: "homepage",
          status: "active",
          updatedAt: "2026-03-30T08:00:00.000Z",
        },
        {
          createdAt: "2026-03-25T11:15:00.000Z",
          email: "former-reader@example.com",
          source: "article",
          status: "unsubscribed",
          unsubscribedAt: "2026-04-01T12:30:00.000Z",
          updatedAt: "2026-04-01T12:30:00.000Z",
        },
      ])
      .run();

    db.insert(activityLogs)
      .values([
        {
          action: "auth.login",
          actorAdminUserId: seededAdmin.id,
          createdAt: "2026-04-01T08:00:00.000Z",
          entityId: String(seededAdmin.id),
          entityLabel: seededAdmin.email,
          entityType: "admin_user",
          ipAddress: "127.0.0.1",
        },
        {
          action: "posts.publish",
          actorAdminUserId: seededAdmin.id,
          createdAt: "2026-03-28T09:00:00.000Z",
          entityId: "1",
          entityLabel: "Astro as an editorial runtime",
          entityType: "post",
          ipAddress: "127.0.0.1",
        },
        {
          action: "settings.update",
          actorAdminUserId: seededAdmin.id,
          createdAt: "2026-03-20T14:15:00.000Z",
          entityId: "1",
          entityLabel: "Site settings",
          entityType: "site_settings",
          ipAddress: "127.0.0.1",
        },
      ])
      .run();
  })();

  const settingsRow = db.select({ id: siteSettings.id }).from(siteSettings).limit(1).all()[0];

  if (!settingsRow) {
    throw new Error("Seed failed to create site settings.");
  }

  sqlite.close();
}
