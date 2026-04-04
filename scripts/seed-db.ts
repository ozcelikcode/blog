import { seedDatabase } from "../src/lib/db/seed";

const shouldReset = process.argv.includes("--reset");
seedDatabase({ reset: shouldReset });

console.log(`Database seeded${shouldReset ? " with reset" : ""}.`);
