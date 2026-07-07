"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAdminDashboard } from "./admin-api";
import { adminErrorMessage } from "./admin-error-messages";
import { toAdminDashboardSnapshot } from "./dashboard-mapper";
import type { AdminDashboardSnapshot, AdminLoadState } from "./types";

export function useAdminDashboard(storeId: string | null) {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(null);
  const [state, setState] = useState<AdminLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!storeId) return;
    setState("loading");
    setErrorMessage(null);
    try {
      const result = await fetchAdminDashboard(storeId);
      setSnapshot(toAdminDashboardSnapshot(storeId, result.dashboard));
      setState("loaded");
    } catch (error) {
      setErrorMessage(adminErrorMessage(error, "대시보드를 불러오지 못했습니다."));
      setState("failed");
    }
  }, [storeId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { snapshot, state, errorMessage, reload };
}
