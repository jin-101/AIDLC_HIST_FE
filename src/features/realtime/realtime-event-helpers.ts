import type { HighlightedTable, RealtimeEvent, RealtimeEventType, RealtimeSignal } from "./types";

export const REALTIME_EVENT_TYPES: RealtimeEventType[] = ["order-created", "order-updated", "order-deleted", "table-completed"];

export function isRealtimeEventType(value: unknown): value is RealtimeEventType {
  return typeof value === "string" && REALTIME_EVENT_TYPES.includes(value as RealtimeEventType);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isIsoLikeString(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function parseRealtimeEvent(raw: string | unknown): RealtimeEvent | null {
  let value: unknown = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<RealtimeEvent>;
  if (!isRealtimeEventType(candidate.type)) return null;
  if (!isNonEmptyString(candidate.storeId) || !isNonEmptyString(candidate.tableId) || !isNonEmptyString(candidate.sessionId)) return null;
  if (!isIsoLikeString(candidate.occurredAt)) return null;

  if (candidate.type === "table-completed") {
    return {
      type: "table-completed",
      storeId: candidate.storeId,
      tableId: candidate.tableId,
      sessionId: candidate.sessionId,
      occurredAt: candidate.occurredAt
    };
  }

  const orderId = (candidate as Partial<{ orderId: string }>).orderId;
  if (!isNonEmptyString(orderId)) return null;
  return {
    type: candidate.type,
    storeId: candidate.storeId,
    tableId: candidate.tableId,
    sessionId: candidate.sessionId,
    orderId,
    occurredAt: candidate.occurredAt
  };
}

export function shouldDeliverToStore(event: Pick<RealtimeEvent, "storeId">, storeId: string): boolean {
  return Boolean(storeId) && event.storeId === storeId;
}

export function shouldReloadForRealtimeSignal(signal: RealtimeSignal): boolean {
  return signal === "open" || signal === "valid-event";
}

export function pruneExpiredHighlightedTables(highlighted: HighlightedTable[], now: number): HighlightedTable[] {
  return highlighted.filter((item) => item.expiresAt > now);
}

export function nextHighlightedTables(highlighted: HighlightedTable[], tableId: string, now: number, highlightMs: number): HighlightedTable[] {
  const active = pruneExpiredHighlightedTables(highlighted, now).filter((item) => item.tableId !== tableId);
  if (!tableId || highlightMs <= 0) return active;
  return [...active, { tableId, expiresAt: now + highlightMs }];
}
