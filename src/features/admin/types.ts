import type { MenuCategory, MenuItem, Order, OrderStatus, OrderWithItems, Table, TableDashboard } from "@/lib/types/domain";

export type AdminLoadState = "idle" | "loading" | "loaded" | "failed";
export type AdminMutationState = "idle" | "submitting" | "succeeded" | "failed";

export interface AdminSession {
  storeId: string;
  storeCode: string;
  storeName: string;
  loggedIn: boolean;
  savedAt: string;
}

export interface AdminTableCard {
  tableId: string;
  tableNumber: string;
  activeSessionId: string | null;
  orders: OrderWithItems[];
  totalAmount: number;
  latestOrder: OrderWithItems | null;
}

export interface AdminDashboardSnapshot {
  storeId: string;
  tables: AdminTableCard[];
  loadedAt: string;
}

export interface AdminClientError {
  code: string;
  message: string;
}

export interface MenuFormDraft {
  id?: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  displayOrder: number;
}

export interface AdminHistoryFilter {
  tableId: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TableCompletionResult {
  tableId: string;
  sessionId: string;
  completedAt: string;
}

export interface AdminMenusResult {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface AdminTablesResult {
  tables: Table[];
}

export interface AdminDashboardResult {
  dashboard: TableDashboard[];
}

export interface AdminOrderStatusResult {
  order: Order;
}

export const ADMIN_ALLOWED_STATUSES: OrderStatus[] = ["waiting", "preparing", "completed"];
