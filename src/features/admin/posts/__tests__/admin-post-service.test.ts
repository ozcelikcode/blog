import type { APIContext } from "astro";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSeededTestDatabase } from "@/lib/db/test-utils";

import { findAdminPostBySlug, getAdminPostById } from "../repositories/admin-post-repository";
import { getAdminPostEditorPageData, mutateAdminPost } from "../services/admin-post-service";

function createMockContext(): Pick<APIContext, "clientAddress" | "session"> & {
  flashStore: Map<string, unknown>;
} {
  const flashStore = new Map<string, unknown>();
  const session = {
    set(key: string, value: unknown) {
      flashStore.set(key, value);
    },
  } as unknown as APIContext["session"];

  return {
    clientAddress: "127.0.0.1",
    flashStore,
    session,
  };
}

let cleanup: (() => void) | undefined;

beforeEach(() => {
  cleanup = createSeededTestDatabase().cleanup;
});

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

describe("admin post service", () => {
  it("prefills the logged-in admin author for new posts", () => {
    const data = getAdminPostEditorPageData(undefined, {
      authorId: 1,
      email: "admin@example.com",
      id: 1,
      name: "Emre Ozcelik",
      role: "admin",
    });

    expect(data?.post.authorId).toBe("1");
  });

  it("creates a draft post", async () => {
    const formData = new FormData();
    const context = createMockContext();

    formData.set("authorId", "1");
    formData.set("contentMarkdown", "# Draft\n\nDraft content.");
    formData.set("excerpt", "A new draft created in a unit test for the admin post workflow.");
    formData.set("intent", "save-draft");
    formData.set("slug", "unit-test-draft-post");
    formData.set("status", "draft");
    formData.set("title", "Unit Test Draft Post");

    const result = await mutateAdminPost(
      formData,
      { authorId: 1, email: "admin@example.com", id: 1, name: "Emre Ozcelik", role: "admin" },
      context,
    );

    expect(result.ok).toBe(true);
    const createdPost = findAdminPostBySlug("unit-test-draft-post");
    expect(createdPost).not.toBeNull();
    expect(context.flashStore.get("flashMessage")).toBeTruthy();

    const persisted = createdPost ? getAdminPostById(createdPost.id) : null;
    expect(persisted?.status).toBe("draft");
    expect(persisted?.publishedAt).toBeNull();
  });

  it("publishes an existing post immediately", async () => {
    const existingPost = findAdminPostBySlug("draft-notes-on-content-operations");
    const formData = new FormData();

    expect(existingPost).not.toBeNull();

    formData.set("authorId", "1");
    formData.set("contentMarkdown", "# Publish\n\nThis post is ready.");
    formData.set("excerpt", "A draft that is being published now through the admin service test.");
    formData.set("intent", "publish-now");
    formData.set("postId", String(existingPost?.id));
    formData.set("slug", "draft-notes-on-content-operations");
    formData.set("status", "draft");
    formData.set("title", "Draft notes on content operations");

    const result = await mutateAdminPost(
      formData,
      { authorId: 1, email: "admin@example.com", id: 1, name: "Emre Ozcelik", role: "admin" },
      createMockContext(),
    );

    expect(result.ok).toBe(true);

    const persisted = existingPost ? getAdminPostById(existingPost.id) : null;
    expect(persisted?.status).toBe("published");
    expect(persisted?.publishedAt).not.toBeNull();
  });
});
