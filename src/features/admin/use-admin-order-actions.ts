"use client";

import { useCallback, useState } from "react";
import type { OrderStatus } from "@/lib/types/domain";
import { deleteOrder, updateOrderStatus } from "./admin-api";
import { adminErrorMessage } from "./admin-error-messages";
import type { AdminMutationState } from "./types";

export function useAdminOrderActions(onChanged: () => Promise<void> | void, confirmFn?: (message: string) => boolean) {
  const [state, setState] = useState<AdminMutationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const run = useCallback(
    async (action: () => Promise<unknown>, fallback: string) => {
      setState("submitting");
      setErrorMessage(null);
      try {
        await action();
        await onChanged();
        setState("succeeded");
      } catch (error) {
        setErrorMessage(adminErrorMessage(error, fallback));
        setState("failed");
      }
    },
    [onChanged]
  );

  const changeStatus = useCallback((orderId: string, status: OrderStatus) => run(() => updateOrderStatus(orderId, status), "주문 상태를 변경하지 못했습니다."), [run]);

  const removeOrder = useCallback(
    async (orderId: string) => {
      const confirmDelete = confirmFn ?? ((message: string) => window.confirm(message));
      if (!confirmDelete("이 주문을 삭제할까요?")) return;
      await run(() => deleteOrder(orderId), "주문을 삭제하지 못했습니다.");
    },
    [confirmFn, run]
  );

  return { state, errorMessage, changeStatus, removeOrder };
}
