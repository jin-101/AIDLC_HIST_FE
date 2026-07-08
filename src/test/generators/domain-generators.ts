import fc from "fast-check";
import type { CreateOrderItemInput, MenuItem, OrderStatus, OrderWithItems, SessionStatus, TableSession } from "@/lib/types/domain";
import type { CartState } from "@/features/customer/types";
import type { RealtimeEvent, RealtimeEventType } from "@/features/realtime/types";

export const positivePriceArb = fc.integer({ min: 100, max: 100_000 });
export const positiveQuantityArb = fc.integer({ min: 1, max: 20 });

export const sessionStatusArb = fc.constantFrom<SessionStatus>("active", "completed");
export const orderStatusArb = fc.constantFrom<OrderStatus>("waiting", "preparing", "completed");
export const realtimeEventTypeArb = fc.constantFrom<RealtimeEventType>("order-created", "order-updated", "order-deleted", "table-completed");

export const isoDateArb = fc.date({ min: new Date("2026-01-01T00:00:00.000Z"), max: new Date("2026-12-31T23:59:59.999Z") }).map((date) => date.toISOString());

export const orderItemInputArb: fc.Arbitrary<CreateOrderItemInput> = fc.record({
  menuItemId: fc.uuid(),
  menuName: fc.string({ minLength: 1, maxLength: 40 }),
  quantity: positiveQuantityArb,
  unitPrice: positivePriceArb
});

export const orderItemsInputArb = fc.array(orderItemInputArb, { minLength: 1, maxLength: 10 });

export const apiPayloadArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.boolean(),
  fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 1, maxLength: 30 }),
    amount: fc.integer({ min: 0, max: 1_000_000 })
  })
);

export const menuItemArb: fc.Arbitrary<MenuItem> = fc.record({
  id: fc.uuid(),
  storeId: fc.uuid(),
  categoryId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 40 }),
  description: fc.string({ maxLength: 120 }),
  price: positivePriceArb,
  displayOrder: fc.integer({ min: 1, max: 100 }),
  isAvailable: fc.boolean(),
  createdAt: isoDateArb,
  updatedAt: isoDateArb
});

export const cartItemArb = fc.record({
  menuItemId: fc.uuid(),
  menuName: fc.string({ minLength: 1, maxLength: 40 }),
  categoryId: fc.uuid(),
  quantity: positiveQuantityArb,
  unitPrice: positivePriceArb
}).map((item) => ({ ...item, lineTotal: item.quantity * item.unitPrice }));

export const cartStateArb: fc.Arbitrary<CartState> = fc
  .tuple(fc.uuid(), fc.uuid(), fc.uuid(), isoDateArb, fc.array(cartItemArb, { maxLength: 20 }))
  .map(([storeId, tableId, sessionId, updatedAt, items]) => ({
    storeId,
    tableId,
    sessionId,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
    updatedAt
  }));

export const orderWithItemsArb: fc.Arbitrary<OrderWithItems> = fc
  .tuple(fc.uuid(), fc.uuid(), fc.uuid(), fc.uuid(), orderStatusArb, isoDateArb, orderItemsInputArb)
  .map(([id, storeId, tableId, sessionId, status, createdAt, items]) => {
    const orderItems = items.map((item, index) => ({
      id: `${id}-item-${index}`,
      orderId: id,
      menuItemId: item.menuItemId,
      menuName: item.menuName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.quantity * item.unitPrice
    }));
    return {
      id,
      storeId,
      tableId,
      sessionId,
      orderNumber: `ORD-${id.slice(0, 8)}`,
      status,
      totalAmount: orderItems.reduce((sum, item) => sum + item.lineTotal, 0),
      createdAt,
      updatedAt: createdAt,
      items: orderItems
    };
  });

export const tableSessionArb: fc.Arbitrary<TableSession> = fc
  .tuple(fc.uuid(), fc.uuid(), fc.uuid(), sessionStatusArb, isoDateArb)
  .map(([id, storeId, tableId, status, startedAt]) => ({
    id,
    storeId,
    tableId,
    status,
    startedAt,
    completedAt: status === "completed" ? startedAt : null
  }));

type OrderRealtimeEventType = Extract<RealtimeEventType, "order-created" | "order-updated" | "order-deleted">;

const orderRealtimeEventArb: fc.Arbitrary<RealtimeEvent> = fc
  .tuple(fc.constantFrom<OrderRealtimeEventType>("order-created", "order-updated", "order-deleted"), fc.uuid(), fc.uuid(), fc.uuid(), fc.uuid(), isoDateArb)
  .map(([type, storeId, tableId, sessionId, orderId, occurredAt]) => ({ type, storeId, tableId, sessionId, orderId, occurredAt }));

const tableRealtimeEventArb: fc.Arbitrary<RealtimeEvent> = fc
  .tuple(fc.constant<"table-completed">("table-completed"), fc.uuid(), fc.uuid(), fc.uuid(), isoDateArb)
  .map(([type, storeId, tableId, sessionId, occurredAt]) => ({ type, storeId, tableId, sessionId, occurredAt }));

export const realtimeEventArb: fc.Arbitrary<RealtimeEvent> = fc.oneof(orderRealtimeEventArb, tableRealtimeEventArb);
