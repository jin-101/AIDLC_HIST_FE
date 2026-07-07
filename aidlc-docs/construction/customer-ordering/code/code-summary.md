# Code Summary - Customer Ordering

## 범위

Customer Ordering Module의 고객 table tablet flow를 구현했다. 포함 범위는 table setup, menu catalog 조회, cart 관리, order submit, current session order history 조회이다.

## 생성한 Application Code

### API Routes

- `src/app/api/customer/setup/route.ts`
- `src/app/api/customer/menu/route.ts`
- `src/app/api/customer/orders/route.ts`
- `src/app/api/customer/orders/current/route.ts`

### Customer Pages and Styles

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/app/customer/setup/page.tsx`
- `src/app/customer/menu/page.tsx`
- `src/app/customer/cart/page.tsx`
- `src/app/customer/orders/page.tsx`

### Components

- `src/components/customer/customer-shell.tsx`
- `src/components/customer/status-panel.tsx`

### Customer Features

- `src/features/customer/types.ts`
- `src/features/customer/customer-api.ts`
- `src/features/customer/customer-error-messages.ts`
- `src/features/customer/table-context-storage.ts`
- `src/features/customer/use-table-context.ts`
- `src/features/menu/use-menu-catalog.ts`

### Cart and Order Features

- `src/features/cart/cart-service.ts`
- `src/features/cart/cart-storage.ts`
- `src/features/cart/use-cart.ts`
- `src/features/orders/use-order-submit.ts`
- `src/features/orders/use-current-session-orders.ts`

### Tests

- `src/features/cart/cart-service.test.ts`
- `src/features/cart/cart-storage.test.ts`
- `src/features/customer/customer-storage.test.ts`
- `src/features/customer/customer-api.test.ts`
- `src/features/orders/order-submit.test.ts`

### Project Support

- `next-env.d.ts`

## Story Coverage

| Story | 구현 상태 | 주요 파일 |
|---|---|---|
| US-CUST-001 테이블 자동 로그인 | 완료 | setup API, table context storage, setup page |
| US-CUST-002 카테고리별 메뉴 탐색 | 완료 | menu API, menu hook, menu page |
| US-CUST-003 장바구니 관리 | 완료 | cart service, cart storage, cart page, PBT |
| US-CUST-004 주문 제출 | 완료 | order API, order submit hook, cart page success/failure UX |
| US-CUST-005 현재 세션 주문 내역 조회 | 완료 | current orders API, orders hook, orders page |

## PBT Coverage

`fast-check` 기반 속성 테스트를 추가했다.

- cart total equals sum of line totals.
- quantity update never creates negative quantity.
- same menu item add merges quantity.
- order draft total equals cart total.
- localStorage serialization round-trip preserves cart meaning.

## Resiliency Implementation

- 주문 제출 실패 시 cart storage를 변경하지 않고 submit state만 failed로 전환한다.
- cart와 table context storage는 JSON parse 실패와 schema mismatch를 fallback으로 처리한다.
- cart storage는 session scope mismatch를 empty cart로 복구한다.
- menu/history API 실패는 빈 상태와 구분되는 failed state로 표시한다.
- 주문 성공 시 cart clear 후 성공 화면을 표시하고 5초 후 `/customer/menu`로 이동한다.

## Automation-Friendly UI

주요 interactive element에는 안정적인 `data-testid`를 추가했다.

- setup form input/submit.
- customer navigation links.
- menu category/item add buttons.
- cart quantity/remove/submit/clear buttons.
- order success panel and history cards.

## Verification Notes

이번 Code Generation 단계에서는 테스트 파일을 생성했지만 실행하지 않았다.

이유:

- 현재 workspace에 `node_modules`가 없어 `vitest`, `next`, TypeScript dependency가 설치되어 있지 않다.
- AI-DLC 계획상 실제 build/test 실행은 후속 Build and Test 단계에서 수행한다.

Build and Test 단계에서 실행할 후보 명령:

```bash
npm install
npm run test
npm run build
```

## Extension Compliance

### Property-Based Testing

- 준수. Customer Ordering의 cart reducer, storage round-trip, order draft mapping 속성을 PBT로 작성했다.

### Resiliency

- 준수. cart 보존, manual retry, safe storage fallback, API failure state separation을 코드에 반영했다.

### Security Baseline

- 비활성화 상태이므로 적용하지 않았다. 단, table password는 API setup 검증에만 사용하고 localStorage response에는 포함하지 않는다.
