import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminApiError, fetchAdminDashboard, loginAdmin } from "./admin-api";

describe("admin-api", () => {
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
            storeName: "데모 매장",
            loggedIn: true,
            savedAt: "2026-01-01T00:00:00.000Z"
          }
        })
      })
    );

    await expect(loginAdmin({ storeCode: "demo-store", password: "admin" })).resolves.toMatchObject({
      storeId: "store-1",
      loggedIn: true
    });
  });

  it("실패 응답은 AdminApiError로 변환한다", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          ok: false,
          error: { code: "VALIDATION_ERROR", message: "storeId가 필요합니다." }
        })
      })
    );

    await expect(fetchAdminDashboard("")).rejects.toBeInstanceOf(AdminApiError);
    await expect(fetchAdminDashboard("")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });
});
