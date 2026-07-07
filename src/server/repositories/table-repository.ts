import { v4 as uuid } from "uuid";
import { getDatabase } from "@/server/db/connection";
import type { Table } from "@/lib/types/domain";
import { mapTable } from "./row-mappers";

export const tableRepository = {
  findByStoreAndNumber(storeId: string, number: string): Table | null {
    const row = getDatabase()
      .prepare("SELECT * FROM tables WHERE store_id = ? AND number = ?")
      .get(storeId, number);
    return row ? mapTable(row as Record<string, unknown>) : null;
  },

  listByStore(storeId: string): Table[] {
    const rows = getDatabase()
      .prepare("SELECT * FROM tables WHERE store_id = ? ORDER BY CAST(number AS INTEGER), number")
      .all(storeId);
    return rows.map((row) => mapTable(row as Record<string, unknown>));
  },

  upsertTable(input: { storeId: string; number: string; password: string }): Table {
    const now = new Date().toISOString();
    const existing = this.findByStoreAndNumber(input.storeId, input.number);

    if (existing) {
      getDatabase()
        .prepare("UPDATE tables SET password = ?, updated_at = ? WHERE id = ?")
        .run(input.password, now, existing.id);
      return { ...existing, password: input.password, updatedAt: now };
    }

    const table: Table = {
      id: uuid(),
      storeId: input.storeId,
      number: input.number,
      password: input.password,
      createdAt: now,
      updatedAt: now
    };

    getDatabase()
      .prepare(
        "INSERT INTO tables (id, store_id, number, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(table.id, table.storeId, table.number, table.password, table.createdAt, table.updatedAt);

    return table;
  }
};
