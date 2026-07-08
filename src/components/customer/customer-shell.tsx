"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { TableContext } from "@/features/customer/types";
import { clearCart } from "@/features/cart/cart-storage";
import { clearAdminSession } from "@/features/admin/admin-session-storage";
import { clearTableContext } from "@/features/customer/table-context-storage";

interface CustomerShellProps {
  tableContext: TableContext | null;
  cartCount: number;
  children: ReactNode;
}

export function CustomerShell({ tableContext, cartCount, children }: CustomerShellProps) {
  function clearRoleState(): void {
    clearCart();
    clearTableContext();
    clearAdminSession();
  }

  return (
    <main className="customer-shell">
      <header className="customer-header">
        <div>
          <p className="eyebrow">Table Order</p>
          <h1>{tableContext ? `${tableContext.tableNumber}번 테이블` : "테이블 설정"}</h1>
        </div>
        <nav className="customer-nav" aria-label="고객 메뉴">
          <Link data-testid="customer-nav-home-link" href="/" onClick={clearRoleState}>처음으로</Link>
          <Link data-testid="customer-nav-menu-link" href="/customer/menu">메뉴</Link>
          <Link data-testid="customer-nav-cart-link" href="/customer/cart">장바구니 {cartCount > 0 ? `(${cartCount})` : ""}</Link>
          <Link data-testid="customer-nav-orders-link" href="/customer/orders">주문내역</Link>
        </nav>
      </header>
      {children}
    </main>
  );
}
