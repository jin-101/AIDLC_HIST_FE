import type { MenuCategory, MenuItem, OrderWithItems } from "@/lib/types/domain";

export type CustomerLoadState = "idle" | "loading" | "loaded" | "failed";
export type SubmitState = "idle" | "submitting" | "succeeded" | "failed";

export interface TableContext {
  storeId: string;
  storeCode: string;
  tableId: string;
  tableNumber: string;
  sessionId: string;
  savedAt: string;
}

export interface CartItem {
  menuItemId: string;
  menuName: string;
  categoryId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CartState {
  storeId: string;
  tableId: string;
  sessionId: string;
  items: CartItem[];
  totalAmount: number;
  updatedAt: string;
}

export interface OrderDraftItem {
  menuItemId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDraft {
  storeId: string;
  tableId: string;
  sessionId: string;
  items: OrderDraftItem[];
  totalAmount: number;
}

export interface SubmitResult {
  orderId: string;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
}

export interface MenuCatalog {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface CustomerClientError {
  code: string;
  message: string;
}

export interface CurrentSessionOrders {
  orders: OrderWithItems[];
}
