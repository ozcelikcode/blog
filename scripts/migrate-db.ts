import { createDatabaseContext } from "../src/lib/db/client";

const context = createDatabaseContext();
console.log(`Migrations applied to ${context.filePath}`);
context.sqlite.close();
