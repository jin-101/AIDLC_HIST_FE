"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CustomerShell } from "@/components/customer/customer-shell";
import { StatusPanel } from "@/components/customer/status-panel";
import { useCart } from "@/features/cart/use-cart";
import { useTableContext } from "@/features/customer/use-table-context";
import { useMenuCatalog } from "@/features/menu/use-menu-catalog";

export default function CustomerMenuPage() {
  const { context } = useTableContext();
  const { cart, itemCount, add } = useCart(context);
  const { catalog, state, errorMessage, reload } = useMenuCatalog(context?.storeId ?? null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const activeCategory = activeCategoryId ?? catalog.categories[0]?.id ?? null;
  const items = useMemo(
    () => catalog.items.filter((item) => !activeCategory || item.categoryId === activeCategory),
    [activeCategory, catalog.items]
  );

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
        <div className="category-tabs" aria-label="메뉴 카테고리">
          {catalog.categories.map((category) => (
            <button
              className={category.id === activeCategory ? "active" : ""}
              data-testid={`menu-category-${category.displayOrder}-button`}
              key={category.id}
              type="button"
              onClick={() => setActiveCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {state === "loading" ? <StatusPanel title="메뉴를 불러오는 중입니다." /> : null}
        {state === "failed" ? (
          <StatusPanel title="메뉴 조회 실패" message={errorMessage} actionLabel="다시 시도" onAction={() => void reload()} />
        ) : null}
        <div className="grid">
          {items.map((item) => {
            const quantity = cart?.items.find((cartItem) => cartItem.menuItemId === item.id)?.quantity ?? 0;
            return (
              <article className="menu-card" data-testid={`menu-item-${item.id}-card`} key={item.id}>
                <div>
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <p className="price">{item.price.toLocaleString()}원</p>
                  {quantity > 0 ? <p>장바구니 {quantity}개</p> : null}
                </div>
                <button data-testid={`menu-item-${item.id}-add-button`} type="button" onClick={() => add(item)}>
                  담기
                </button>
              </article>
            );
          })}
        </div>
        <Link data-testid="menu-cart-link" className="primary-link" href="/customer/cart">
          장바구니 확인
        </Link>
      </section>
    </CustomerShell>
  );
}
