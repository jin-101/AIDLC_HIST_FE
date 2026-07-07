import type { ApiResult } from "@/lib/api/response";
import type { MenuItem, Order, OrderWithItems, Table, TableDashboard } from "@/lib/types/domain";
import type { AdminDashboardResult, AdminHistoryFilter, AdminMenusResult, AdminOrderStatusResult, AdminSession, MenuFormDraft, TableCompletionResult } from "./types";

export class AdminApiError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

async function readApiResult<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiResult<T>;
  if (result.ok) return result.data;
  throw new AdminApiError(result.error.code, result.error.message);
}

export async function loginAdmin(input: { storeCode: string; password: string }): Promise<AdminSession> {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return readApiResult<AdminSession>(response);
}

export async function fetchAdminDashboard(storeId: string): Promise<AdminDashboardResult> {
  const response = await fetch(`/api/admin/dashboard?storeId=${encodeURIComponent(storeId)}`);
  return readApiResult<AdminDashboardResult>(response);
}

export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<AdminOrderStatusResult> {
  const response = await fetch("/api/admin/orders/status", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status })
  });
  return readApiResult<AdminOrderStatusResult>(response);
}

export async function deleteOrder(orderId: string): Promise<{ deleted: true }> {
  const response = await fetch("/api/admin/orders", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId })
  });
  return readApiResult<{ deleted: true }>(response);
}

export async function fetchAdminTables(storeId: string): Promise<{ tables: Table[] }> {
  const response = await fetch(`/api/admin/tables?storeId=${encodeURIComponent(storeId)}`);
  return readApiResult<{ tables: Table[] }>(response);
}

export async function upsertAdminTable(input: { storeId: string; number: string; password: string }): Promise<{ table: Table }> {
  const response = await fetch("/api/admin/tables", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return readApiResult<{ table: Table }>(response);
}

export async function completeAdminTable(tableId: string): Promise<TableCompletionResult> {
  const response = await fetch("/api/admin/tables/complete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableId })
  });
  return readApiResult<TableCompletionResult>(response);
}

export async function fetchAdminHistory(filter: AdminHistoryFilter): Promise<{ orders: OrderWithItems[] }> {
  const params = new URLSearchParams({ tableId: filter.tableId });
  if (filter.dateFrom) params.set("dateFrom", filter.dateFrom);
  if (filter.dateTo) params.set("dateTo", filter.dateTo);
  const response = await fetch(`/api/admin/history?${params.toString()}`);
  return readApiResult<{ orders: OrderWithItems[] }>(response);
}

export async function fetchAdminMenus(storeId: string): Promise<AdminMenusResult> {
  const response = await fetch(`/api/admin/menus?storeId=${encodeURIComponent(storeId)}`);
  return readApiResult<AdminMenusResult>(response);
}

export async function createAdminMenuItem(storeId: string, draft: MenuFormDraft): Promise<{ item: MenuItem }> {
  const response = await fetch("/api/admin/menus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...draft, storeId })
  });
  return readApiResult<{ item: MenuItem }>(response);
}

export async function updateAdminMenuItem(storeId: string, draft: MenuFormDraft): Promise<{ item: MenuItem }> {
  const response = await fetch("/api/admin/menus", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...draft, storeId })
  });
  return readApiResult<{ item: MenuItem }>(response);
}

export async function deleteAdminMenuItem(id: string): Promise<{ deleted: true }> {
  const response = await fetch("/api/admin/menus", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });
  return readApiResult<{ deleted: true }>(response);
}

export async function reorderAdminMenuItems(orderedIds: string[]): Promise<{ items: MenuItem[] }> {
  const response = await fetch("/api/admin/menus/reorder", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderedIds })
  });
  return readApiResult<{ items: MenuItem[] }>(response);
}

export type AdminDashboardWire = TableDashboard[];
