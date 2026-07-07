"use client";

import { useEffect, useState } from "react";
import type { MenuCategory, MenuItem } from "@/lib/types/domain";
import type { MenuFormDraft } from "@/features/admin/types";

interface MenuItemFormProps {
  categories: MenuCategory[];
  item?: MenuItem | null;
  onSubmit: (draft: MenuFormDraft) => void;
  disabled?: boolean;
}

export function MenuItemForm({ categories, item, onSubmit, disabled }: MenuItemFormProps) {
  const [draft, setDraft] = useState<MenuFormDraft>({
    name: "",
    description: "",
    price: 1000,
    categoryId: categories[0]?.id ?? "",
    displayOrder: 0
  });

  useEffect(() => {
    setDraft({
      id: item?.id,
      name: item?.name ?? "",
      description: item?.description ?? "",
      price: item?.price ?? 1000,
      categoryId: item?.categoryId ?? categories[0]?.id ?? "",
      displayOrder: item?.displayOrder ?? 0
    });
  }, [categories, item]);

  return (
    <form className="admin-form-grid" data-testid="admin-menu-form" onSubmit={(event) => { event.preventDefault(); onSubmit(draft); }}>
      <input data-testid="admin-menu-name-input" placeholder="메뉴명" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} />
      <input data-testid="admin-menu-description-input" placeholder="설명" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
      <input data-testid="admin-menu-price-input" min={1} type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} />
      <select data-testid="admin-menu-category-select" value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
      <input data-testid="admin-menu-order-input" min={0} type="number" value={draft.displayOrder} onChange={(event) => setDraft({ ...draft, displayOrder: Number(event.target.value) })} />
      <button data-testid="admin-menu-save-button" disabled={disabled} type="submit">저장</button>
    </form>
  );
}
