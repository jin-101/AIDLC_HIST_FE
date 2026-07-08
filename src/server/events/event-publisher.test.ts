import { describe, expect, it, afterEach } from "vitest";
import fc from "fast-check";
import type { Order, TableSession } from "@/lib/types/domain";
import { realtimeEventArb } from "@/test/generators/domain-generators";
import { eventBus } from "./event-bus";
import { publishOrderCreated, publishOrderDeleted, publishTableCompleted } from "./event-publisher";

const baseOrder: Order = {
  id: "order-1",
  storeId: "store-1",
  tableId: "table-1",
  sessionId: "session-1",
  orderNumber: "ORD-1",
  status: "waiting",
  totalAmount: 9000,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

const baseSession: TableSession = {
  id: "session-1",
  storeId: "store-1",
  tableId: "table-1",
  status: "completed",
  startedAt: "2026-01-01T00:00:00.000Z",
  completedAt: "2026-01-01T01:00:00.000Z"
};

describe("event-publisher", () => {
  afterEach(() => {
    eventBus.clear();
  });

  it("order-created event metadata를 subscribed client에 전달한다", () => {
    const frames: string[] = [];
    eventBus.subscribe("store-1", { clientId: "client-1", send: (frame) => frames.push(frame) });

    const result = publishOrderCreated(baseOrder);

    expect(result).toEqual({ delivered: 1, removed: 0 });
    expect(JSON.parse(frames[0]?.replace("data: ", "") ?? "{}")).toMatchObject({
      type: "order-created",
      storeId: "store-1",
      tableId: "table-1",
      sessionId: "session-1",
      orderId: "order-1"
    });
  });

  it("order-deleted event metadata를 전달한다", () => {
    const frames: string[] = [];
    eventBus.subscribe("store-1", { clientId: "client-1", send: (frame) => frames.push(frame) });

    const result = publishOrderDeleted(baseOrder);

    expect(result.delivered).toBe(1);
    expect(JSON.parse(frames[0]?.replace("data: ", "") ?? "{}")).toMatchObject({
      type: "order-deleted",
      orderId: "order-1"
    });
  });

  it("table-completed event는 orderId 없이 table/session metadata를 전달한다", () => {
    const frames: string[] = [];
    eventBus.subscribe("store-1", { clientId: "client-1", send: (frame) => frames.push(frame) });

    const result = publishTableCompleted("table-1", baseSession);

    const event = JSON.parse(frames[0]?.replace("data: ", "") ?? "{}") as Record<string, unknown>;
    expect(result.delivered).toBe(1);
    expect(event).toMatchObject({
      type: "table-completed",
      storeId: "store-1",
      tableId: "table-1",
      sessionId: "session-1"
    });
    expect(event.orderId).toBeUndefined();
  });

  it("failed client를 제거하고 정상 client delivery를 유지한다", () => {
    const frames: string[] = [];
    eventBus.subscribe("store-1", {
      clientId: "failed-client",
      send: () => {
        throw new Error("client disconnected");
      }
    });
    eventBus.subscribe("store-1", { clientId: "healthy-client", send: (frame) => frames.push(frame) });

    const result = publishOrderCreated(baseOrder);

    expect(result).toEqual({ delivered: 1, removed: 1 });
    expect(eventBus.sizeForStore("store-1")).toBe(1);
    expect(frames).toHaveLength(1);
  });

  it("PBT: generated realtime event는 같은 store subscriber에게만 전달된다", () => {
    fc.assert(
      fc.property(realtimeEventArb, (event) => {
        eventBus.clear();
        const frames: string[] = [];
        eventBus.subscribe(event.storeId, { clientId: "target", send: (frame) => frames.push(frame) });
        eventBus.subscribe("other-store", { clientId: "other", send: (frame) => frames.push(frame) });

        const result = eventBus.publish(event);

        expect(result.delivered).toBe(1);
        expect(frames).toHaveLength(1);
      })
    );
  });
});
