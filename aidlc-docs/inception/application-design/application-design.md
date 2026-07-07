# 애플리케이션 설계

## 요약

테이블오더 MVP는 단일 Next.js App Router 애플리케이션으로 설계한다.

- 고객 UI는 `/customer` 아래에 둔다.
- 관리자 UI는 `/admin` 아래에 둔다.
- API route handler는 `/api/*` 아래에 둔다.
- 얇은 service layer를 사용한다.
- SQLite는 직접 SQL repository layer를 통해 접근한다.
- 관리자 SSE 업데이트는 in-memory event bus로 처리한다.
- localStorage는 테이블 설정과 장바구니 상태에만 사용한다.

## 주요 설계 결정

| 항목 | 결정 |
|---|---|
| Routing | Next.js App Router, `/customer`, `/admin`, `/api/*` |
| Persistence | SQLite를 authoritative data store로 사용 |
| Data access | repository 함수 뒤에 직접 SQL 캡슐화 |
| Service layer | 얇은 `route -> service -> repository` 구조 |
| Realtime | in-memory SSE event bus |
| Client storage | cart와 table setup에만 localStorage 사용 |
| Prototype scope | 작은 컴포넌트와 과도하지 않은 추상화 유지 |

## 주요 컴포넌트

상세 책임은 `components.md`를 참조한다.

- Customer Shell
- Table Setup View
- Menu Browser View
- Cart View
- Customer Order History View
- Admin Shell
- Admin Dashboard View
- Admin Order Detail View
- Admin Table Management View
- Admin History View
- Admin Menu Management View
- API Route Handlers
- Services
- Repositories
- SQLite Database
- Admin Event Bus
- Client Storage Utilities

## 서비스 개요

상세 정의는 `services.md`를 참조한다.

- `adminService`: 단순 관리자 로그인.
- `tableService`: 테이블 설정과 table session lifecycle.
- `menuService`: 메뉴 조회 및 메뉴 관리.
- `orderService`: 주문 생성, 대시보드 데이터, 상태 변경, 삭제.
- `historyService`: 완료된 session 이력 조회.
- `eventService`: SSE 구독과 broadcast.

## API 경계

Customer API:

- `/api/customer/table-session`
- `/api/customer/menus`
- `/api/customer/orders`

Admin API:

- `/api/admin/login`
- `/api/admin/dashboard`
- `/api/admin/events`
- `/api/admin/orders/:id/status`
- `/api/admin/orders/:id`
- `/api/admin/tables`
- `/api/admin/tables/:id/complete`
- `/api/admin/history`
- `/api/admin/menus`
- `/api/admin/menus/:id`
- `/api/admin/menus/reorder`

## 데이터 소유권

- SQLite는 store, table, session, menu, order, order item, history 조회에 필요한 persisted data를 소유한다.
- localStorage는 table context와 cart 같은 복구 가능한 브라우저 상태만 소유한다.
- 관리자 대시보드 상태는 API snapshot과 SSE event로부터 파생된다.

## 복원력 메모

- 주문 실패 시 cart는 성공 응답 전까지 local state로 유지되므로 유실되지 않는다.
- SSE는 브라우저 `EventSource` 재연결 동작을 활용한다.
- 대시보드는 live event 적용 전에 snapshot API를 먼저 호출할 수 있다.
- API는 구조화된 성공/실패 응답을 반환한다.
- in-memory event bus는 local prototype용이며, multi-instance production 배포에는 재설계가 필요하다.

## PBT 메모

Application Design은 컴포넌트 경계를 식별한다. cart total, order total, session transition, data transformation의 테스트 가능한 속성은 Functional Design에서 식별한다.

## 산출물 색인

- `components.md`
- `component-methods.md`
- `services.md`
- `component-dependency.md`
- `application-design.md`
