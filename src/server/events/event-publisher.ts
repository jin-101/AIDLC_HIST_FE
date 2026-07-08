import type { RealtimeEvent } from "@/features/realtime/types";
import type { Order, TableSession } from "@/lib/types/domain";
import { eventBus, type PublishResult } from "./event-bus";

function publishSafely(event: RealtimeEvent): PublishResult {
  try {
    return eventBus.publish(event);
  } catch {
    return { delivered: 0, removed: 0 };
  }
}

export function publishOrderCreated(order: Order): PublishResult {
  return publishSafely({
    type: "order-created",
    storeId: order.storeId,
    tableId: order.tableId,
    sessionId: order.sessionId,
    orderId: order.id,
    occurredAt: new Date().toISOString()
  });
}

export function publishOrderUpdated(order: Order): PublishResult {
  return publishSafely({
    type: "order-updated",
    storeId: order.storeId,
    tableId: order.tableId,
    sessionId: order.sessionId,
    orderId: order.id,
    occurredAt: new Date().toISOString()
  });
}

export function publishOrderDeleted(order: Order): PublishResult {
  return publishSafely({
    type: "order-deleted",
    storeId: order.storeId,
    tableId: order.tableId,
    sessionId: order.sessionId,
    orderId: order.id,
    occurredAt: new Date().toISOString()
  });
}

export function publishTableCompleted(tableId: string, session: TableSession): PublishResult {
  return publishSafely({
    type: "table-completed",
    storeId: session.storeId,
    tableId,
    sessionId: session.id,
    occurredAt: new Date().toISOString()
  });
}
