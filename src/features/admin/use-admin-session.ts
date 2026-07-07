"use client";

import { useCallback, useEffect, useState } from "react";
import { loginAdmin } from "./admin-api";
import { adminErrorMessage } from "./admin-error-messages";
import { clearAdminSession, readAdminSession, writeAdminSession } from "./admin-session-storage";
import type { AdminLoadState, AdminSession } from "./types";

export function useAdminSession() {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [state, setState] = useState<AdminLoadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setSession(readAdminSession());
  }, []);

  const login = useCallback(async (input: { storeCode: string; password: string }) => {
    setState("loading");
    setErrorMessage(null);
    try {
      const next = await loginAdmin(input);
      writeAdminSession(next);
      setSession(next);
      setState("loaded");
      return next;
    } catch (error) {
      setErrorMessage(adminErrorMessage(error, "관리자 로그인에 실패했습니다."));
      setState("failed");
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setState("idle");
  }, []);

  return { session, state, errorMessage, login, logout };
}
