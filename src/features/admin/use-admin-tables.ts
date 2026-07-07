"use client";

import { useCallback, useEffect, useState } from "react";
import type { Table } from "@/lib/types/domain";
import { completeAdminTable, fetchAdminTables, upsertAdminTable } from "./admin-api";
import { adminErrorMessage } from "./admin-error-messages";
import type { AdminLoadState, AdminMutationState } from "./types";

export function useAdminTables(storeId: string | null) {
  const [tables, setTables] = useState<Table[]>([]);
  const [state, setState] = useState<AdminLoadState>("idle");
  const [mutationState, setMutationState] = useState<AdminMutationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!storeId) return;
    setState("loading");
    setErrorMessage(null);
    try {
      setTables((await fetchAdminTables(storeId)).tables);
      setState("loaded");
    } catch (error) {
      setErrorMessage(adminErrorMessage(error, "테이블 목록을 불러오지 못했습니다."));
      setState("failed");
    }
  }, [storeId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveTable = useCallback(
    async (input: { number: string; password: string }) => {
      if (!storeId) return;
      setMutationState("submitting");
      setErrorMessage(null);
      try {
        await upsertAdminTable({ ...input, storeId });
        await reload();
        setMutationState("succeeded");
      } catch (error) {
        setErrorMessage(adminErrorMessage(error, "테이블을 저장하지 못했습니다."));
        setMutationState("failed");
      }
    },
    [reload, storeId]
  );

  const completeTable = useCallback(
    async (tableId: string) => {
      setMutationState("submitting");
      setErrorMessage(null);
      try {
        await completeAdminTable(tableId);
        await reload();
        setMutationState("succeeded");
      } catch (error) {
        setErrorMessage(adminErrorMessage(error, "테이블 세션을 완료하지 못했습니다."));
        setMutationState("failed");
      }
    },
    [reload]
  );

  return { tables, state, mutationState, errorMessage, reload, saveTable, completeTable };
}
