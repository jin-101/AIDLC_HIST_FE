"use client";

import { useCallback, useState } from "react";
import type { OrderWithItems } from "@/lib/types/domain";
import { fetchAdminHistory } from "./admin-api";
import { adminErrorMessage } from "./admin-error-messages";
import { validateHistoryFilter } from "./history-filter";
import type { AdminHistoryFilter, AdminLoadState } from "./types";

export function useAdminHistory() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [state, setState] = useState<AdminLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const search = useCallback(async (filter: AdminHistoryFilter) => {
    const validation = validateHistoryFilter(filter);
    if (validation) {
      setErrorMessage(validation);
      setState("failed");
      return;
    }
    setState("loading");
    setErrorMessage(null);
    try {
      setOrders((await fetchAdminHistory(filter)).orders);
      setState("loaded");
    } catch (error) {
      setErrorMessage(adminErrorMessage(error, "주문 이력을 조회하지 못했습니다."));
      setState("failed");
    }
  }, []);

  return { orders, state, errorMessage, search };
}
