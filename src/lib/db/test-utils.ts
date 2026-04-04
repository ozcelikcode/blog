import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { closeDatabaseContext, deleteDatabaseFiles } from "./client";
import { seedDatabase } from "./seed";

export function createSeededTestDatabase(): { cleanup: () => void; databaseUrl: string } {
  const previousDatabaseUrl = process.env.DATABASE_URL;
  const databaseUrl = path.join(os.tmpdir(), `developer-blog-test-${randomUUID()}.db`);

  seedDatabase({
    databaseUrl,
    reset: true,
  });

  process.env.DATABASE_URL = databaseUrl;
  closeDatabaseContext();

  return {
    cleanup: () => {
      closeDatabaseContext();

      if (previousDatabaseUrl) {
        process.env.DATABASE_URL = previousDatabaseUrl;
      } else {
        delete process.env.DATABASE_URL;
      }

      deleteDatabaseFiles(databaseUrl);
    },
    databaseUrl,
  };
}
