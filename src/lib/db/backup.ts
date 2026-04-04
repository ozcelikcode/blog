import fs from "node:fs";
import path from "node:path";

import { createDatabaseContext } from "./client";

export interface DatabaseBackupResult {
  destinationPath: string;
  startedAt: string;
}

export async function backupDatabase(destinationDirectory = "backups"): Promise<DatabaseBackupResult> {
  const context = createDatabaseContext();
  const outputDirectory = path.resolve(process.cwd(), destinationDirectory);
  fs.mkdirSync(outputDirectory, { recursive: true });

  const timestamp = new Date().toISOString().replaceAll(":", "-");
  const destinationPath = path.join(outputDirectory, `blog-${timestamp}.db`);

  await context.sqlite.backup(destinationPath);
  context.sqlite.close();

  return {
    destinationPath,
    startedAt: new Date().toISOString(),
  };
}
