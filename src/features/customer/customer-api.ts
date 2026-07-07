import type { ApiResult } from "@/lib/api/response";
import type { MenuCatalog, OrderDraft, SubmitResult, TableContext, CurrentSessionOrders } from "./types";

export class CustomerApiError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "CustomerApiError";
  }
}

async function readApiResult<T>(response: Response): Promise<T> {
  const result = (await response.json()) as ApiResult<T>;
  if (result.ok) return result.data;
  throw new CustomerApiError(result.error.code, result.error.message);
}

export async function setupTable(input: {
  storeCode: string;
  tableNumber: string;
  tablePassword: string;
}): Promise<TableContext> {
  const response = await fetch("/api/customer/setup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input)
  });
  return readApiResult<TableContext>(response);
}

export async function fetchMenuCatalog(storeId: string): Promise<MenuCatalog> {
  const response = await fetch(`/api/customer/menu?storeId=${encodeURIComponent(storeId)}`);
  return readApiResult<MenuCatalog>(response);
}

export async function submitOrder(draft: OrderDraft): Promise<SubmitResult> {
  const response = await fetch("/api/customer/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(draft)
  });
  return readApiResult<SubmitResult>(response);
}

export async function fetchCurrentSessionOrders(sessionId: string): Promise<CurrentSessionOrders> {
  const response = await fetch(`/api/customer/orders/current?sessionId=${encodeURIComponent(sessionId)}`);
  return readApiResult<CurrentSessionOrders>(response);
}
