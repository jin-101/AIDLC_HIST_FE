"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomerShell } from "@/components/customer/customer-shell";
import { StatusPanel } from "@/components/customer/status-panel";
import { useCart } from "@/features/cart/use-cart";
import { useTableContext } from "@/features/customer/use-table-context";
import { useOrderSubmit } from "@/features/orders/use-order-submit";

export default function CustomerCartPage() {
  const router = useRouter();
  const { context } = useTableContext();
  const { cart, itemCount, increase, decrease, remove, clear, setCart } = useCart(context);
  const { state, errorMessage, result, submit } = useOrderSubmit(context, cart, setCart);
  const [remaining, setRemaining] = useState(5);

  useEffect(() => {
    if (state !== "succeeded") return;
    setRemaining(5);
    const interval = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000);
    const timer = window.setTimeout(() => router.push("/customer/menu"), 5000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [router, state]);

  if (!context) {
    return (
      <CustomerShell tableContext={null} cartCount={0}>
        <StatusPanel title="테이블 설정이 필요합니다." actionLabel="설정하러 가기" onAction={() => location.assign("/customer/setup")} />
      </CustomerShell>
    );
  }

  if (state === "succeeded" && result) {
    return (
      <CustomerShell tableContext={context} cartCount={0}>
        <section className="status-panel success-panel" data-testid="order-success-panel">
          <h2>주문이 접수되었습니다.</h2>
          <p>주문 번호: {result.orderNumber}</p>
          <p>총액: {result.totalAmount.toLocaleString()}원</p>
          <p>{remaining}초 후 메뉴 화면으로 이동합니다.</p>
          <Link data-testid="order-success-menu-link" className="primary-link" href="/customer/menu">
            메뉴로 이동
          </Link>
        </section>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell tableContext={context} cartCount={itemCount}>
      <section className="stack">
        <h2>장바구니</h2>
        {!cart || cart.items.length === 0 ? <StatusPanel title="장바구니가 비어 있습니다." /> : null}
        {cart?.items.map((item) => (
          <article className="cart-row" data-testid={`cart-item-${item.menuItemId}-row`} key={item.menuItemId}>
            <div>
              <h3>{item.menuName}</h3>
              <p>{item.unitPrice.toLocaleString()}원 x {item.quantity}</p>
              <p className="price">{item.lineTotal.toLocaleString()}원</p>
            </div>
            <div className="quantity-controls">
              <button data-testid={`cart-item-${item.menuItemId}-decrease-button`} type="button" onClick={() => decrease(item.menuItemId)}>-</button>
              <button data-testid={`cart-item-${item.menuItemId}-increase-button`} type="button" onClick={() => increase(item.menuItemId)}>+</button>
              <button className="danger" data-testid={`cart-item-${item.menuItemId}-remove-button`} type="button" onClick={() => remove(item.menuItemId)}>
                삭제
              </button>
            </div>
          </article>
        ))}
        <section className="panel">
          <p className="total">총액: {(cart?.totalAmount ?? 0).toLocaleString()}원</p>
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          <div className="quantity-controls">
            <button
              data-testid="cart-submit-button"
              disabled={!cart || cart.items.length === 0 || state === "submitting"}
              type="button"
              onClick={() => void submit()}
            >
              {state === "submitting" ? "주문 중" : state === "failed" ? "다시 주문" : "주문하기"}
            </button>
            <button className="secondary" data-testid="cart-clear-button" disabled={!cart || cart.items.length === 0} type="button" onClick={clear}>
              비우기
            </button>
          </div>
        </section>
      </section>
    </CustomerShell>
  );
}
