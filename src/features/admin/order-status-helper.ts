import type { OrderStatus } from "@/lib/types/domain";
import { ADMIN_ALLOWED_STATUSES } from "./types";

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && ADMIN_ALLOWED_STATUSES.includes(value as OrderStatus);
}

export function nextRecommendedStatus(status: OrderStatus): OrderStatus | null {
  if (status === "waiting") return "preparing";
  if (status === "preparing") return "completed";
  return null;
}

export function orderStatusLabel(status: OrderStatus): string {
  return {
    waiting: "대기중",
    preparing: "준비중",
    completed: "완료"
  }[status];
}
