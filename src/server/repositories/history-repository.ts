import { getDatabase } from "@/server/db/connection";
import type { OrderWithItems } from "@/lib/types/domain";
import { mapOrder, mapOrderItem } from "./row-mappers";

export const historyRepository = {
  listByTableAndDate(input: { tableId: string; dateFrom?: string; dateTo?: string }): OrderWithItems[] {
    const clauses = ["o.table_id = ?", "s.status = 'completed'"];
    const params: string[] = [input.tableId];

    if (input.dateFrom) {
      clauses.push("o.created_at >= ?");
      params.push(input.dateFrom);
    }
    if (input.dateTo) {
      clauses.push("o.created_at <= ?");
      params.push(input.dateTo);
    }

    const db = getDatabase();
    const orders = db
      .prepare(
        `SELECT o.* FROM orders o
         INNER JOIN table_sessions s ON s.id = o.session_id
         WHERE ${clauses.join(" AND ")}
         ORDER BY o.created_at DESC`
      )
      .all(...params)
      .map((row) => mapOrder(row as Record<string, unknown>));

    return orders.map((order) => ({
      ...order,
      items: db
        .prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY rowid")
        .all(order.id)
        .map((row) => mapOrderItem(row as Record<string, unknown>))
    }));
  }
};
