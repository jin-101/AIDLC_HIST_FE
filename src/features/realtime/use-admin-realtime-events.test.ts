// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAdminRealtimeEvents } from "./use-admin-realtime-events";

class MockEventSource {
  static instances: MockEventSource[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((message: MessageEvent<string>) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;

  constructor(public readonly url: string) {
    MockEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

describe("use-admin-realtime-events", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    MockEventSource.instances = [];
  });

  it("open 시 reload를 호출하고 상태를 open으로 바꾼다", async () => {
    vi.stubGlobal("EventSource", MockEventSource);
    const reload = vi.fn();
    const { result } = renderHook(() => useAdminRealtimeEvents({ storeId: "store-1", onReload: reload }));

    await act(async () => {
      MockEventSource.instances[0].onopen?.();
    });

    expect(result.current.connectionState).toBe("open");
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("valid message는 reload와 highlight를 적용한다", async () => {
    vi.stubGlobal("EventSource", MockEventSource);
    const reload = vi.fn();
    const { result } = renderHook(() => useAdminRealtimeEvents({ storeId: "store-1", onReload: reload, highlightMs: 1000 }));

    await act(async () => {
      MockEventSource.instances[0].onmessage?.({
        data: JSON.stringify({
          type: "order-created",
          storeId: "store-1",
          tableId: "table-1",
          sessionId: "session-1",
          orderId: "order-1",
          occurredAt: "2026-01-01T00:00:00.000Z"
        })
      } as MessageEvent<string>);
    });

    expect(reload).toHaveBeenCalledTimes(1);
    expect(result.current.highlightedTableIds).toEqual(["table-1"]);
    expect(result.current.lastEventAt).toBe("2026-01-01T00:00:00.000Z");
  });

  it("error 시 기존 data 대신 연결 상태만 failed로 바꾼다", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    const { result } = renderHook(() => useAdminRealtimeEvents({ storeId: "store-1", onReload: vi.fn() }));

    act(() => {
      MockEventSource.instances[0].onerror?.();
    });

    expect(result.current.connectionState).toBe("failed");
  });

  it("unmount 시 EventSource를 닫는다", () => {
    vi.stubGlobal("EventSource", MockEventSource);
    const { unmount } = renderHook(() => useAdminRealtimeEvents({ storeId: "store-1", onReload: vi.fn() }));

    unmount();

    expect(MockEventSource.instances[0].closed).toBe(true);
  });
});
