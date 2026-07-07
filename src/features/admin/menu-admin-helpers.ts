import type { MenuFormDraft } from "./types";

export interface ValidationResult {
  ok: boolean;
  message: string | null;
}

export function validateMenuDraft(draft: MenuFormDraft): ValidationResult {
  if (!draft.name.trim()) return { ok: false, message: "메뉴명을 입력해주세요." };
  if (!draft.categoryId.trim()) return { ok: false, message: "카테고리를 선택해주세요." };
  if (!Number.isInteger(draft.price) || draft.price <= 0) return { ok: false, message: "가격은 0보다 큰 정수여야 합니다." };
  if (!Number.isInteger(draft.displayOrder) || draft.displayOrder < 0) return { ok: false, message: "표시 순서를 확인해주세요." };
  return { ok: true, message: null };
}

export function validateReorderIds(orderedIds: string[]): ValidationResult {
  if (orderedIds.length === 0) return { ok: false, message: "순서를 변경할 메뉴가 없습니다." };
  if (new Set(orderedIds).size !== orderedIds.length) return { ok: false, message: "중복된 메뉴가 있습니다." };
  if (orderedIds.some((id) => !id.trim())) return { ok: false, message: "메뉴 ID를 확인해주세요." };
  return { ok: true, message: null };
}

export function moveId(orderedIds: string[], id: string, direction: "up" | "down"): string[] {
  const index = orderedIds.indexOf(id);
  if (index < 0) return orderedIds;
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= orderedIds.length) return orderedIds;
  const next = [...orderedIds];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
