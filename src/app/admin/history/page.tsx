"use client";

import { FormEvent, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { OrderDetailPanel } from "@/components/admin/order-detail-panel";
import { useAdminHistory } from "@/features/admin/use-admin-history";
import { useAdminSession } from "@/features/admin/use-admin-session";
import { useAdminTables } from "@/features/admin/use-admin-tables";

export default function AdminHistoryPage() {
  const { session, logout } = useAdminSession();
  const { tables } = useAdminTables(session?.storeId ?? null);
  const { orders, state, errorMessage, search } = useAdminHistory();
  const [tableId, setTableId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void search({ tableId, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
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
        <form className="admin-toolbar panel" data-testid="admin-history-form" onSubmit={submit}>
          <select data-testid="admin-history-table-select" value={tableId} onChange={(event) => setTableId(event.target.value)}>
            <option value="">테이블 선택</option>
            {tables.map((table) => (
              <option key={table.id} value={table.id}>{table.number}번</option>
            ))}
          </select>
          <input data-testid="admin-history-from-input" type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          <input data-testid="admin-history-to-input" type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          <button data-testid="admin-history-search-button" disabled={state === "loading"} type="submit">조회</button>
        </form>
        {errorMessage ? <AdminStatusPanel title="이력 조회 실패" message={errorMessage} /> : null}
        <OrderDetailPanel orders={orders} />
      </section>
    </AdminShell>
  );
}
