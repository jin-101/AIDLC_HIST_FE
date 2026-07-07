import type Database from "better-sqlite3";
import { persistenceError } from "@/lib/api/errors";
import { getDatabase } from "./connection";

export function withTransaction<T>(work: (db: Database.Database) => T): T {
  const db = getDatabase();

  try {
    return db.transaction(() => work(db))();
  } catch (error) {
    throw persistenceError("데이터 저장 작업을 완료하지 못했습니다.", error);
  }
}
