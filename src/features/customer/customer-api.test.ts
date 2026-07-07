import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomerApiError, fetchMenuCatalog, setupTable } from "./customer-api";

describe("customer-api", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("성공 응답의 data를 반환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: true,
          data: {
            storeId: "store-1",
            storeCode: "demo-store",
            tableId: "table-1",
            tableNumber: "1",
            sessionId: "session-1",
            savedAt: "2026-01-01T00:00:00.000Z"
          }
        })
      })
    );

    await expect(setupTable({ storeCode: "demo-store", tableNumber: "1", tablePassword: "table-1" })).resolves.toMatchObject({
      tableNumber: "1",
      sessionId: "session-1"
    });
  });

  it("실패 응답은 CustomerApiError로 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "메뉴를 불러오지 못했습니다." }
        })
      })
    );

    await expect(fetchMenuCatalog("store-1")).rejects.toBeInstanceOf(CustomerApiError);
    await expect(fetchMenuCatalog("store-1")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
