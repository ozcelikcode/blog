import type Database from "better-sqlite3";

export function applyDatabasePragmas(sqlite: Database.Database): void {
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("synchronous = NORMAL");
  sqlite.pragma("temp_store = MEMORY");
}
