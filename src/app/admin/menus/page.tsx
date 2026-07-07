"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/types/domain";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminStatusPanel } from "@/components/admin/admin-status-panel";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { moveId } from "@/features/admin/menu-admin-helpers";
import { useAdminMenus } from "@/features/admin/use-admin-menus";
import { useAdminSession } from "@/features/admin/use-admin-session";

export default function AdminMenusPage() {
  const { session, logout } = useAdminSession();
  const { categories, items, state, mutationState, errorMessage, saveItem, deleteItem, reorderItems } = useAdminMenus(session?.storeId ?? null);
  const [editing, setEditing] = useState<MenuItem | null>(null);

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
        <section className="panel">
          <h2>{editing ? "메뉴 수정" : "메뉴 추가"}</h2>
          <MenuItemForm
            categories={categories}
            disabled={mutationState === "submitting"}
            item={editing}
            onSubmit={(draft) => {
              void saveItem(draft);
              setEditing(null);
            }}
          />
        </section>
        {state === "loading" ? <AdminStatusPanel title="메뉴를 불러오는 중입니다." /> : null}
        {errorMessage ? <AdminStatusPanel title="메뉴 처리 실패" message={errorMessage} /> : null}
        <section className="stack" data-testid="admin-menu-list">
          {items.map((item) => (
            <article className="admin-order-row panel" data-testid={`admin-menu-${item.id}-row`} key={item.id}>
              <div>
                <h2>{item.name}</h2>
                <p>{item.price.toLocaleString()}원 · 순서 {item.displayOrder}</p>
              </div>
              <div className="admin-row-actions">
                <button className="secondary" data-testid={`admin-menu-${item.id}-up-button`} type="button" onClick={() => void reorderItems(moveId(items.map((menu) => menu.id), item.id, "up"))}>위</button>
                <button className="secondary" data-testid={`admin-menu-${item.id}-down-button`} type="button" onClick={() => void reorderItems(moveId(items.map((menu) => menu.id), item.id, "down"))}>아래</button>
                <button data-testid={`admin-menu-${item.id}-edit-button`} type="button" onClick={() => setEditing(item)}>수정</button>
                <button className="danger" data-testid={`admin-menu-${item.id}-delete-button`} type="button" onClick={() => window.confirm("이 메뉴를 삭제할까요?") && void deleteItem(item.id)}>삭제</button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </AdminShell>
  );
}
