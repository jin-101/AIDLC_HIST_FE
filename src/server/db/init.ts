import fs from "node:fs";
import path from "node:path";
import { getDatabase, getDatabasePath } from "./connection";
import { seedDatabase } from "./seed";
import { createSchema } from "./schema";

export function initializeDatabase(): void {
  const dbPath = getDatabasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = getDatabase();
  createSchema(db);
  seedDatabase(db);
}

if (require.main === module) {
  initializeDatabase();
}
