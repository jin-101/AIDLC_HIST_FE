import Database from "better-sqlite3";
import { createSchema } from "@/server/db/schema";
import { seedDatabase } from "@/server/db/seed";

export function createTestDatabase(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("foreign_keys = ON");
  createSchema(db);
  seedDatabase(db);
  return db;
}

export function getSeedStoreId(db: Database.Database): string {
  const row = db.prepare("SELECT id FROM stores WHERE code = ?").get("demo-store") as { id: string } | undefined;
  if (!row) throw new Error("seed store not found");
  return row.id;
}
