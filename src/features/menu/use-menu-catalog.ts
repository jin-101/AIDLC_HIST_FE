"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMenuCatalog } from "@/features/customer/customer-api";
import { customerErrorMessage } from "@/features/customer/customer-error-messages";
import type { CustomerLoadState, MenuCatalog } from "@/features/customer/types";

export function useMenuCatalog(storeId: string | null) {
  const [catalog, setCatalog] = useState<MenuCatalog>({ categories: [], items: [] });
  const [state, setState] = useState<CustomerLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!storeId) return;
    setState("loading");
    setErrorMessage(null);
    try {
      setCatalog(await fetchMenuCatalog(storeId));
      setState("loaded");
    } catch (error) {
      setErrorMessage(customerErrorMessage(error, "메뉴를 불러오지 못했습니다."));
      setState("failed");
    }
  }, [storeId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { catalog, state, errorMessage, reload: load };
}
