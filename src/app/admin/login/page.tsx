"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminSession } from "@/features/admin/use-admin-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, state, errorMessage, login, logout } = useAdminSession();
  const [storeCode, setStoreCode] = useState("demo-store");
  const [password, setPassword] = useState("admin1234");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await login({ storeCode, password });
    if (result) router.push("/admin/dashboard");
  }

  return (
    <AdminShell session={session} onLogout={logout}>
      <section className="panel">
        <h2>관리자 로그인</h2>
        <form className="admin-form-grid" data-testid="admin-login-form" onSubmit={submit}>
          <input data-testid="admin-login-store-code-input" placeholder="매장 코드" value={storeCode} onChange={(event) => setStoreCode(event.target.value)} />
          <input data-testid="admin-login-password-input" placeholder="관리자 비밀번호" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button data-testid="admin-login-submit-button" disabled={state === "loading"} type="submit">
            로그인
          </button>
        </form>
        {errorMessage ? <AdminStatusPanel title="로그인 실패" message={errorMessage} /> : null}
      </section>
    </AdminShell>
  );
}
