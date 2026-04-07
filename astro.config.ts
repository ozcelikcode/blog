import { fileURLToPath } from "node:url";

import node from "@astrojs/node";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

const site = process.env.SITE_URL ?? "http://localhost:4321";

export default defineConfig({
  site,
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  session: {
    cookie: {
      name: "developer_blog_session",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
    ttl: 60 * 60 * 12,
  },
  vite: {
    plugins: [tailwindcss() as never],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  },
});
