import type { AdminTableCard } from "@/features/admin/types";
import { nextRecommendedStatus, orderStatusLabel } from "@/features/admin/order-status-helper";

interface TableCardGridProps {
  cards: AdminTableCard[];
  onStatusChange: (orderId: string, status: NonNullable<ReturnType<typeof nextRecommendedStatus>>) => void;
  onDeleteOrder: (orderId: string) => void;
  onCompleteTable: (tableId: string) => void;
  highlightedTableIds?: string[];
  disabled?: boolean;
}

export function TableCardGrid({ cards, onStatusChange, onDeleteOrder, onCompleteTable, highlightedTableIds = [], disabled }: TableCardGridProps) {
  return (
    <section className="admin-card-grid" data-testid="admin-table-card-grid">
      {cards.map((card) => {
        const highlighted = highlightedTableIds.includes(card.tableId);
        return (
          <article
            className={`admin-table-card${highlighted ? " admin-table-card-highlighted" : ""}`}
            data-highlighted={highlighted ? "true" : "false"}
            data-testid={`admin-table-${card.tableNumber}-card`}
            key={card.tableId}
          >
            <div className="admin-card-heading">
              <h2>{card.tableNumber}번 테이블</h2>
              <strong>{card.totalAmount.toLocaleString()}원</strong>
            </div>
            <p>{card.activeSessionId ? "이용 중" : "비어 있음"}</p>
            <div className="stack">
              {card.orders.map((order) => {
                const next = nextRecommendedStatus(order.status);
                return (
                  <div className="admin-order-row" key={order.id}>
                    <div>
                      <strong>{order.orderNumber}</strong>
                      <p>{orderStatusLabel(order.status)} · {order.totalAmount.toLocaleString()}원</p>
                    </div>
                    <div className="admin-row-actions">
                      {next ? (
                        <button data-testid={`admin-order-${order.id}-next-button`} disabled={disabled} type="button" onClick={() => onStatusChange(order.id, next)}>
                          {orderStatusLabel(next)}
                        </button>
                      ) : null}
                      <button className="danger" data-testid={`admin-order-${order.id}-delete-button`} disabled={disabled} type="button" onClick={() => onDeleteOrder(order.id)}>
                        삭제
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="secondary" data-testid={`admin-table-${card.tableId}-complete-button`} disabled={disabled || !card.activeSessionId} type="button" onClick={() => onCompleteTable(card.tableId)}>
              테이블 완료
            </button>
          </article>
        );
      })}
    </section>
  );
}
