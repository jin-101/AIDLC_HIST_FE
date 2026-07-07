import fc from "fast-check";
import type { CreateOrderItemInput, SessionStatus } from "@/lib/types/domain";

export const positivePriceArb = fc.integer({ min: 100, max: 100_000 });
export const positiveQuantityArb = fc.integer({ min: 1, max: 20 });

export const sessionStatusArb = fc.constantFrom<SessionStatus>("active", "completed");

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
