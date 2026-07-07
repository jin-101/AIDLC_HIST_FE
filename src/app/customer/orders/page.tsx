"use client";

import { CustomerShell } from "@/components/customer/customer-shell";
import { StatusPanel } from "@/components/customer/status-panel";
import { useCart } from "@/features/cart/use-cart";
import { useTableContext } from "@/features/customer/use-table-context";
import { useCurrentSessionOrders } from "@/features/orders/use-current-session-orders";

export default function CustomerOrdersPage() {
  const { context } = useTableContext();
  const { itemCount } = useCart(context);
  const { orders, state, errorMessage, reload } = useCurrentSessionOrders(context);

  if (!context) {
    return (
      <CustomerShell tableContext={null} cartCount={0}>
        <StatusPanel title="테이블 설정이 필요합니다." actionLabel="설정하러 가기" onAction={() => location.assign("/customer/setup")} />
      </CustomerShell>
    );
  }

  return (
    <CustomerShell tableContext={context} cartCount={itemCount}>
      <section className="stack">
        <h2>현재 세션 주문 내역</h2>
        {state === "loading" ? <StatusPanel title="주문 내역을 불러오는 중입니다." /> : null}
        {state === "failed" ? (
          <StatusPanel title="주문 내역 조회 실패" message={errorMessage} actionLabel="다시 시도" onAction={() => void reload()} />
        ) : null}
        {state === "loaded" && orders.length === 0 ? <StatusPanel title="아직 주문 내역이 없습니다." /> : null}
        {orders.map((order) => (
          <article className="order-card" data-testid={`order-history-${order.id}-card`} key={order.id}>
            <h3>{order.orderNumber}</h3>
            <p>상태: {order.status}</p>
            <p>주문 시각: {new Date(order.createdAt).toLocaleString("ko-KR")}</p>
            <ul>
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.menuName} x {item.quantity} - {item.lineTotal.toLocaleString()}원
                </li>
              ))}
            </ul>
            <p className="total">총액: {order.totalAmount.toLocaleString()}원</p>
          </article>
        ))}
      </section>
    </CustomerShell>
  );
}
