"use client";

import { FormEvent, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { useAdminSession } from "@/features/admin/use-admin-session";
import { useAdminTables } from "@/features/admin/use-admin-tables";

export default function AdminTablesPage() {
  const { session, logout } = useAdminSession();
  const { tables, state, mutationState, errorMessage, reload, saveTable } = useAdminTables(session?.storeId ?? null);
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void saveTable({ number, password });
    setNumber("");
    setPassword("");
  }

  if (!session) {
    return (
      <AdminShell session={null}>
        <AdminStatusPanel title="관리자 로그인이 필요합니다." actionLabel="로그인" onAction={() => location.assign("/admin/login")} />
      </AdminShell>
    );
  }

  return (
    <AdminShell session={session} onLogout={logout}>
      <section className="stack">
        <form className="admin-form-grid panel" data-testid="admin-table-form" onSubmit={submit}>
          <h2>테이블 등록/수정</h2>
          <input data-testid="admin-table-number-input" placeholder="테이블 번호" value={number} onChange={(event) => setNumber(event.target.value)} />
          <input data-testid="admin-table-password-input" placeholder="테이블 비밀번호" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button data-testid="admin-table-save-button" disabled={mutationState === "submitting"} type="submit">저장</button>
        </form>
        {errorMessage ? <AdminStatusPanel title="테이블 처리 실패" message={errorMessage} actionLabel="다시 시도" onAction={() => void reload()} /> : null}
        <section className="admin-card-grid">
          {tables.map((table) => (
            <article className="admin-table-card" data-testid={`admin-table-row-${table.number}`} key={table.id}>
              <h2>{table.number}번 테이블</h2>
              <p>마지막 수정: {new Date(table.updatedAt).toLocaleString("ko-KR")}</p>
              <button className="secondary" data-testid={`admin-table-${table.id}-edit-button`} type="button" onClick={() => { setNumber(table.number); setPassword(table.password); }}>
                수정
              </button>
            </article>
          ))}
        </section>
        {state === "loading" ? <AdminStatusPanel title="테이블 목록을 불러오는 중입니다." /> : null}
      </section>
    </AdminShell>
  );
}
