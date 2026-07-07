import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { OrderWithItems } from "@/lib/types/domain";
import { matchesHistoryFilter, validateHistoryFilter } from "./history-filter";

function order(tableId: string, createdAt: string): OrderWithItems {
  return {
    id: "order-1",
    storeId: "store-1",
    tableId,
    sessionId: "session-1",
    orderNumber: "A-1",
    status: "completed",
    totalAmount: 1000,
    createdAt,
    updatedAt: createdAt,
    items: []
  };
}

describe("history-filter", () => {
  it("테이블이 없거나 날짜 범위가 뒤집히면 오류를 반환한다", () => {
    expect(validateHistoryFilter({ tableId: "" })).toBe("테이블을 선택해주세요.");
    expect(validateHistoryFilter({ tableId: "table-1", dateFrom: "2026-01-03", dateTo: "2026-01-01" })).toBe("조회 시작일은 종료일보다 늦을 수 없습니다.");
  });

  it("테이블과 날짜 범위가 맞는 주문만 매칭한다", () => {
    expect(matchesHistoryFilter(order("table-1", "2026-01-02"), { tableId: "table-1", dateFrom: "2026-01-01", dateTo: "2026-01-03" })).toBe(true);
    expect(matchesHistoryFilter(order("table-2", "2026-01-02"), { tableId: "table-1" })).toBe(false);
  });

  it("PBT: 동일 테이블과 동일 날짜 경계는 항상 매칭된다", () => {
    fc.assert(
      fc.property(fc.date(), (date) => {
        const day = date.toISOString();
        expect(matchesHistoryFilter(order("table-1", day), { tableId: "table-1", dateFrom: day, dateTo: day })).toBe(true);
      })
    );
  });
});
