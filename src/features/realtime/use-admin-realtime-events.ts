"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { EventConnectionState, HighlightedTable } from "./types";
import {
  nextHighlightedTables,
  parseRealtimeEvent,
  pruneExpiredHighlightedTables,
  shouldDeliverToStore,
  shouldReloadForRealtimeSignal
} from "./realtime-event-helpers";

interface UseAdminRealtimeEventsOptions {
  storeId: string | null;
  onReload: () => Promise<void> | void;
  highlightMs?: number;
}

export function useAdminRealtimeEvents({ storeId, onReload, highlightMs = 4_000 }: UseAdminRealtimeEventsOptions) {
  const [connectionState, setConnectionState] = useState<EventConnectionState>("closed");
  const [highlightedTables, setHighlightedTables] = useState<HighlightedTable[]>([]);
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const sourceRef = useRef<EventSource | null>(null);
  const reloadingRef = useRef(false);
  const pendingReloadRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reloadRef = useRef(onReload);

  useEffect(() => {
    reloadRef.current = onReload;
  }, [onReload]);

  const guardedReload = useCallback(async () => {
    if (reloadingRef.current) {
      pendingReloadRef.current = true;
      return;
    }

    reloadingRef.current = true;
    try {
      await reloadRef.current();
    } finally {
      reloadingRef.current = false;
      if (pendingReloadRef.current) {
        pendingReloadRef.current = false;
        void guardedReload();
      }
    }
  }, []);

  const schedulePrune = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const now = Date.now();
      setHighlightedTables((current) => pruneExpiredHighlightedTables(current, now));
    }, highlightMs + 20);
  }, [highlightMs]);

  const disconnect = useCallback(() => {
    sourceRef.current?.close();
    sourceRef.current = null;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setConnectionState("closed");
  }, []);

  useEffect(() => {
    if (!storeId) {
      disconnect();
      return;
    }

    setConnectionState("connecting");
    const source = new EventSource(`/api/admin/events?storeId=${encodeURIComponent(storeId)}`);
    sourceRef.current = source;

    source.onopen = () => {
      setConnectionState("open");
      if (shouldReloadForRealtimeSignal("open")) void guardedReload();
    };

    source.onmessage = (message) => {
      const event = parseRealtimeEvent(message.data);
      if (!event || !shouldDeliverToStore(event, storeId)) return;
      setLastEventAt(event.occurredAt);
      if (shouldReloadForRealtimeSignal("valid-event")) void guardedReload();
      if (event.type === "order-created") {
        const now = Date.now();
        setHighlightedTables((current) => nextHighlightedTables(current, event.tableId, now, highlightMs));
        schedulePrune();
      }
    };

    source.onerror = () => {
      setConnectionState("failed");
    };

    return () => {
      source.close();
      if (sourceRef.current === source) sourceRef.current = null;
    };
  }, [disconnect, guardedReload, highlightMs, schedulePrune, storeId]);

  return {
    connectionState,
    highlightedTableIds: highlightedTables.map((item) => item.tableId),
    lastEventAt,
    disconnect
  };
}
