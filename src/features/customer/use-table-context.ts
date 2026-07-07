"use client";

import { useCallback, useEffect, useState } from "react";
import { setupTable } from "./customer-api";
import { clearTableContext, readTableContext, writeTableContext } from "./table-context-storage";
import { customerErrorMessage } from "./customer-error-messages";
import type { CustomerLoadState, TableContext } from "./types";

export function useTableContext() {
  const [context, setContext] = useState<TableContext | null>(null);
  const [state, setState] = useState<CustomerLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setContext(readTableContext());
  }, []);

  const submitSetup = useCallback(async (input: { storeCode: string; tableNumber: string; tablePassword: string }) => {
    setState("loading");
    setErrorMessage(null);
    try {
      const next = await setupTable(input);
      writeTableContext(next);
      setContext(next);
      setState("loaded");
      return next;
    } catch (error) {
      setErrorMessage(customerErrorMessage(error, "테이블 설정에 실패했습니다."));
      setState("failed");
      return null;
    }
  }, []);

  const clear = useCallback(() => {
    clearTableContext();
    setContext(null);
  }, []);

  return { context, state, errorMessage, submitSetup, clear };
}
