import type {
  AdminCredential,
  MenuCategory,
  MenuItem,
  Order,
  OrderItem,
  Store,
  Table,
  TableSession
} from "@/lib/types/domain";

type Row = Record<string, unknown>;

const text = (row: Row, key: string): string => String(row[key]);
const number = (row: Row, key: string): number => Number(row[key]);

export function mapStore(row: Row): Store {
  return {
    id: text(row, "id"),
    code: text(row, "code"),
    name: text(row, "name"),
    createdAt: text(row, "created_at")
  };
}

export function mapTable(row: Row): Table {
  return {
    id: text(row, "id"),
    storeId: text(row, "store_id"),
    number: text(row, "number"),
    password: text(row, "password"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at")
  };
}

export function mapSession(row: Row): TableSession {
  return {
    id: text(row, "id"),
    storeId: text(row, "store_id"),
    tableId: text(row, "table_id"),
    status: text(row, "status") as TableSession["status"],
    startedAt: text(row, "started_at"),
    completedAt: row.completed_at ? text(row, "completed_at") : null
  };
}

export function mapCategory(row: Row): MenuCategory {
  return {
    id: text(row, "id"),
    storeId: text(row, "store_id"),
    name: text(row, "name"),
    displayOrder: number(row, "display_order")
  };
}

export function mapMenuItem(row: Row): MenuItem {
  return {
    id: text(row, "id"),
    storeId: text(row, "store_id"),
    categoryId: text(row, "category_id"),
    name: text(row, "name"),
    description: text(row, "description"),
    price: number(row, "price"),
    displayOrder: number(row, "display_order"),
    isAvailable: Boolean(number(row, "is_available")),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at")
  };
}

export function mapOrder(row: Row): Order {
  return {
    id: text(row, "id"),
    storeId: text(row, "store_id"),
    tableId: text(row, "table_id"),
    sessionId: text(row, "session_id"),
    orderNumber: text(row, "order_number"),
    status: text(row, "status") as Order["status"],
    totalAmount: number(row, "total_amount"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at")
  };
}

export function mapOrderItem(row: Row): OrderItem {
  return {
    id: text(row, "id"),
    orderId: text(row, "order_id"),
    menuItemId: text(row, "menu_item_id"),
    menuName: text(row, "menu_name"),
    quantity: number(row, "quantity"),
    unitPrice: number(row, "unit_price"),
    lineTotal: number(row, "line_total")
  };
}

export function mapAdminCredential(row: Row): AdminCredential {
  return {
    id: text(row, "id"),
    storeId: text(row, "store_id"),
    password: text(row, "password"),
    createdAt: text(row, "created_at")
  };
}
