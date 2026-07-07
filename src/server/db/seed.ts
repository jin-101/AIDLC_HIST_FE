import type Database from "better-sqlite3";
import { v4 as uuid } from "uuid";

const now = "2026-01-01T00:00:00.000Z";

export function seedDatabase(db: Database.Database): void {
  const existing = db.prepare("SELECT id FROM stores WHERE code = ?").get("demo-store");
  if (existing) return;

  const storeId = uuid();
  db.prepare("INSERT INTO stores (id, code, name, created_at) VALUES (?, ?, ?, ?)").run(
    storeId,
    "demo-store",
    "데모 매장",
    now
  );

  const tableInsert = db.prepare(
    "INSERT INTO tables (id, store_id, number, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
  );
  for (const tableNumber of ["1", "2", "3", "4"]) {
    tableInsert.run(uuid(), storeId, tableNumber, `table-${tableNumber}`, now, now);
  }

  const categories = [
    { id: uuid(), name: "식사", order: 1 },
    { id: uuid(), name: "음료", order: 2 },
    { id: uuid(), name: "사이드", order: 3 }
  ];

  const categoryInsert = db.prepare(
    "INSERT INTO menu_categories (id, store_id, name, display_order) VALUES (?, ?, ?, ?)"
  );
  for (const category of categories) {
    categoryInsert.run(category.id, storeId, category.name, category.order);
  }

  const menuItems = [
    ["김치볶음밥", "매콤한 김치볶음밥", 9000, categories[0].id, 1],
    ["불고기덮밥", "달콤한 불고기 덮밥", 11000, categories[0].id, 2],
    ["비빔국수", "새콤달콤 비빔국수", 8500, categories[0].id, 3],
    ["콜라", "시원한 탄산음료", 2500, categories[1].id, 1],
    ["사이다", "청량한 탄산음료", 2500, categories[1].id, 2],
    ["아이스티", "복숭아 아이스티", 3000, categories[1].id, 3],
    ["감자튀김", "바삭한 감자튀김", 5000, categories[2].id, 1],
    ["치킨너겟", "한입 치킨너겟", 6500, categories[2].id, 2]
  ] as const;

  const menuInsert = db.prepare(`
    INSERT INTO menu_items (
      id, store_id, category_id, name, description, price, display_order, is_available, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
  `);
  for (const [name, description, price, categoryId, displayOrder] of menuItems) {
    menuInsert.run(uuid(), storeId, categoryId, name, description, price, displayOrder, now, now);
  }

  db.prepare("INSERT INTO admin_credentials (id, store_id, password, created_at) VALUES (?, ?, ?, ?)").run(
    uuid(),
    storeId,
    "admin",
    now
  );
}
