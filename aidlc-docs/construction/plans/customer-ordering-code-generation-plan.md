# Customer Ordering Code Generation 계획

## 계획 지위

이 문서는 Customer Ordering Module Code Generation의 단일 실행 기준이다. Part 2 Generation에서는 이 계획의 순서와 경로를 그대로 따른다.

## Unit Context

- **Unit**: Customer Ordering Module
- **Workspace Root**: `/Users/jhan/Desktop/test/ai-dlc/angular-study`
- **Project Type**: Greenfield monolith Next.js application
- **Application Code 위치**: workspace root의 `src/`
- **Documentation 위치**: `aidlc-docs/construction/customer-ordering/code/`
- **선행 완료 Unit**: Foundation and Data Module

## Story Traceability

| Story | 구현 범위 | Plan Steps |
|---|---|---|
| US-CUST-001 테이블 자동 로그인 | setup API, table context storage, route guard, setup page | Step 1, 2, 5, 7, 8 |
| US-CUST-002 카테고리별 메뉴 탐색 | menu API, menu hook, menu page/category UI | Step 2, 5, 8 |
| US-CUST-003 장바구니 관리 | cart domain service, cart storage, cart hook, cart UI, PBT | Step 3, 4, 5, 8 |
| US-CUST-004 주문 제출 | order draft mapper, order API, submit hook, success/failure UX | Step 2, 3, 5, 8 |
| US-CUST-005 현재 세션 주문 내역 조회 | session orders API, history hook, orders page | Step 2, 5, 8 |

## Dependencies and Interfaces

### Foundation Dependency

Customer Ordering은 다음 Foundation code를 재사용한다.

- `src/lib/types/domain.ts`
- `src/lib/api/response.ts`
- `src/lib/api/errors.ts`
- `src/server/repositories/store-repository.ts`
- `src/server/repositories/table-repository.ts`
- `src/server/repositories/session-repository.ts`
- `src/server/repositories/menu-repository.ts`
- `src/server/repositories/order-repository.ts`

### Expected API Contracts

| Endpoint | Method | 목적 |
|---|---|---|
| `/api/customer/setup` | POST | store code, table number, table password 검증 및 active session 반환 |
| `/api/customer/menu?storeId=...` | GET | category와 menu item 목록 반환 |
| `/api/customer/orders` | POST | current cart order 생성 |
| `/api/customer/orders/current?sessionId=...` | GET | 현재 session 주문 내역 반환 |

모든 API는 Foundation response helper 형태를 따른다.

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

## Database Entity Ownership

Customer Ordering Module은 새 database table을 소유하지 않는다. 기존 Foundation schema의 store, table, table_session, menu, order, order_item을 사용한다.

## Service Boundaries

| Boundary | 책임 |
|---|---|
| API Route Layer | HTTP request parsing, validation, repository orchestration, response wrapping |
| Customer API Client | browser fetch wrapper와 response mapping |
| Storage Adapter | table context/cart localStorage safe parse, schema guard, fallback |
| Cart Domain Service | pure cart calculation, order draft mapping |
| UI Hooks | storage, API client, domain service 조합 |
| Pages/Components | route별 rendering, touch-friendly interaction, loading/error/success state |

## Generation Steps

### Step 1: Shared Customer Types 생성

- [x] `src/features/customer/types.ts` 생성.
- [x] `TableContext`, `CartItem`, `CartState`, `OrderDraft`, `OrderDraftItem`, `SubmitResult`, `MenuCatalog`, `CustomerLoadState`, `CustomerClientError` type 정의.
- [x] Foundation domain type과 호환되도록 import/export 구성.
- [x] Story coverage: US-CUST-001~US-CUST-005.

### Step 2: Customer API Route Layer 생성

- [x] `src/app/api/customer/setup/route.ts` 생성.
- [x] `src/app/api/customer/menu/route.ts` 생성.
- [x] `src/app/api/customer/orders/route.ts` 생성.
- [x] `src/app/api/customer/orders/current/route.ts` 생성.
- [x] repository와 Foundation response helper를 사용.
- [x] setup 실패, menu 조회 실패, order validation 실패, history 조회 실패를 구조화된 실패 응답으로 반환.
- [x] table password는 localStorage에 저장되지 않도록 API response에서 제외.
- [x] Story coverage: US-CUST-001, US-CUST-002, US-CUST-004, US-CUST-005.

### Step 3: Cart Domain Service 및 Storage Adapter 생성

- [x] `src/features/cart/cart-service.ts` 생성.
- [x] `src/features/cart/cart-storage.ts` 생성.
- [x] `src/features/customer/table-context-storage.ts` 생성.
- [x] safe parse, schema guard, session scope check, empty fallback 구현.
- [x] cart add/increase/decrease/remove/clear/total/order draft mapper 구현.
- [x] Story coverage: US-CUST-001, US-CUST-003, US-CUST-004.

### Step 4: Business Logic Tests 및 PBT 생성

- [x] `src/features/cart/cart-service.test.ts` 생성.
- [x] `src/features/cart/cart-storage.test.ts` 생성.
- [x] `src/features/customer/customer-storage.test.ts` 생성.
- [x] Vitest example-based test 작성.
- [x] `fast-check` PBT 작성.
- [x] PBT 대상:
  - cart total equals sum of line totals.
  - quantity never becomes negative.
  - same menu item add merges quantity.
  - order draft total equals cart total.
  - localStorage serialization round-trip preserves cart meaning.
- [x] Story coverage: US-CUST-003, US-CUST-004.

### Step 5: Customer Client, Hooks, UI Components 생성

- [x] `src/features/customer/customer-api.ts` 생성.
- [x] `src/features/customer/customer-error-messages.ts` 생성.
- [x] `src/features/customer/use-table-context.ts` 생성.
- [x] `src/features/menu/use-menu-catalog.ts` 생성.
- [x] `src/features/cart/use-cart.ts` 생성.
- [x] `src/features/orders/use-order-submit.ts` 생성.
- [x] `src/features/orders/use-current-session-orders.ts` 생성.
- [x] `src/components/customer/customer-shell.tsx` 생성.
- [x] `src/components/customer/status-panel.tsx` 생성.
- [x] loading, failed, loaded, succeeded state를 명시.
- [x] interactive element에는 안정적인 `data-testid` 부여.
- [x] Story coverage: US-CUST-001~US-CUST-005.

### Step 6: Frontend Hook/Client Tests 생성

- [x] `src/features/customer/customer-api.test.ts` 생성.
- [x] `src/features/orders/order-submit.test.ts` 생성.
- [x] API client response mapping test 작성.
- [x] failed submit preservation example test 작성.
- [x] route guard/storage fallback behavior를 가능한 범위에서 unit test로 검증.
- [x] Story coverage: US-CUST-001, US-CUST-004, US-CUST-005.

### Step 7: Customer Route Pages 생성

- [x] `src/app/customer/setup/page.tsx` 생성.
- [x] `src/app/customer/menu/page.tsx` 생성.
- [x] `src/app/customer/cart/page.tsx` 생성.
- [x] `src/app/customer/orders/page.tsx` 생성.
- [x] 필요 시 `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` 생성 또는 수정.
- [x] 명시 route 구조 `/customer/setup`, `/customer/menu`, `/customer/cart`, `/customer/orders` 유지.
- [x] 44px 이상 touch target, loading/error/disabled/focus state 적용.
- [x] 주문 성공 시 5초 후 `/customer/menu` redirect timer 구현.
- [x] 모든 주요 버튼, 입력, 링크에 `data-testid` 부여.
- [x] Story coverage: US-CUST-001~US-CUST-005.

### Step 8: Integration Wiring 및 Story Completion 검증

- [x] API route와 UI hook의 type contract를 맞춘다.
- [x] cart failure preservation이 UI와 storage adapter에서 일관되게 동작하도록 확인한다.
- [x] current session order history가 session ID 기준으로만 조회되도록 확인한다.
- [x] Story Traceability 표의 US-CUST-001~US-CUST-005를 구현 완료로 표시한다.

### Step 9: Code Summary Documentation 생성

- [x] `aidlc-docs/construction/customer-ordering/code/code-summary.md` 생성.
- [x] 생성/수정한 application code 목록 기록.
- [x] story coverage, PBT coverage, resiliency implementation 요약.
- [x] Build and Test 단계에서 실행할 검증 명령 후보 기록.

## 예상 생성/수정 파일 요약

Application code:

- `src/app/api/customer/setup/route.ts`
- `src/app/api/customer/menu/route.ts`
- `src/app/api/customer/orders/route.ts`
- `src/app/api/customer/orders/current/route.ts`
- `src/app/customer/setup/page.tsx`
- `src/app/customer/menu/page.tsx`
- `src/app/customer/cart/page.tsx`
- `src/app/customer/orders/page.tsx`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/customer/customer-shell.tsx`
- `src/components/customer/status-panel.tsx`
- `src/features/customer/types.ts`
- `src/features/customer/customer-api.ts`
- `src/features/customer/customer-error-messages.ts`
- `src/features/customer/table-context-storage.ts`
- `src/features/customer/use-table-context.ts`
- `src/features/customer/customer-api.test.ts`
- `src/features/customer/customer-storage.test.ts`
- `src/features/menu/use-menu-catalog.ts`
- `src/features/cart/cart-service.ts`
- `src/features/cart/cart-storage.ts`
- `src/features/cart/use-cart.ts`
- `src/features/cart/cart-service.test.ts`
- `src/features/cart/cart-storage.test.ts`
- `src/features/orders/use-order-submit.ts`
- `src/features/orders/use-current-session-orders.ts`
- `src/features/orders/order-submit.test.ts`

Documentation:

- `aidlc-docs/construction/customer-ordering/code/code-summary.md`

## Scope Notes

- 새 database migration은 생성하지 않는다.
- 외부 runtime dependency는 추가하지 않는다.
- 테스트는 생성하지만 실제 실행은 Build and Test 단계에서 수행한다.
- Infrastructure Design은 현재 계획에서 local MVP 기준 skip 상태이다.

## Approval Gate

이 계획이 승인되면 Part 2 Generation에서 Step 1부터 Step 9까지 순서대로 실행하고, 각 단계 완료 즉시 체크박스를 `[x]`로 갱신한다.
