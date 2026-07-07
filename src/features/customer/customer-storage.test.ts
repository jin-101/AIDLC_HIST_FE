import { describe, expect, it } from "vitest";
import type { StorageLike } from "@/features/cart/cart-storage";
import {
  clearTableContext,
  parseTableContext,
  readTableContext,
  TABLE_CONTEXT_STORAGE_KEY,
  writeTableContext
} from "./table-context-storage";
import type { TableContext } from "./types";

function memoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  };
}

const context: TableContext = {
  storeId: "store-1",
  storeCode: "demo-store",
  tableId: "table-1",
  tableNumber: "1",
  sessionId: "session-1",
  savedAt: "2026-01-01T00:00:00.000Z"
};

describe("table-context-storage", () => {
  it("table context를 저장하고 읽는다", () => {
    const storage = memoryStorage();

    writeTableContext(context, storage);

    expect(readTableContext(storage)).toEqual(context);
  });

  it("손상된 JSON은 null로 fallback한다", () => {
    expect(parseTableContext("{")).toBeNull();
  });

  it("schema mismatch는 null로 fallback한다", () => {
    expect(parseTableContext(JSON.stringify({ storeId: "store-1" }))).toBeNull();
  });

  it("clearTableContext는 저장된 context를 제거한다", () => {
    const storage = memoryStorage();
    storage.setItem(TABLE_CONTEXT_STORAGE_KEY, JSON.stringify(context));

    clearTableContext(storage);

    expect(readTableContext(storage)).toBeNull();
  });
});
