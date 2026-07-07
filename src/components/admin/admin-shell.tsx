"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { AdminSession } from "@/features/admin/types";

interface AdminShellProps {
  session: AdminSession | null;
  children: ReactNode;
  onLogout?: () => void;
}

export function AdminShell({ session, children, onLogout }: AdminShellProps) {
  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>{session?.storeName ?? "관리자"}</h1>
        </div>
        <nav className="admin-nav" aria-label="관리자 메뉴">
          <Link data-testid="admin-nav-dashboard" href="/admin/dashboard">대시보드</Link>
          <Link data-testid="admin-nav-tables" href="/admin/tables">테이블</Link>
          <Link data-testid="admin-nav-menus" href="/admin/menus">메뉴</Link>
          <Link data-testid="admin-nav-history" href="/admin/history">이력</Link>
          {session ? <button className="secondary" data-testid="admin-logout-button" type="button" onClick={onLogout}>로그아웃</button> : null}
        </nav>
      </header>
      {children}
    </main>
  );
}
