import type { APIContext } from "astro";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSeededTestDatabase } from "@/lib/db/test-utils";

import { findAdminTagBySlug } from "../repositories/admin-tag-repository";
import { deleteAdminTagById, saveAdminTag } from "../services/admin-tag-service";

function createMockContext(): Pick<APIContext, "clientAddress" | "session"> {
  return {
    clientAddress: "127.0.0.1",
    session: {
      set() {},
    } as unknown as APIContext["session"],
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

describe("admin tag service", () => {
  it("rejects duplicate slugs", async () => {
    const formData = new FormData();

    formData.set("name", "Architecture Duplicate");
    formData.set("slug", "architecture");

    const result = await saveAdminTag(
      formData,
      { email: "admin@example.com", id: 1, name: "Editorial Admin", role: "admin" },
      createMockContext(),
    );

    expect(result.ok).toBe(false);
    expect(result.fieldErrors?.slug).toBe("This slug is already in use.");
  });

  it("prevents deleting a tag that is still in use", () => {
    const tag = findAdminTagBySlug("architecture");

    expect(tag).not.toBeNull();
    if (!tag) {
      throw new Error("Expected architecture tag to exist.");
    }

    expect(() =>
      deleteAdminTagById(
        tag.id,
        { email: "admin@example.com", id: 1, name: "Editorial Admin", role: "admin" },
        createMockContext(),
      ),
    ).toThrow("Tags in use cannot be deleted.");
  });
});
