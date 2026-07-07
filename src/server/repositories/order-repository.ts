import { v4 as uuid } from "uuid";
import { getDatabase } from "@/server/db/connection";
import type { CreateOrderInput, Order, OrderItem, OrderStatus, OrderWithItems, TableDashboard } from "@/lib/types/domain";
import { withTransaction } from "@/server/db/transaction";
import { mapOrder, mapOrderItem, mapTable, mapSession } from "./row-mappers";

function createOrderNumber(): string {
  return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
}

function listItems(orderId: string): OrderItem[] {
  return getDatabase()
    .prepare("SELECT * FROM order_items WHERE order_id = ? ORDER BY rowid")
    .all(orderId)
    .map((row) => mapOrderItem(row as Record<string, unknown>));
}

export const orderRepository = {
  createWithItems(input: CreateOrderInput): OrderWithItems {
    return withTransaction((db) => {
      const now = new Date().toISOString();
      const orderId = uuid();
      const items = input.items.map((item) => ({
        id: uuid(),
        orderId,
        menuItemId: item.menuItemId,
        menuName: item.menuName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal: item.quantity * item.unitPrice
      }));
      const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);

      db.prepare(
        `INSERT INTO orders
        (id, store_id, table_id, session_id, order_number, status, total_amount, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'waiting', ?, ?, ?)`
      ).run(orderId, input.storeId, input.tableId, input.sessionId, createOrderNumber(), totalAmount, now, now);

      const insertItem = db.prepare(
        `INSERT INTO order_items
        (id, order_id, menu_item_id, menu_name, quantity, unit_price, line_total)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      );

      for (const item of items) {
        insertItem.run(item.id, item.orderId, item.menuItemId, item.menuName, item.quantity, item.unitPrice, item.lineTotal);
      }

      const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
      return { ...mapOrder(row as Record<string, unknown>), items };
    });
  },

  listBySession(sessionId: string): OrderWithItems[] {
    return getDatabase()
      .prepare("SELECT * FROM orders WHERE session_id = ? ORDER BY created_at")
      .all(sessionId)
      .map((row) => {
        const order = mapOrder(row as Record<string, unknown>);
        return { ...order, items: listItems(order.id) };
      });
  },

  updateStatus(orderId: string, status: OrderStatus): Order | null {
    const now = new Date().toISOString();
    getDatabase().prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").run(status, now, orderId);
    const row = getDatabase().prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    return row ? mapOrder(row as Record<string, unknown>) : null;
  },

  delete(orderId: string): void {
    withTransaction((db) => {
      db.prepare("DELETE FROM order_items WHERE order_id = ?").run(orderId);
      db.prepare("DELETE FROM orders WHERE id = ?").run(orderId);
    });
  },

  dashboardByStore(storeId: string): TableDashboard[] {
    const db = getDatabase();
    const tables = db
      .prepare("SELECT * FROM tables WHERE store_id = ? ORDER BY CAST(number AS INTEGER), number")
      .all(storeId)
      .map((row) => mapTable(row as Record<string, unknown>));

    return tables.map((table) => {
      const sessionRow = db
        .prepare("SELECT * FROM table_sessions WHERE table_id = ? AND status = 'active'")
        .get(table.id);
      const activeSession = sessionRow ? mapSession(sessionRow as Record<string, unknown>) : null;
      const orders = activeSession ? this.listBySession(activeSession.id) : [];
      return {
        table,
        activeSession,
        orders,
        totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0)
      };
    });
  }
};
