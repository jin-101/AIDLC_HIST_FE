import Database from "better-sqlite3";
import path from "node:path";

let connection: Database.Database | null = null;

export function getDatabasePath(): string {
  return process.env.TABLE_ORDER_DB_PATH ?? path.join(process.cwd(), "data", "table-order.sqlite");
}

export function getDatabase(): Database.Database {
  if (!connection) {
    connection = new Database(getDatabasePath());
    connection.pragma("foreign_keys = ON");
    connection.pragma("journal_mode = WAL");
  }

  return connection;
}

export function closeDatabase(): void {
  connection?.close();
  connection = null;
}
