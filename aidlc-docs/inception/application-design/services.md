# 서비스

## 서비스 계층 스타일

MVP는 얇은 service layer를 사용한다.

1. API route handler가 요청 형태를 검증한다.
2. service가 workflow를 조율하고 repository를 호출한다.
3. repository가 직접 SQLite query를 실행한다.
4. service는 domain result를 route handler에 반환한다.
5. route handler는 구조화된 JSON 또는 SSE 응답을 반환한다.

## `adminService`

- **책임**: 프로토타입용 단순 관리자 인증.
- **협력 대상**: `storeRepository`
- **메모**: 복잡한 보안은 MVP에서 제외하며, Security Baseline은 비활성화되어 있다.

## `tableService`

- **책임**: 테이블 설정, table context, active session lifecycle, table completion.
- **협력 대상**:
  - `storeRepository`
  - `tableRepository`
  - `sessionRepository`
  - `orderRepository`
  - `historyRepository`
  - `eventService`
- **패턴**:
  - 고객 setup은 store/table credential을 검증하고 table context를 반환한다.
  - 첫 주문 시 active session을 보장한다.
  - table completion은 active session을 완료 처리하고 `table-completed` event를 발행한다.

## `menuService`

- **책임**: 고객 메뉴 조회와 관리자 메뉴 CRUD.
- **협력 대상**: `menuRepository`
- **패턴**:
  - 고객 조회는 category별 menu data를 반환한다.
  - 관리자 변경은 기본 field 검증 후 repository write를 수행한다.

## `orderService`

- **책임**: 주문 생성, 현재 session 주문 조회, dashboard snapshot, 주문 상태 변경, 주문 삭제.
- **협력 대상**:
  - `tableService`
  - `orderRepository`
  - `sessionRepository`
  - `eventService`
- **패턴**:
  - 주문 생성은 order와 order item을 하나의 transaction으로 저장한다.
  - 주문 생성 후 `order-created` event를 발행한다.
  - 상태 변경 후 `order-updated` event를 발행한다.
  - 삭제 후 `order-deleted` event를 발행한다.

## `historyService`

- **책임**: 과거 주문 조회.
- **협력 대상**: `historyRepository`
- **패턴**: 선택적 날짜 필터를 적용하고 완료된 session/order 요약을 반환한다.

## `eventService`

- **책임**: in-memory SSE client registry와 event broadcast.
- **협력 대상**:
  - `/api/admin/events` route handler
  - 주문/테이블 변경을 수행하는 service
- **패턴**:
  - SSE route가 연결 시 subscribe한다.
  - 변경 service는 persistence 성공 후 event를 publish한다.
  - client 재연결은 브라우저 `EventSource`가 담당하고, dashboard는 초기 snapshot API를 함께 사용한다.

## Error Response Pattern

모든 JSON API는 다음 형태를 사용한다.

```ts
type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };
```

정확한 error code는 Functional Design과 Code Generation에서 구체화한다.
