import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { moveId, validateMenuDraft, validateReorderIds } from "./menu-admin-helpers";

describe("menu-admin-helpers", () => {
  it("메뉴 draft 필수값과 숫자 범위를 검증한다", () => {
    expect(validateMenuDraft({ name: "", description: "", price: 1000, categoryId: "category-1", displayOrder: 0 }).ok).toBe(false);
    expect(validateMenuDraft({ name: "김밥", description: "", price: 1000, categoryId: "category-1", displayOrder: 0 }).ok).toBe(true);
  });

  it("중복되거나 빈 reorder id를 거부한다", () => {
    expect(validateReorderIds(["a", "a"]).ok).toBe(false);
    expect(validateReorderIds(["a", " "]).ok).toBe(false);
    expect(validateReorderIds(["a", "b"]).ok).toBe(true);
  });

  it("PBT: moveId는 항목 집합을 보존한다", () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.uuid(), { minLength: 1, maxLength: 20 }), fc.boolean(), (ids, moveDown) => {
        const moved = moveId(ids, ids[0], moveDown ? "down" : "up");
        expect([...moved].sort()).toEqual([...ids].sort());
      })
    );
  });
});
