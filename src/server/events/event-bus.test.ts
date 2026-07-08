import { afterEach, describe, expect, it } from "vitest";
import { eventBus } from "./event-bus";
import type { RealtimeEvent } from "@/features/realtime/types";

const event: RealtimeEvent = {
  type: "order-created",
  storeId: "store-1",
  tableId: "table-1",
  sessionId: "session-1",
  orderId: "order-1",
  occurredAt: "2026-01-01T00:00:00.000Z"
};

describe("event-bus", () => {
  afterEach(() => {
    eventBus.clear();
  });

  it("같은 storeId client에게만 fan-out한다", () => {
    const received: string[] = [];
    eventBus.subscribe("store-1", { send: (frame) => received.push(frame) });
    eventBus.subscribe("store-2", { send: (frame) => received.push(frame) });

    const result = eventBus.publish(event);

    expect(result).toEqual({ delivered: 1, removed: 0 });
    expect(received).toHaveLength(1);
  });

  it("unsubscribe된 client에는 전송하지 않는다", () => {
    const received: string[] = [];
    const client = eventBus.subscribe("store-1", { send: (frame) => received.push(frame) });

    eventBus.unsubscribe(client.clientId);
    eventBus.publish(event);

    expect(received).toHaveLength(0);
    expect(eventBus.sizeForStore("store-1")).toBe(0);
  });

  it("send 실패 client를 제거하고 나머지 client 전송은 계속한다", () => {
    const received: string[] = [];
    eventBus.subscribe("store-1", { send: () => { throw new Error("closed"); } });
    eventBus.subscribe("store-1", { send: (frame) => received.push(frame) });

    const result = eventBus.publish(event);

    expect(result).toEqual({ delivered: 1, removed: 1 });
    expect(received).toHaveLength(1);
    expect(eventBus.sizeForStore("store-1")).toBe(1);
  });
});
