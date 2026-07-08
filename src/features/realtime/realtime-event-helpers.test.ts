import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { isRealtimeEventType, nextHighlightedTables, parseRealtimeEvent, shouldDeliverToStore, shouldReloadForRealtimeSignal } from "./realtime-event-helpers";
import type { RealtimeEvent, RealtimeSignal } from "./types";

function event(overrides: Partial<RealtimeEvent> = {}): RealtimeEvent {
  return {
    type: "order-created",
    storeId: "store-1",
    tableId: "table-1",
    sessionId: "session-1",
    orderId: "order-1",
    occurredAt: "2026-01-01T00:00:00.000Z",
    ...overrides
  } as RealtimeEvent;
}

describe("realtime-event-helpers", () => {
  it("허용된 event type만 true를 반환한다", () => {
    expect(isRealtimeEventType("order-created")).toBe(true);
    expect(isRealtimeEventType("table-completed")).toBe(true);
    expect(isRealtimeEventType("unknown")).toBe(false);
  });

  it("잘못된 JSON과 필수 field 누락 event는 null로 변환한다", () => {
    expect(parseRealtimeEvent("{")).toBeNull();
    expect(parseRealtimeEvent(JSON.stringify({ type: "order-created" }))).toBeNull();
  });

  it("valid order event를 파싱한다", () => {
    expect(parseRealtimeEvent(JSON.stringify(event()))).toMatchObject({ type: "order-created", orderId: "order-1" });
  });

  it("PBT: store delivery는 storeId가 같을 때만 true이다", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1 }), fc.string({ minLength: 1 }), (eventStoreId, sessionStoreId) => {
        expect(shouldDeliverToStore(event({ storeId: eventStoreId }), sessionStoreId)).toBe(eventStoreId === sessionStoreId);
      })
    );
  });

  it("PBT: reload decision은 open과 valid-event에서만 true이다", () => {
    fc.assert(
      fc.property(fc.constantFrom<RealtimeSignal>("open", "valid-event", "invalid-event", "closed", "error"), (signal) => {
        expect(shouldReloadForRealtimeSignal(signal)).toBe(signal === "open" || signal === "valid-event");
      })
    );
  });

  it("PBT: highlight는 만료 항목을 제거하고 대상 table을 추가한다", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.integer({ min: 1, max: 10_000 }), (tableId, highlightMs) => {
        const now = 1000;
        const highlighted = nextHighlightedTables([{ tableId: "expired", expiresAt: 999 }], tableId, now, highlightMs);
        expect(highlighted.some((item) => item.tableId === "expired")).toBe(false);
        expect(highlighted).toContainEqual({ tableId, expiresAt: now + highlightMs });
      })
    );
  });
});
