"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuCategory, MenuItem } from "@/lib/types/domain";
import { createAdminMenuItem, deleteAdminMenuItem, fetchAdminMenus, reorderAdminMenuItems, updateAdminMenuItem } from "./admin-api";
import { adminErrorMessage } from "./admin-error-messages";
import { validateMenuDraft, validateReorderIds } from "./menu-admin-helpers";
import type { AdminLoadState, AdminMutationState, MenuFormDraft } from "./types";

export function useAdminMenus(storeId: string | null) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [state, setState] = useState<AdminLoadState>("idle");
  const [mutationState, setMutationState] = useState<AdminMutationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!storeId) return;
    setState("loading");
    setErrorMessage(null);
    try {
      const result = await fetchAdminMenus(storeId);
      setCategories(result.categories);
      setItems(result.items);
      setState("loaded");
    } catch (error) {
      setErrorMessage(adminErrorMessage(error, "메뉴를 불러오지 못했습니다."));
      setState("failed");
    }
  }, [storeId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const saveItem = useCallback(
    async (draft: MenuFormDraft) => {
      if (!storeId) return;
      const validation = validateMenuDraft(draft);
      if (!validation.ok) {
        setErrorMessage(validation.message);
        setMutationState("failed");
        return;
      }
      setMutationState("submitting");
      setErrorMessage(null);
      try {
        await (draft.id ? updateAdminMenuItem(storeId, draft) : createAdminMenuItem(storeId, draft));
        await reload();
        setMutationState("succeeded");
      } catch (error) {
        setErrorMessage(adminErrorMessage(error, "메뉴를 저장하지 못했습니다."));
        setMutationState("failed");
      }
    },
    [reload, storeId]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setMutationState("submitting");
      setErrorMessage(null);
      try {
        await deleteAdminMenuItem(id);
        await reload();
        setMutationState("succeeded");
      } catch (error) {
        setErrorMessage(adminErrorMessage(error, "메뉴를 삭제하지 못했습니다."));
        setMutationState("failed");
      }
    },
    [reload]
  );

  const reorderItems = useCallback(
    async (orderedIds: string[]) => {
      const validation = validateReorderIds(orderedIds);
      if (!validation.ok) {
        setErrorMessage(validation.message);
        setMutationState("failed");
        return;
      }
      setMutationState("submitting");
      setErrorMessage(null);
      try {
        setItems((await reorderAdminMenuItems(orderedIds)).items);
        setMutationState("succeeded");
      } catch (error) {
        setErrorMessage(adminErrorMessage(error, "메뉴 순서를 변경하지 못했습니다."));
        setMutationState("failed");
      }
    },
    []
  );

  return { categories, items, state, mutationState, errorMessage, reload, saveItem, deleteItem, reorderItems };
}
