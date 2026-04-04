import fs from "node:fs";
import path from "node:path";

import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

import { getServerEnv } from "@/lib/env/server";

import { migrateDatabase } from "./migrate";
import { applyDatabasePragmas } from "./pragmas";
import * as schema from "./schema";

export type AppDatabase = BetterSQLite3Database<typeof schema>;

export interface DatabaseContext {
  db: AppDatabase;
  filePath: string;
  sqlite: Database.Database;
}

interface CreateDatabaseContextOptions {
  runMigrations?: boolean;
}

let cachedContext: DatabaseContext | null = null;

export function resolveDatabasePath(databaseUrl: string = getServerEnv().DATABASE_URL): string {
  if (path.isAbsolute(databaseUrl)) {
    return databaseUrl;
  }

  return path.resolve(process.cwd(), databaseUrl);
}

export function deleteDatabaseFiles(filePath: string): void {
  for (const suffix of ["", "-shm", "-wal"]) {
    const candidate = `${filePath}${suffix}`;

    if (fs.existsSync(candidate)) {
      fs.rmSync(candidate, { force: true });
    }
  }
}

export function createDatabaseContext(
  databaseUrl: string = getServerEnv().DATABASE_URL,
  options: CreateDatabaseContextOptions = {},
): DatabaseContext {
  const filePath = resolveDatabasePath(databaseUrl);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  const sqlite = new Database(filePath);
  applyDatabasePragmas(sqlite);

  const db = drizzle(sqlite, { schema });

  if (options.runMigrations !== false) {
    migrateDatabase(db);
  }

  return {
    db,
    filePath,
    sqlite,
  };
}

export function getDatabaseContext(): DatabaseContext {
  if (cachedContext) {
    return cachedContext;
  }

  cachedContext = createDatabaseContext();
  return cachedContext;
}

export function closeDatabaseContext(): void {
  if (!cachedContext) {
    return;
  }

  cachedContext.sqlite.close();
  cachedContext = null;
}
