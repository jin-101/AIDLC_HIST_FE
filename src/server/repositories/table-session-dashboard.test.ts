import os from "node:os";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { closeDatabase, getDatabase } from "@/server/db/connection";
import { createSchema } from "@/server/db/schema";
import { seedDatabase } from "@/server/db/seed";
import { orderRepository } from "./order-repository";
import { sessionRepository } from "./session-repository";
import { tableRepository } from "./table-repository";

function prepareDatabase(): void {
  process.env.TABLE_ORDER_DB_PATH = path.join(os.tmpdir(), `table-order-test-${process.pid}-${Date.now()}-${Math.random()}.sqlite`);
  closeDatabase();
  const db = getDatabase();
  createSchema(db);
  seedDatabase(db);
}

describe("table session dashboard integration", () => {
  beforeEach(() => {
    prepareDatabase();
  });

  it("table completion 후 completed session 주문은 dashboard current orders에서 제외된다", () => {
    const db = getDatabase();
    const store = db.prepare("SELECT id FROM stores WHERE code = ?").get("demo-store") as { id: string };
    const table = tableRepository.findByStoreAndNumber(store.id, "1");
    expect(table).not.toBeNull();

    const session = sessionRepository.create({ storeId: store.id, tableId: table!.id });
    const order = orderRepository.createWithItems({
      storeId: store.id,
      tableId: table!.id,
      sessionId: session.id,
      items: [{ menuItemId: firstMenuItemId(), menuName: "김치볶음밥", quantity: 2, unitPrice: 9000 }]
    });

    const activeBeforeCompletion = orderRepository.dashboardByStore(store.id).find((dashboard) => dashboard.table.id === table!.id);
    expect(activeBeforeCompletion?.orders.map((item) => item.id)).toContain(order.id);
    expect(activeBeforeCompletion?.totalAmount).toBe(18000);

    sessionRepository.complete(session.id, "2026-01-01T01:00:00.000Z");

    const activeAfterCompletion = orderRepository.dashboardByStore(store.id).find((dashboard) => dashboard.table.id === table!.id);
    expect(activeAfterCompletion?.activeSession).toBeNull();
    expect(activeAfterCompletion?.orders).toEqual([]);
    expect(activeAfterCompletion?.totalAmount).toBe(0);
  });
});

function firstMenuItemId(): string {
  const row = getDatabase().prepare("SELECT id FROM menu_items ORDER BY display_order LIMIT 1").get() as { id: string };
  return row.id;
}
