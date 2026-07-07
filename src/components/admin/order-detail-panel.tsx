import type { OrderWithItems } from "@/lib/types/domain";
import { orderStatusLabel } from "@/features/admin/order-status-helper";

interface OrderDetailPanelProps {
  orders: OrderWithItems[];
}

export function OrderDetailPanel({ orders }: OrderDetailPanelProps) {
  return (
    <section className="stack" data-testid="admin-order-detail-panel">
      {orders.map((order) => (
        <article className="panel" key={order.id}>
          <div className="admin-card-heading">
            <h2>{order.orderNumber}</h2>
            <strong>{order.totalAmount.toLocaleString()}원</strong>
          </div>
          <p>{orderStatusLabel(order.status)} · {new Date(order.createdAt).toLocaleString("ko-KR")}</p>
          <ul className="admin-line-list">
            {order.items.map((item) => (
              <li key={item.id}>{item.menuName} x {item.quantity} · {item.lineTotal.toLocaleString()}원</li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
