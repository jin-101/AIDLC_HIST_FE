# 논리 컴포넌트 - Admin Operations NFR Design

## 개요

Admin Operations Module은 관리자 UI page component와 테스트 가능한 client/server helper를 분리한다. 논리 컴포넌트는 Next.js/React 안에서 구현되며, 별도 외부 runtime dependency를 추가하지 않는다.

## 컴포넌트 목록

| 컴포넌트 | 책임 |
|---|---|
| Admin Route Pages | `/admin/login`, `/admin/dashboard`, `/admin/tables`, `/admin/history`, `/admin/menus` 화면 제공 |
| Admin Route Guard | sessionStorage AdminSession 검증과 login redirect |
| Admin Session Storage Adapter | AdminSession safe parse/write/clear |
| Admin API Client | admin API 호출과 response mapping |
| Dashboard Mapper | TableDashboard를 AdminTableCard/Snapshot으로 변환 |
| Admin Status Helper | next status와 allowed status 계산 |
| Admin Mutation Orchestrator | mutation state, confirm, scoped reload 조율 |
| History Filter Helper | date range와 table filter validation/적용 |
| Menu Validator/Reorder Helper | menu form validation과 reorder input 검증 |
| Admin UI Hooks | API client, storage, helper를 조합해 page state 제공 |
| Admin Shell Components | compact navigation, status panel, dashboard cards, forms |

## 상세 컴포넌트

### Admin Route Pages

예상 위치:

- `src/app/admin/login/page.tsx`
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/tables/page.tsx`
- `src/app/admin/history/page.tsx`
- `src/app/admin/menus/page.tsx`

책임:

- route별 화면 composition.
- hook에서 받은 state와 action을 UI component에 전달.
- loading, empty, failed, submitting 상태 표시.
- 직접 sessionStorage parse나 raw fetch를 수행하지 않는다.

### Admin Route Guard

예상 위치:

- `src/features/admin/admin-route-guard.tsx`
- 또는 route별 hook 내부 guard

책임:

- AdminSession 존재 여부 확인.
- schema mismatch 또는 parse 실패 시 session clear.
- session이 없으면 `/admin/login`으로 이동.
- session이 있으면 child 화면 render.

### Admin Session Storage Adapter

예상 위치:

- `src/features/admin/admin-session-storage.ts`

책임:

- `table-order:admin:session` key 관리.
- admin password 저장 방지.
- safe parse와 schema guard.
- invalid session fallback.

주요 함수:

- `readAdminSession(): AdminSession | null`
- `writeAdminSession(session: AdminSession): void`
- `clearAdminSession(): void`
- `isAdminSession(value: unknown): value is AdminSession`

Resiliency:

- storage 접근 실패, JSON parse 실패, schema mismatch를 null로 fallback한다.

### Admin API Client

예상 위치:

- `src/features/admin/admin-api.ts`

책임:

- raw fetch 호출을 캡슐화.
- Foundation API response shape를 해석.
- 실패를 typed admin client error로 변환.

주요 함수:

- `loginAdmin(input): Promise<AdminSession>`
- `fetchDashboard(storeId): Promise<TableDashboard[]>`
- `updateOrderStatus(input): Promise<Order>`
- `deleteOrder(orderId): Promise<void>`
- `upsertTable(input): Promise<Table>`
- `completeTable(tableId): Promise<TableCompletionResult>`
- `fetchHistory(filter): Promise<OrderWithItems[]>`
- `fetchAdminMenus(storeId): Promise<{ categories, items }>`
- `createMenuItem(input): Promise<MenuItem>`
- `updateMenuItem(input): Promise<MenuItem>`
- `deleteMenuItem(menuItemId): Promise<void>`
- `reorderMenuItems(orderedIds): Promise<MenuItem[]>`

### Dashboard Mapper

예상 위치:

- `src/features/admin/dashboard-mapper.ts`

책임:

- Foundation `TableDashboard[]`를 admin snapshot/view model로 변환.
- active session 없는 table과 completed session order를 current state에서 제외.
- totalAmount와 latestOrder를 계산.
- client-side table filter를 제공.

PBT:

- totalAmount는 orders totalAmount 합과 같다.
- activeSession이 null이면 orders가 empty이다.
- latestOrder는 createdAt 기준 최신 order이다.

### Admin Status Helper

예상 위치:

- `src/features/admin/order-status-helper.ts`

책임:

- allowed status 목록 반환.
- 기본 next recommended status 계산.
- status label 변환.

PBT:

- 반환 status는 항상 `waiting`, `preparing`, `completed` 중 하나이다.
- next recommended status는 allowed status 안에 있거나 null이다.

### Admin Mutation Orchestrator

예상 위치:

- `src/features/admin/use-admin-order-actions.ts`
- `src/features/admin/use-admin-tables.ts`
- `src/features/admin/use-admin-menus.ts`

책임:

- confirm 후 mutation 실행.
- submitting/failed/succeeded state 관리.
- 성공 후 scoped reload callback 호출.
- 실패 시 기존 data/form state 보존.

Resiliency:

- optimistic update를 사용하지 않는다.
- 실패 시 mutation error만 갱신한다.
- reload 실패와 mutation 실패를 구분한다.

### History Filter Helper

예상 위치:

- `src/features/admin/history-filter.ts`

책임:

- tableId 필수 검증.
- dateFrom/dateTo 형식 검증.
- client-side test용 filter predicate 제공.

PBT:

- date range 밖 order는 제외된다.
- dateFrom이 dateTo보다 늦으면 invalid filter이다.

### Menu Validator/Reorder Helper

예상 위치:

- `src/features/admin/menu-admin-helpers.ts`

책임:

- menu form draft validation.
- positive integer price 검증.
- categoryId 필수 검증.
- orderedIds 중복 검증.
- reorder display order mapping 지원.

PBT:

- invalid price/name/category는 invalid result를 반환한다.
- orderedIds는 중복 없이 순서를 보존한다.

### Admin UI Hooks

예상 위치:

- `src/features/admin/use-admin-session.ts`
- `src/features/admin/use-admin-dashboard.ts`
- `src/features/admin/use-admin-history.ts`
- `src/features/admin/use-admin-menus.ts`

책임:

- storage adapter, API client, pure helper를 조합한다.
- page component에 상태와 action을 제공한다.
- load state와 mutation state를 분리한다.

### Admin Shell Components

예상 위치:

- `src/components/admin/admin-shell.tsx`
- `src/components/admin/admin-status-panel.tsx`
- `src/components/admin/table-card-grid.tsx`
- `src/components/admin/order-detail-panel.tsx`
- `src/components/admin/menu-item-form.tsx`

책임:

- compact layout과 navigation 제공.
- 주요 조작 target 44px 이상 확보.
- loading/error/disabled/focus 상태를 시각적으로 구분.
- stable `data-testid` 제공.

## 컴포넌트 상호작용

### Dashboard Flow

1. Admin Route Guard가 AdminSession을 확인한다.
2. `useAdminDashboard`가 Admin API Client로 snapshot을 조회한다.
3. Dashboard Mapper가 AdminDashboardSnapshot을 만든다.
4. table filter는 client-side helper로 적용된다.
5. 관리자가 mutation을 실행하면 Admin Mutation Orchestrator가 서버 요청을 보낸다.
6. 성공 시 dashboard snapshot을 재조회한다.
7. 실패 시 기존 snapshot을 유지하고 오류를 표시한다.

### Tables Flow

1. Admin Route Guard가 AdminSession을 확인한다.
2. `useAdminTables`가 table list를 조회한다.
3. table upsert는 성공 후 table list를 재조회한다.
4. table completion은 confirm 후 실행한다.
5. completion 성공 후 dashboard 또는 table list를 scoped reload한다.

### History Flow

1. Admin Route Guard가 AdminSession을 확인한다.
2. History Filter Helper가 filter를 검증한다.
3. `useAdminHistory`가 history API를 호출한다.
4. 실패 시 기존 filter와 화면 state를 유지한다.

### Menu Flow

1. `useAdminMenus`가 category와 menu item 목록을 조회한다.
2. Menu Validator가 form draft를 검증한다.
3. mutation 성공 후 menu list를 재조회한다.
4. mutation 실패 시 form draft와 기존 list를 유지한다.

## NFR 추적성

| NFR | 컴포넌트 대응 |
|---|---|
| dashboard/mutation 500ms 목표 | API client 경계, scoped reload, compact snapshot mapper |
| mutation 실패 state 보존 | Admin Mutation Orchestrator, separated mutation state |
| 수동 새로고침과 성공 후 재조회 | useAdminDashboard, scoped reload callbacks |
| sessionStorage fallback | Admin Session Storage Adapter, Admin Route Guard |
| compact dashboard와 44px target | Admin Shell Components |
| PBT 가능성 | Dashboard Mapper, Status Helper, History Filter, Menu Helper |
| Realtime 경계 | Snapshot First Realtime Extension Pattern |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. 테스트 가능한 pure helper와 mapper 경계를 명시했다.
- **Resiliency**: 준수. mutation 실패 격리, scoped reload, safe session fallback, realtime boundary를 논리 컴포넌트에 매핑했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
