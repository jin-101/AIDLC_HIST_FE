export type RealtimeEventType = "order-created" | "order-updated" | "order-deleted" | "table-completed";

export type EventConnectionState = "connecting" | "open" | "failed" | "closed";

export interface BaseRealtimeEvent {
  type: RealtimeEventType;
  storeId: string;
  tableId: string;
  sessionId: string;
  occurredAt: string;
}

export interface OrderRealtimeEvent extends BaseRealtimeEvent {
  type: "order-created" | "order-updated" | "order-deleted";
  orderId: string;
}

export interface TableRealtimeEvent extends BaseRealtimeEvent {
  type: "table-completed";
}

export type RealtimeEvent = OrderRealtimeEvent | TableRealtimeEvent;

export interface HighlightedTable {
  tableId: string;
  expiresAt: number;
}

export type RealtimeSignal = "open" | "valid-event" | "invalid-event" | "closed" | "error";
