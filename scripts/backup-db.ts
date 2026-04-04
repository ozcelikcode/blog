import { backupDatabase } from "../src/lib/db/backup";

const result = await backupDatabase();
console.log(`Backup written to ${result.destinationPath}`);
