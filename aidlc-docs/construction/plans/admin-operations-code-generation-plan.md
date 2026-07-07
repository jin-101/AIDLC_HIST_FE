# Admin Operations Code Generation 계획

## 계획 지위

이 문서는 Admin Operations Module Code Generation의 단일 실행 기준이다. Part 2 Generation에서는 이 계획의 순서와 경로를 그대로 따른다.

## Unit Context

- **Unit**: Admin Operations Module
- **Workspace Root**: `/Users/jhan/Desktop/test/ai-dlc/angular-study`
- **Project Type**: Greenfield monolith Next.js application
- **Application Code 위치**: workspace root의 `src/`
- **Documentation 위치**: `aidlc-docs/construction/admin-operations/code/`
- **선행 완료 Unit**: Foundation and Data Module, Customer Ordering Module

## Story Traceability

| Story | 구현 범위 | Plan Steps |
|---|---|---|
| US-ADMIN-001 관리자 로그인 | admin login API, sessionStorage adapter, login page, route guard | Step 1, 2, 5, 7, 8 |
| US-ADMIN-002 실시간 주문 모니터링 | dashboard snapshot, table card grid, manual refresh, realtime boundary | Step 2, 3, 5, 7, 8 |
| US-ADMIN-003 주문 상세 확인 및 상태 변경 | order detail, status helper, status update API/action | Step 2, 3, 5, 7, 8 |
| US-ADMIN-004 테이블 세션 관리 | table list/upsert, table completion API/action | Step 2, 5, 7, 8 |
| US-ADMIN-005 주문 정정 | confirm 후 order delete, dashboard reload, recalculation helpers | Step 2, 3, 5, 7, 8 |
| US-ADMIN-006 과거 주문 조회 | history API, filter helper, history page | Step 2, 3, 5, 7, 8 |
| US-ADMIN-007 메뉴 관리 | menu admin API, validator/reorder helper, menu page/form/table | Step 2, 3, 5, 7, 8 |

## Dependencies and Interfaces

### Foundation Dependency

Admin Operations는 다음 Foundation code를 재사용한다.

- `src/lib/types/domain.ts`
- `src/lib/api/response.ts`
- `src/lib/api/errors.ts`
- `src/server/repositories/store-repository.ts`
- `src/server/repositories/admin-credential-repository.ts`
- `src/server/repositories/table-repository.ts`
- `src/server/repositories/session-repository.ts`
- `src/server/repositories/menu-repository.ts`
- `src/server/repositories/order-repository.ts`
- `src/server/repositories/history-repository.ts`

### Customer Ordering Dependency

- `src/app/globals.css`의 기본 app style을 확장 또는 재사용한다.
- `src/app/layout.tsx`는 이미 존재하므로 새로 만들지 않고 유지한다.

### Expected API Contracts

| Endpoint | Method | 목적 |
|---|---|---|
| `/api/admin/login` | POST | store code와 admin password 검증 후 AdminSession 반환 |
| `/api/admin/dashboard?storeId=...` | GET | table dashboard snapshot 반환 |
| `/api/admin/orders/status` | PATCH | order status 변경 |
| `/api/admin/orders` | DELETE | order 삭제 |
| `/api/admin/tables?storeId=...` | GET | table list 반환 |
| `/api/admin/tables` | POST | table number/password upsert |
| `/api/admin/tables/complete` | POST | active table session completion |
| `/api/admin/history?tableId=...&dateFrom=...&dateTo=...` | GET | completed session order history |
| `/api/admin/menus?storeId=...` | GET | category와 menu item 목록 반환 |
| `/api/admin/menus` | POST | menu item 생성 |
| `/api/admin/menus` | PATCH | menu item 수정 |
| `/api/admin/menus` | DELETE | menu item 삭제 |
| `/api/admin/menus/reorder` | PATCH | menu item 표시 순서 변경 |

모든 API는 Foundation response helper 형태를 따른다.

```ts
type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```

## Database Entity Ownership

Admin Operations Module은 새 database table을 소유하지 않는다. 기존 Foundation schema의 stores, admin_credentials, tables, table_sessions, menus, orders, order_items를 사용한다.

## Service Boundaries

| Boundary | 책임 |
|---|---|
| API Route Layer | HTTP request parsing, validation, repository orchestration, response wrapping |
| Admin API Client | browser fetch wrapper와 response mapping |
| Admin Session Adapter | sessionStorage safe parse, schema guard, fallback |
| Admin Pure Helpers | dashboard mapping, status calculation, history filter, menu validation/reorder |
| Admin UI Hooks | session, dashboard, order action, table action, history, menu state orchestration |
| Pages/Components | route별 rendering, compact dashboard, form/table UI, loading/error/mutation state |

## Generation Steps

### Step 1: Shared Admin Types 생성

- [x] `src/features/admin/types.ts` 생성.
- [x] `AdminSession`, `AdminDashboardSnapshot`, `AdminTableCard`, `AdminLoadState`, `AdminMutationState`, `AdminClientError`, `MenuFormDraft`, `AdminHistoryFilter`, `TableCompletionResult` type 정의.
- [x] Foundation domain type과 호환되도록 import/export 구성.
- [x] Story coverage: US-ADMIN-001~US-ADMIN-007.

### Step 2: Admin API Route Layer 생성

- [x] `src/app/api/admin/login/route.ts` 생성.
- [x] `src/app/api/admin/dashboard/route.ts` 생성.
- [x] `src/app/api/admin/orders/status/route.ts` 생성.
- [x] `src/app/api/admin/orders/route.ts` 생성.
- [x] `src/app/api/admin/tables/route.ts` 생성.
- [x] `src/app/api/admin/tables/complete/route.ts` 생성.
- [x] `src/app/api/admin/history/route.ts` 생성.
- [x] `src/app/api/admin/menus/route.ts` 생성.
- [x] `src/app/api/admin/menus/reorder/route.ts` 생성.
- [x] repository와 Foundation response helper를 사용.
- [x] login/dashboard/status/delete/table/history/menu 실패를 구조화된 실패 응답으로 반환.
- [x] admin password는 API 성공 응답과 sessionStorage 대상에서 제외.
- [x] Story coverage: US-ADMIN-001~US-ADMIN-007.

### Step 3: Admin Pure Helpers 및 Session Storage 생성

- [x] `src/features/admin/admin-session-storage.ts` 생성.
- [x] `src/features/admin/dashboard-mapper.ts` 생성.
- [x] `src/features/admin/order-status-helper.ts` 생성.
- [x] `src/features/admin/history-filter.ts` 생성.
- [x] `src/features/admin/menu-admin-helpers.ts` 생성.
- [x] sessionStorage safe parse, schema guard, clear/write/read 구현.
- [x] dashboard total/latest order/filter mapper 구현.
- [x] status helper, history filter validation, menu validation/reorder input validation 구현.
- [x] Story coverage: US-ADMIN-001~US-ADMIN-007.

### Step 4: Admin Helper Tests 및 PBT 생성

- [x] `src/features/admin/admin-session-storage.test.ts` 생성.
- [x] `src/features/admin/dashboard-mapper.test.ts` 생성.
- [x] `src/features/admin/order-status-helper.test.ts` 생성.
- [x] `src/features/admin/history-filter.test.ts` 생성.
- [x] `src/features/admin/menu-admin-helpers.test.ts` 생성.
- [x] Vitest example-based test 작성.
- [x] `fast-check` PBT 작성.
- [x] PBT 대상:
  - dashboard total equals active order total sum.
  - status helper returns allowed statuses only.
  - history date filter excludes out-of-range orders.
  - menu validator rejects invalid name/category/price.
  - reorder helper rejects duplicate IDs and preserves order.
- [x] Story coverage: US-ADMIN-002~US-ADMIN-007.

### Step 5: Admin Client, Hooks, UI Components 생성

- [x] `src/features/admin/admin-api.ts` 생성.
- [x] `src/features/admin/admin-error-messages.ts` 생성.
- [x] `src/features/admin/use-admin-session.ts` 생성.
- [x] `src/features/admin/use-admin-dashboard.ts` 생성.
- [x] `src/features/admin/use-admin-order-actions.ts` 생성.
- [x] `src/features/admin/use-admin-tables.ts` 생성.
- [x] `src/features/admin/use-admin-history.ts` 생성.
- [x] `src/features/admin/use-admin-menus.ts` 생성.
- [x] `src/components/admin/admin-shell.tsx` 생성.
- [x] `src/components/admin/admin-status-panel.tsx` 생성.
- [x] `src/components/admin/table-card-grid.tsx` 생성.
- [x] `src/components/admin/order-detail-panel.tsx` 생성.
- [x] `src/components/admin/menu-item-form.tsx` 생성.
- [x] load state와 mutation state를 분리.
- [x] interactive element에는 안정적인 `data-testid` 부여.
- [x] Story coverage: US-ADMIN-001~US-ADMIN-007.

### Step 6: Admin Client/Hook Tests 생성

- [x] `src/features/admin/admin-api.test.ts` 생성.
- [x] `src/features/admin/admin-actions.test.ts` 생성.
- [x] API client response mapping test 작성.
- [x] mutation failure preservation example test 작성.
- [x] session fallback behavior를 가능한 범위에서 unit test로 검증.
- [x] Story coverage: US-ADMIN-001, US-ADMIN-003, US-ADMIN-004, US-ADMIN-005.

### Step 7: Admin Route Pages 생성

- [x] `src/app/admin/login/page.tsx` 생성.
- [x] `src/app/admin/dashboard/page.tsx` 생성.
- [x] `src/app/admin/tables/page.tsx` 생성.
- [x] `src/app/admin/history/page.tsx` 생성.
- [x] `src/app/admin/menus/page.tsx` 생성.
- [x] 필요 시 `src/app/globals.css` 수정.
- [x] 명시 route 구조 `/admin/login`, `/admin/dashboard`, `/admin/tables`, `/admin/history`, `/admin/menus` 유지.
- [x] compact dashboard, 44px 이상 주요 조작 target, loading/error/disabled/focus state 적용.
- [x] destructive action은 confirm 후 실행.
- [x] 모든 주요 버튼, 입력, 링크에 `data-testid` 부여.
- [x] Story coverage: US-ADMIN-001~US-ADMIN-007.

### Step 8: Integration Wiring 및 Story Completion 검증

- [x] API route와 UI hook의 type contract를 맞춘다.
- [x] mutation failure preservation이 UI와 hook state에서 일관되게 동작하도록 확인한다.
- [x] dashboard snapshot reload boundary가 Realtime Event Module과 충돌하지 않도록 확인한다.
- [x] history는 completed session order만 조회하도록 확인한다.
- [x] menu category는 기존 category 선택만 허용하도록 확인한다.
- [x] Story Traceability 표의 US-ADMIN-001~US-ADMIN-007을 구현 완료로 표시한다.

### Step 9: Style Integration 정리

- [x] `src/app/globals.css`에 admin layout, dashboard card, table/form/list style을 추가한다.
- [x] 기존 customer style과 충돌하지 않도록 class prefix 또는 semantic class를 사용한다.
- [x] compact dashboard와 44px target 기준을 반영한다.

### Step 10: Code Summary Documentation 생성

- [x] `aidlc-docs/construction/admin-operations/code/code-summary.md` 생성.
- [x] 생성/수정한 application code 목록 기록.
- [x] story coverage, PBT coverage, resiliency implementation 요약.
- [x] Build and Test 단계에서 실행할 검증 명령 후보 기록.

## 예상 생성/수정 파일 요약

Application code:

- `src/app/api/admin/login/route.ts`
- `src/app/api/admin/dashboard/route.ts`
- `src/app/api/admin/orders/status/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/api/admin/tables/route.ts`
- `src/app/api/admin/tables/complete/route.ts`
- `src/app/api/admin/history/route.ts`
- `src/app/api/admin/menus/route.ts`
- `src/app/api/admin/menus/reorder/route.ts`
- `src/app/admin/login/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/tables/page.tsx`
- `src/app/admin/history/page.tsx`
- `src/app/admin/menus/page.tsx`
- `src/app/globals.css`
- `src/components/admin/admin-shell.tsx`
- `src/components/admin/admin-status-panel.tsx`
- `src/components/admin/table-card-grid.tsx`
- `src/components/admin/order-detail-panel.tsx`
- `src/components/admin/menu-item-form.tsx`
- `src/features/admin/types.ts`
- `src/features/admin/admin-api.ts`
- `src/features/admin/admin-error-messages.ts`
- `src/features/admin/admin-session-storage.ts`
- `src/features/admin/dashboard-mapper.ts`
- `src/features/admin/order-status-helper.ts`
- `src/features/admin/history-filter.ts`
- `src/features/admin/menu-admin-helpers.ts`
- `src/features/admin/use-admin-session.ts`
- `src/features/admin/use-admin-dashboard.ts`
- `src/features/admin/use-admin-order-actions.ts`
- `src/features/admin/use-admin-tables.ts`
- `src/features/admin/use-admin-history.ts`
- `src/features/admin/use-admin-menus.ts`
- `src/features/admin/admin-session-storage.test.ts`
- `src/features/admin/dashboard-mapper.test.ts`
- `src/features/admin/order-status-helper.test.ts`
- `src/features/admin/history-filter.test.ts`
- `src/features/admin/menu-admin-helpers.test.ts`
- `src/features/admin/admin-api.test.ts`
- `src/features/admin/admin-actions.test.ts`

Documentation:

- `aidlc-docs/construction/admin-operations/code/code-summary.md`

## Scope Notes

- 새 database migration은 생성하지 않는다.
- 외부 runtime dependency는 추가하지 않는다.
- Realtime Event Module 전이므로 SSE subscription은 구현하지 않는다.
- 테스트는 생성하지만 실제 실행은 Build and Test 단계에서 수행한다.
- Infrastructure Design은 현재 계획에서 local MVP 기준 skip 상태이다.

## Approval Gate

이 계획이 승인되면 Part 2 Generation에서 Step 1부터 Step 10까지 순서대로 실행하고, 각 단계 완료 즉시 체크박스를 `[x]`로 갱신한다.
