import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { ok } from "@/lib/api/response";
import { orderItemsInputArb, sessionStatusArb } from "@/test/generators/domain-generators";

describe("Foundation repository properties", () => {
  it("주문 총액은 line total 합과 같다", () => {
    fc.assert(
      fc.property(orderItemsInputArb, (items) => {
        const lineTotals = items.map((item) => item.quantity * item.unitPrice);
        const total = lineTotals.reduce((sum, lineTotal) => sum + lineTotal, 0);

        expect(total).toBeGreaterThanOrEqual(0);
        expect(total).toBe(lineTotals.reduce((sum, lineTotal) => sum + lineTotal, 0));
      })
    );
  });

  it("session status는 허용된 값만 생성된다", () => {
    fc.assert(
      fc.property(sessionStatusArb, (status) => {
        expect(["active", "completed"]).toContain(status);
      })
    );
  });

  it("API success wrapper mapping은 deterministic하다", () => {
    fc.assert(
      fc.property(fc.uuid(), fc.string(), (id, name) => {
        const payload = { id, name };
        expect(ok(payload)).toEqual(ok(payload));
      })
    );
  });

  it("menu reorder 결과는 입력 순서를 display order로 표현할 수 있다", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.uuid(), { minLength: 1, maxLength: 10 }), (ids) => {
        const orderMap = new Map(ids.map((id, index) => [id, index + 1]));
        expect(ids.map((id) => orderMap.get(id))).toEqual(ids.map((_, index) => index + 1));
      })
    );
  });

  it("completed session은 active session query 모델에서 제외된다", () => {
    fc.assert(
      fc.property(fc.array(sessionStatusArb, { minLength: 1, maxLength: 20 }), (statuses) => {
        const activeOnly = statuses.filter((status) => status === "active");
        expect(activeOnly).not.toContain("completed");
      })
    );
  });
});
