import { v4 as uuid } from "uuid";
import { getDatabase } from "@/server/db/connection";
import type { MenuCategory, MenuItem } from "@/lib/types/domain";
import { mapCategory, mapMenuItem } from "./row-mappers";

export interface MenuInput {
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  displayOrder: number;
}

export const menuRepository = {
  listCategoriesByStore(storeId: string): MenuCategory[] {
    return getDatabase()
      .prepare("SELECT * FROM menu_categories WHERE store_id = ? ORDER BY display_order, name")
      .all(storeId)
      .map((row) => mapCategory(row as Record<string, unknown>));
  },

  listByStore(storeId: string): MenuItem[] {
    return getDatabase()
      .prepare(
        "SELECT * FROM menu_items WHERE store_id = ? AND is_available = 1 ORDER BY display_order, name"
      )
      .all(storeId)
      .map((row) => mapMenuItem(row as Record<string, unknown>));
  },

  create(input: MenuInput): MenuItem {
    const now = new Date().toISOString();
    const item: MenuItem = {
      id: uuid(),
      storeId: input.storeId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      price: input.price,
      displayOrder: input.displayOrder,
      isAvailable: true,
      createdAt: now,
      updatedAt: now
    };

    getDatabase()
      .prepare(
        `INSERT INTO menu_items
        (id, store_id, category_id, name, description, price, display_order, is_available, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        item.id,
        item.storeId,
        item.categoryId,
        item.name,
        item.description,
        item.price,
        item.displayOrder,
        1,
        item.createdAt,
        item.updatedAt
      );

    return item;
  },

  update(id: string, changes: Partial<Omit<MenuInput, "storeId">>): MenuItem | null {
    const existing = getDatabase().prepare("SELECT * FROM menu_items WHERE id = ?").get(id);
    if (!existing) return null;

    const current = mapMenuItem(existing as Record<string, unknown>);
    const next = { ...current, ...changes, updatedAt: new Date().toISOString() };

    getDatabase()
      .prepare(
        `UPDATE menu_items
         SET category_id = ?, name = ?, description = ?, price = ?, display_order = ?, updated_at = ?
         WHERE id = ?`
      )
      .run(next.categoryId, next.name, next.description, next.price, next.displayOrder, next.updatedAt, id);

    return next;
  },

  delete(id: string): void {
    getDatabase().prepare("DELETE FROM menu_items WHERE id = ?").run(id);
  },

  reorder(orderedIds: string[]): MenuItem[] {
    const db = getDatabase();
    const update = db.prepare("UPDATE menu_items SET display_order = ?, updated_at = ? WHERE id = ?");
    const now = new Date().toISOString();

    orderedIds.forEach((id, index) => update.run(index + 1, now, id));

    if (orderedIds.length === 0) return [];

    const placeholders = orderedIds.map(() => "?").join(",");
    return db
      .prepare(`SELECT * FROM menu_items WHERE id IN (${placeholders}) ORDER BY display_order`)
      .all(...orderedIds)
      .map((row) => mapMenuItem(row as Record<string, unknown>));
  }
};
