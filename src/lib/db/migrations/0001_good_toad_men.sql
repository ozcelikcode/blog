CREATE TABLE `admin_users` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `password_hash` text NOT NULL,
  `role` text DEFAULT 'admin' NOT NULL,
  `last_login_at` text,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  CONSTRAINT "admin_users_role_check" CHECK("admin_users"."role" in ('admin', 'editor'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_users_email_unique` ON `admin_users` (`email`);
--> statement-breakpoint
CREATE INDEX `admin_users_role_idx` ON `admin_users` (`role`);
--> statement-breakpoint
CREATE TABLE `media_assets` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `file_name` text NOT NULL,
  `original_file_name` text NOT NULL,
  `mime_type` text NOT NULL,
  `file_size_bytes` integer NOT NULL,
  `storage_path` text NOT NULL,
  `public_url` text NOT NULL,
  `alt_text` text,
  `uploaded_by_admin_user_id` integer,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  FOREIGN KEY (`uploaded_by_admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_storage_path_unique` ON `media_assets` (`storage_path`);
--> statement-breakpoint
CREATE UNIQUE INDEX `media_assets_public_url_unique` ON `media_assets` (`public_url`);
--> statement-breakpoint
CREATE INDEX `media_assets_created_at_idx` ON `media_assets` (`created_at`);
--> statement-breakpoint
CREATE TABLE `activity_logs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `actor_admin_user_id` integer,
  `action` text NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text,
  `entity_label` text,
  `ip_address` text,
  `metadata_json` text,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  FOREIGN KEY (`actor_admin_user_id`) REFERENCES `admin_users`(`id`) ON UPDATE cascade ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `activity_logs_created_at_idx` ON `activity_logs` (`created_at`);
--> statement-breakpoint
CREATE INDEX `activity_logs_action_created_at_idx` ON `activity_logs` (`action`, `created_at`);
--> statement-breakpoint
CREATE INDEX `activity_logs_actor_created_at_idx` ON `activity_logs` (`actor_admin_user_id`, `created_at`);
--> statement-breakpoint
ALTER TABLE `authors` ADD `updated_at` text NOT NULL DEFAULT '1970-01-01T00:00:00.000Z';
--> statement-breakpoint
UPDATE `authors`
SET `updated_at` = `created_at`
WHERE `updated_at` = '1970-01-01T00:00:00.000Z';
--> statement-breakpoint
CREATE TABLE `__new_newsletter_subscribers` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `email` text NOT NULL,
  `status` text DEFAULT 'active' NOT NULL,
  `source` text DEFAULT 'website' NOT NULL,
  `unsubscribed_at` text,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  CONSTRAINT "newsletter_subscribers_status_check" CHECK("__new_newsletter_subscribers"."status" in ('active', 'unsubscribed'))
);
--> statement-breakpoint
INSERT INTO `__new_newsletter_subscribers` (
  `id`,
  `email`,
  `status`,
  `source`,
  `unsubscribed_at`,
  `updated_at`,
  `created_at`
)
SELECT
  `id`,
  `email`,
  'active',
  'website',
  NULL,
  `created_at`,
  `created_at`
FROM `newsletter_subscribers`;
--> statement-breakpoint
DROP TABLE `newsletter_subscribers`;
--> statement-breakpoint
ALTER TABLE `__new_newsletter_subscribers` RENAME TO `newsletter_subscribers`;
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);
--> statement-breakpoint
CREATE INDEX `newsletter_subscribers_status_created_at_idx` ON `newsletter_subscribers` (`status`, `created_at`);
--> statement-breakpoint
CREATE TABLE `__new_site_settings` (
  `id` integer PRIMARY KEY NOT NULL,
  `site_title` text NOT NULL,
  `site_description` text NOT NULL,
  `site_url` text NOT NULL,
  `default_og_image_url` text,
  `twitter_handle` text,
  `newsletter_heading` text NOT NULL,
  `newsletter_description` text NOT NULL,
  `default_seo_title_template` text NOT NULL,
  `default_seo_description` text NOT NULL,
  `homepage_hero_title` text NOT NULL,
  `homepage_hero_body` text NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_site_settings` (
  `id`,
  `site_title`,
  `site_description`,
  `site_url`,
  `default_og_image_url`,
  `twitter_handle`,
  `newsletter_heading`,
  `newsletter_description`,
  `default_seo_title_template`,
  `default_seo_description`,
  `homepage_hero_title`,
  `homepage_hero_body`,
  `updated_at`,
  `created_at`
)
SELECT
  `id`,
  `site_title`,
  `site_description`,
  `site_url`,
  `default_og_image_url`,
  `twitter_handle`,
  `newsletter_heading`,
  `newsletter_description`,
  '%s | ' || `site_title`,
  `site_description`,
  `site_title`,
  `site_description`,
  `updated_at`,
  `created_at`
FROM `site_settings`;
--> statement-breakpoint
DROP TABLE `site_settings`;
--> statement-breakpoint
ALTER TABLE `__new_site_settings` RENAME TO `site_settings`;
--> statement-breakpoint
CREATE TABLE `__post_tags_backup` (
  `post_id` integer NOT NULL,
  `tag_id` integer NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__post_tags_backup` (`post_id`, `tag_id`, `created_at`)
SELECT `post_id`, `tag_id`, `created_at`
FROM `post_tags`;
--> statement-breakpoint
DROP TABLE `post_tags`;
--> statement-breakpoint
CREATE TABLE `__new_tags` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `slug` text NOT NULL,
  `name` text NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tags` (`id`, `slug`, `name`, `created_at`, `updated_at`)
SELECT `id`, `slug`, `name`, `created_at`, `created_at`
FROM `tags`;
--> statement-breakpoint
DROP TABLE `tags`;
--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);
--> statement-breakpoint
CREATE TABLE `post_tags` (
  `post_id` integer NOT NULL,
  `tag_id` integer NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  PRIMARY KEY(`post_id`, `tag_id`),
  FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE cascade ON DELETE cascade,
  FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE cascade ON DELETE restrict
);
--> statement-breakpoint
INSERT INTO `post_tags` (`post_id`, `tag_id`, `created_at`)
SELECT `post_id`, `tag_id`, `created_at`
FROM `__post_tags_backup`;
--> statement-breakpoint
DROP TABLE `__post_tags_backup`;
--> statement-breakpoint
CREATE INDEX `post_tags_tag_id_idx` ON `post_tags` (`tag_id`);
--> statement-breakpoint
CREATE INDEX `posts_author_updated_at_idx` ON `posts` (`author_id`, `updated_at`);
