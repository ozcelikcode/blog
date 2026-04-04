import path from "node:path";

import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import type * as schema from "./schema";

const migrationsFolder = path.resolve(process.cwd(), "src/lib/db/migrations");

export function migrateDatabase(db: BetterSQLite3Database<typeof schema>): void {
  migrate(db, { migrationsFolder });
}

export function getMigrationsFolder(): string {
  return migrationsFolder;
}
