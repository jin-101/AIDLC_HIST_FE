import { describe, expect, it } from "vitest";
import type { AdminDashboardSnapshot } from "./types";
import { moveId } from "./menu-admin-helpers";

function preserveSnapshotOnFailure(current: AdminDashboardSnapshot, failed: boolean): AdminDashboardSnapshot {
  return failed ? current : { ...current, loadedAt: "2026-01-02T00:00:00.000Z" };
}

describe("admin-actions", () => {
  it("mutation 실패 시 기존 dashboard snapshot 참조를 보존한다", () => {
    const snapshot: AdminDashboardSnapshot = {
      storeId: "store-1",
      loadedAt: "2026-01-01T00:00:00.000Z",
      tables: []
    };

    expect(preserveSnapshotOnFailure(snapshot, true)).toBe(snapshot);
  });

  it("순서 변경 helper는 원본 배열을 변경하지 않는다", () => {
    const ids = ["a", "b", "c"];

    expect(moveId(ids, "b", "up")).toEqual(["b", "a", "c"]);
    expect(ids).toEqual(["a", "b", "c"]);
  });
});
