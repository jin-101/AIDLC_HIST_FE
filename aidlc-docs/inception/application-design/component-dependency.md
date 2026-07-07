# 컴포넌트 의존성

## 의존성 매트릭스

| 컴포넌트 | 의존 대상 | 메모 |
|---|---|---|
| Customer Shell | Client Storage Utilities, Customer API routes | 브라우저 상태와 API 호출. |
| Table Setup View | Customer table session API, Client Storage Utilities | 성공한 table context를 로컬 저장. |
| Menu Browser View | Customer menu API, Cart utilities | 메뉴 조회와 cart 갱신. |
| Cart View | Cart utilities, Customer order API | 주문 확정 시에만 제출. |
| Customer Order History View | Customer order history API | active session context 사용. |
| Admin Shell | Admin login API | 단순 admin session state 유지. |
| Admin Dashboard View | Admin dashboard API, Admin SSE API | snapshot 후 live event 적용. |
| Admin Order Detail View | Admin order APIs | 주문 상태 변경과 삭제. |
| Admin Table Management View | Admin table APIs | table setup과 completion. |
| Admin History View | Admin history API | table/date filter 조회. |
| Admin Menu Management View | Admin menu APIs | CRUD와 reorder. |
| API Route Handlers | Services | request/response 경계. |
| Services | Repositories, Event Service | workflow orchestration. |
| Repositories | SQLite Database | 직접 SQL. |
| Event Service | In-memory client registry | admin event broadcast. |

## 통신 패턴

### 고객 주문 생성 흐름

1. 고객이 browser localStorage의 cart를 편집한다.
2. 고객이 주문을 확정한다.
3. Cart View가 `/api/customer/orders`를 호출한다.
4. Order route가 `orderService.createOrder`를 호출한다.
5. `orderService`는 active session을 보장하고 `orderRepository`로 주문을 저장한다.
6. `orderService`는 `eventService`로 `order-created`를 발행한다.
7. 관리자 dashboard는 SSE event를 수신한다.
8. 고객은 주문 번호를 받고 cart는 비워지며 5초 후 메뉴 화면으로 이동한다.

### 관리자 대시보드 실시간 흐름

1. 관리자 dashboard가 `/api/admin/dashboard` snapshot을 조회한다.
2. dashboard가 `/api/admin/events`에 `EventSource`를 연다.
3. 변경 service가 성공적인 DB 변경 후 event를 publish한다.
4. event service가 연결된 client에 broadcast한다.
5. dashboard가 event를 view state에 적용한다.
6. 일시적인 SSE disconnect는 브라우저 재연결 동작을 활용한다.

### 테이블 완료 흐름

1. 관리자가 table completion을 확인한다.
2. Admin UI가 `/api/admin/tables/:id/complete`를 호출한다.
3. route가 `tableService.completeTableUsage`를 호출한다.
4. service가 active session을 완료 처리한다.
5. dashboard는 table total과 current orders를 갱신한다.

## 결합도 규칙

- UI component는 repository를 직접 import하지 않는다.
- API route handler는 SQL을 직접 실행하지 않는다.
- repository는 event를 publish하지 않는다.
- service는 persistence 성공 후에만 event를 publish한다.
- localStorage는 client utility에서만 사용한다.
- SQLite는 menu, order, session, history persisted data의 source of truth이다.

## 설계 제약

- in-memory event bus는 local prototype에 적합하다.
- 여러 server instance로 배포할 경우 SSE event distribution을 재설계해야 한다.
- 직접 SQL repository는 prototype을 가볍게 유지하지만 future ORM migration을 위해 격리한다.
