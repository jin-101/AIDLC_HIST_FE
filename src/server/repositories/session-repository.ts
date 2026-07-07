import { v4 as uuid } from "uuid";
import { getDatabase } from "@/server/db/connection";
import type { TableSession } from "@/lib/types/domain";
import { mapSession } from "./row-mappers";

export const sessionRepository = {
  findActiveByTable(tableId: string): TableSession | null {
    const row = getDatabase()
      .prepare("SELECT * FROM table_sessions WHERE table_id = ? AND status = 'active'")
      .get(tableId);
    return row ? mapSession(row as Record<string, unknown>) : null;
  },

  create(input: { storeId: string; tableId: string }): TableSession {
    const session: TableSession = {
      id: uuid(),
      storeId: input.storeId,
      tableId: input.tableId,
      status: "active",
      startedAt: new Date().toISOString(),
      completedAt: null
    };

    getDatabase()
      .prepare(
        "INSERT INTO table_sessions (id, store_id, table_id, status, started_at, completed_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(session.id, session.storeId, session.tableId, session.status, session.startedAt, session.completedAt);

    return session;
  },

  complete(sessionId: string, completedAt = new Date().toISOString()): TableSession | null {
    getDatabase()
      .prepare("UPDATE table_sessions SET status = 'completed', completed_at = ? WHERE id = ?")
      .run(completedAt, sessionId);

    const row = getDatabase().prepare("SELECT * FROM table_sessions WHERE id = ?").get(sessionId);
    return row ? mapSession(row as Record<string, unknown>) : null;
  }
};
