import { getDatabaseHealthReport } from "../src/lib/db/health";

console.log(JSON.stringify(getDatabaseHealthReport(), null, 2));
