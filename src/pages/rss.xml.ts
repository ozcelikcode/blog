import rss from "@astrojs/rss";

import { getFeedPosts } from "@/features/blog/services/post-service";
import { getSiteSettings } from "@/features/blog/repositories/site-repository";

export async function GET() {
  const settings = getSiteSettings();
  const posts = getFeedPosts();

  return rss({
    description: settings.siteDescription,
    items: posts.map((post) => ({
      description: post.excerpt,
      link: `/blog/${post.slug}`,
      pubDate: new Date(post.publishedAt),
      title: post.title,
    })),
    site: settings.siteUrl,
    title: settings.siteTitle,
  });
}
