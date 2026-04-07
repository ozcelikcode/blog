import fs from "node:fs";

import type { APIContext } from "astro";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createSeededTestDatabase } from "@/lib/db/test-utils";

import { getAdminMediaAssetById } from "../repositories/admin-media-repository";
import { uploadAdminMedia } from "../services/admin-media-service";

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
const uploadedFilePaths: string[] = [];

beforeEach(() => {
  cleanup = createSeededTestDatabase().cleanup;
});

afterEach(() => {
  for (const filePath of uploadedFilePaths.splice(0)) {
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { force: true });
    }
  }

  cleanup?.();
  cleanup = undefined;
});

describe("admin media service", () => {
  it("uploads a valid image and stores the asset metadata", async () => {
    const formData = new FormData();
    const context = createMockContext();
    const file = new File(
      ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><rect width="10" height="10" fill="black"/></svg>'],
      "test-upload.svg",
      { type: "image/svg+xml" },
    );

    formData.set("altText", "Uploaded asset");
    formData.set("file", file);

    const result = await uploadAdminMedia(
      formData,
      { authorId: 1, email: "admin@example.com", id: 1, name: "Emre Ozcelik", role: "admin" },
      context,
    );

    expect(result.ok).toBe(true);
    expect(result.redirectTo).toMatch(/^\/admin\/media\?asset=\d+$/);

    const assetId = Number.parseInt(result.redirectTo?.split("=")[1] ?? "0", 10);
    const asset = Number.isFinite(assetId) ? getAdminMediaAssetById(assetId) : null;

    expect(asset).not.toBeNull();
    expect(asset?.altText).toBe("Uploaded asset");
    expect(asset?.mimeType).toBe("image/svg+xml");
    expect(asset?.storagePath).toBeTruthy();

    if (asset?.storagePath) {
      uploadedFilePaths.push(asset.storagePath);
      expect(fs.existsSync(asset.storagePath)).toBe(true);
    }
  });
});
