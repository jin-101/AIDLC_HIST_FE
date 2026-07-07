"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { TableCardGrid } from "@/components/admin/table-card-grid";
import { completeAdminTable } from "@/features/admin/admin-api";
import { adminErrorMessage } from "@/features/admin/admin-error-messages";
import { filterTableCards } from "@/features/admin/dashboard-mapper";
import { useAdminDashboard } from "@/features/admin/use-admin-dashboard";
import { useAdminOrderActions } from "@/features/admin/use-admin-order-actions";
import { useAdminSession } from "@/features/admin/use-admin-session";

export default function AdminDashboardPage() {
  const { session, logout } = useAdminSession();
  const { snapshot, state, errorMessage, reload } = useAdminDashboard(session?.storeId ?? null);
  const [filterText, setFilterText] = useState("");
  const [tableError, setTableError] = useState<string | null>(null);
  const [tableSubmitting, setTableSubmitting] = useState(false);
  const actions = useAdminOrderActions(reload);

  const cards = useMemo(() => filterTableCards(snapshot?.tables ?? [], filterText), [filterText, snapshot]);

  async function completeTable(tableId: string) {
    if (!window.confirm("이 테이블을 완료 처리할까요?")) return;
    setTableSubmitting(true);
    setTableError(null);
    try {
      await completeAdminTable(tableId);
      await reload();
    } catch (error) {
      setTableError(adminErrorMessage(error, "테이블을 완료하지 못했습니다."));
    } finally {
      setTableSubmitting(false);
    }
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
        <div className="admin-toolbar">
          <input data-testid="admin-dashboard-filter-input" placeholder="테이블 번호 검색" value={filterText} onChange={(event) => setFilterText(event.target.value)} />
          <button data-testid="admin-dashboard-reload-button" disabled={state === "loading"} type="button" onClick={() => void reload()}>
            새로고침
          </button>
          <Link className="primary-link" data-testid="admin-dashboard-table-link" href="/admin/tables">테이블 관리</Link>
        </div>
        {state === "loading" ? <AdminStatusPanel title="대시보드를 불러오는 중입니다." /> : null}
        {state === "failed" ? <AdminStatusPanel title="대시보드 조회 실패" message={errorMessage} actionLabel="다시 시도" onAction={() => void reload()} /> : null}
        {actions.errorMessage || tableError ? <AdminStatusPanel title="처리 실패" message={actions.errorMessage ?? tableError} /> : null}
        <TableCardGrid
          cards={cards}
          disabled={actions.state === "submitting" || tableSubmitting}
          onCompleteTable={(tableId) => void completeTable(tableId)}
          onDeleteOrder={(orderId) => void actions.removeOrder(orderId)}
          onStatusChange={(orderId, status) => void actions.changeStatus(orderId, status)}
        />
      </section>
    </AdminShell>
  );
}
