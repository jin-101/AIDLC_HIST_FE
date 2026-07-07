import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { ADMIN_SESSION_STORAGE_KEY, parseAdminSession, readAdminSession, writeAdminSession } from "./admin-session-storage";
import type { AdminSession } from "./types";
import type { StorageLike } from "@/features/cart/cart-storage";

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  };
}

const session: AdminSession = {
  storeId: "store-1",
  storeCode: "demo-store",
  storeName: "데모 매장",
  loggedIn: true,
  savedAt: "2026-01-01T00:00:00.000Z"
};

describe("admin-session-storage", () => {
  it("손상된 JSON은 null로 fallback한다", () => {
    expect(parseAdminSession("{")).toBeNull();
  });

  it("password 필드 없이 관리자 세션을 저장하고 읽는다", () => {
    const storage = memoryStorage();

    writeAdminSession(session, storage);

    expect(readAdminSession(storage)).toEqual(session);
    expect(storage.getItem(ADMIN_SESSION_STORAGE_KEY)).not.toContain("password");
  });

  it("PBT: 필수 문자열 필드와 loggedIn=true이면 세션으로 파싱된다", () => {
    fc.assert(
      fc.property(
        fc.record({
          storeId: fc.string({ minLength: 1 }),
          storeCode: fc.string({ minLength: 1 }),
          storeName: fc.string({ minLength: 1 }),
          savedAt: fc.string({ minLength: 1 })
        }),
        (input) => {
          expect(parseAdminSession(JSON.stringify({ ...input, loggedIn: true }))).toMatchObject(input);
        }
      )
    );
  });
});
