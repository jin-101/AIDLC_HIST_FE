"use client";

import { useCallback, useEffect, useState } from "react";
import type { OrderWithItems } from "@/lib/types/domain";
import type { CustomerLoadState, TableContext } from "@/features/customer/types";
import { fetchCurrentSessionOrders } from "@/features/customer/customer-api";
import { customerErrorMessage } from "@/features/customer/customer-error-messages";

export function useCurrentSessionOrders(context: TableContext | null) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [state, setState] = useState<CustomerLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!context) return;
    setState("loading");
    setErrorMessage(null);
    try {
      const result = await fetchCurrentSessionOrders(context.sessionId);
      setOrders(result.orders);
      setState("loaded");
    } catch (error) {
      setErrorMessage(customerErrorMessage(error, "주문 내역을 불러오지 못했습니다."));
      setState("failed");
    }
  }, [context]);

  useEffect(() => {
    void load();
  }, [load]);

  return { orders, state, errorMessage, reload: load };
}
