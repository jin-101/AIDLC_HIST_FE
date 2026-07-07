import type { OrderWithItems } from "@/lib/types/domain";
import type { AdminHistoryFilter } from "./types";

export function validateHistoryFilter(filter: AdminHistoryFilter): string | null {
  if (!filter.tableId) return "테이블을 선택해주세요.";
  if (filter.dateFrom && filter.dateTo && filter.dateFrom > filter.dateTo) return "조회 시작일은 종료일보다 늦을 수 없습니다.";
  return null;
}

export function matchesHistoryFilter(order: OrderWithItems, filter: AdminHistoryFilter): boolean {
  if (order.tableId !== filter.tableId) return false;
  if (filter.dateFrom && order.createdAt < filter.dateFrom) return false;
  if (filter.dateTo) {
    const inclusiveEnd = filter.dateTo.length === 10 ? `${filter.dateTo}T23:59:59.999Z` : filter.dateTo;
    if (order.createdAt > inclusiveEnd) return false;
  }
  return true;
}
