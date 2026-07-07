import { describe, expect, it } from "vitest";
import { isOrderStatus, nextRecommendedStatus, orderStatusLabel } from "./order-status-helper";

describe("order-status-helper", () => {
  it("허용된 주문 상태만 true를 반환한다", () => {
    expect(isOrderStatus("waiting")).toBe(true);
    expect(isOrderStatus("preparing")).toBe(true);
    expect(isOrderStatus("completed")).toBe(true);
    expect(isOrderStatus("cancelled")).toBe(false);
  });

  it("권장 다음 상태를 반환한다", () => {
    expect(nextRecommendedStatus("waiting")).toBe("preparing");
    expect(nextRecommendedStatus("preparing")).toBe("completed");
    expect(nextRecommendedStatus("completed")).toBeNull();
  });

  it("상태 라벨을 한국어로 표시한다", () => {
    expect(orderStatusLabel("waiting")).toBe("대기중");
  });
});
