import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { OrderWithItems, TableDashboard } from "@/lib/types/domain";
import { filterTableCards, toAdminDashboardSnapshot, toAdminTableCard } from "./dashboard-mapper";

function order(id: string, totalAmount: number, createdAt: string): OrderWithItems {
  return {
    id,
    storeId: "store-1",
    tableId: "table-1",
    sessionId: "session-1",
    orderNumber: id,
    status: "waiting",
    totalAmount,
    createdAt,
    updatedAt: createdAt,
    items: []
  };
}

function dashboard(orders: OrderWithItems[]): TableDashboard {
  return {
    table: { id: "table-1", storeId: "store-1", number: "7", password: "1234", createdAt: "2026-01-01", updatedAt: "2026-01-01" },
    activeSession: { id: "session-1", storeId: "store-1", tableId: "table-1", status: "active", startedAt: "2026-01-01", completedAt: null },
    orders,
    totalAmount: orders.reduce((sum, item) => sum + item.totalAmount, 0)
  };
}

describe("dashboard-mapper", () => {
  it("활성 세션 주문 합계와 최신 주문을 계산한다", () => {
    const card = toAdminTableCard(dashboard([order("old", 3000, "2026-01-01T00:00:00.000Z"), order("new", 5000, "2026-01-02T00:00:00.000Z")]));

    expect(card.totalAmount).toBe(8000);
    expect(card.latestOrder?.id).toBe("new");
  });

  it("비활성 테이블은 주문을 표시하지 않는다", () => {
    const inactive = { ...dashboard([order("old", 3000, "2026-01-01T00:00:00.000Z")]), activeSession: null };

    expect(toAdminTableCard(inactive).orders).toEqual([]);
  });

  it("PBT: 카드 합계는 주문 금액 합과 같다", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 1_000_000 }), { maxLength: 50 }), (amounts) => {
        const orders = amounts.map((amount, index) => order(`order-${index}`, amount, `2026-01-01T00:00:${String(index).padStart(2, "0")}.000Z`));
        expect(toAdminTableCard(dashboard(orders)).totalAmount).toBe(amounts.reduce((sum, amount) => sum + amount, 0));
      })
    );
  });

  it("테이블 번호로 카드 목록을 필터링한다", () => {
    const snapshot = toAdminDashboardSnapshot("store-1", [dashboard([])]);

    expect(filterTableCards(snapshot.tables, "7")).toHaveLength(1);
    expect(filterTableCards(snapshot.tables, "9")).toHaveLength(0);
  });
});
