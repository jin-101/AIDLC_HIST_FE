import type { TableDashboard } from "@/lib/types/domain";
import type { AdminDashboardSnapshot, AdminTableCard } from "./types";

export function toAdminTableCard(input: TableDashboard): AdminTableCard {
  const orders = input.activeSession ? input.orders : [];
  const sorted = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return {
    tableId: input.table.id,
    tableNumber: input.table.number,
    activeSessionId: input.activeSession?.id ?? null,
    orders,
    totalAmount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
    latestOrder: sorted[0] ?? null
  };
}

export function toAdminDashboardSnapshot(storeId: string, dashboard: TableDashboard[]): AdminDashboardSnapshot {
  return {
    storeId,
    tables: dashboard.map(toAdminTableCard),
    loadedAt: new Date().toISOString()
  };
}

export function filterTableCards(cards: AdminTableCard[], filterText: string): AdminTableCard[] {
  const normalized = filterText.trim().toLowerCase();
  if (!normalized) return cards;
  return cards.filter((card) => card.tableNumber.toLowerCase().includes(normalized));
}
