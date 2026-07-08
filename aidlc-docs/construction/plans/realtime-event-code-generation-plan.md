# Realtime Event Code Generation 계획

## 목적

Realtime Event Module의 SSE event bus, admin SSE endpoint, event publication, dashboard client subscription, tests, style, code summary를 생성한다.

이 계획은 Realtime Event Code Generation Part 2의 단일 실행 기준이다. 승인 후에는 Step 1부터 Step 10까지 순서대로 실행하고, 각 단계 완료 즉시 체크박스를 `[x]`로 갱신한다.

## Unit Context

- **Unit**: Realtime Event Module
- **Workspace Root**: `/Users/jhan/Desktop/test/ai-dlc/angular-study`
- **프로젝트 유형**: Greenfield multi-unit monolith
- **Application code 위치**: workspace root의 `src/`
- **Documentation 위치**: `aidlc-docs/construction/realtime-event/code/`

## Dependencies

### Upstream 구현 의존성

- Foundation and Data Module
  - `src/lib/types/domain.ts`
  - `src/lib/api/response.ts`
  - repository layer
- Customer Ordering Module
  - `src/app/api/customer/orders/route.ts`
- Admin Operations Module
  - `src/app/api/admin/dashboard/route.ts`
  - `src/app/api/admin/orders/status/route.ts`
  - `src/app/api/admin/orders/route.ts`
  - `src/app/api/admin/tables/complete/route.ts`
  - `src/app/admin/dashboard/page.tsx`
  - `src/components/admin/table-card-grid.tsx`

### Story Traceability

| Story | Realtime 구현 범위 | Plan Step |
|---|---|---|
| US-CUST-004 주문 제출 | 주문 생성 성공 후 `order-created` publish | Step 4 |
| US-ADMIN-002 실시간 주문 모니터링 | SSE endpoint, EventSource subscription, dashboard reload, table highlight | Step 2, 3, 5, 7 |
| US-ADMIN-003 주문 상태 변경 | 상태 변경 성공 후 `order-updated` publish | Step 4 |
| US-ADMIN-004 테이블 세션 관리 | 테이블 완료 성공 후 `table-completed` publish | Step 4 |
| US-ADMIN-005 주문 정정 | 주문 삭제 성공 후 `order-deleted` publish | Step 4 |

## Expected Interfaces and Contracts

### Event Types

- `order-created`
- `order-updated`
- `order-deleted`
- `table-completed`

### Event Payload

공통:

- `type`
- `storeId`
- `tableId`
- `sessionId`
- `occurredAt`

주문 event:

- `orderId`

### SSE Route

- `GET /api/admin/events?storeId={storeId}`
- 성공 시 `text/event-stream`
- storeId 누락 시 구조화된 실패 응답 또는 400 응답
- keepalive comment ping 지원
- disconnect cleanup 지원

## Code Generation Steps

### Step 1: Realtime Types and Pure Helpers

- [x] `src/features/realtime/types.ts` 생성.
- [x] `RealtimeEventType`, `RealtimeEvent`, `OrderRealtimeEvent`, `TableRealtimeEvent`, `EventConnectionState`, `HighlightedTable` type 정의.
- [x] `src/features/realtime/realtime-event-helpers.ts` 생성.
- [x] `isRealtimeEventType` 구현.
- [x] `parseRealtimeEvent` 구현.
- [x] `shouldDeliverToStore` 구현.
- [x] `shouldReloadForRealtimeSignal` 구현.
- [x] `nextHighlightedTables` 구현.
- [x] Story coverage: US-ADMIN-002.

### Step 2: Server Event Bus and Publisher

- [x] `src/server/events/event-bus.ts` 생성.
- [x] `Map<storeId, Map<clientId, client>>` registry 구현.
- [x] `subscribe`, `unsubscribe`, `publish`, `sizeForStore`, `clear` 구현.
- [x] publish result에 delivered/removed client count 포함.
- [x] send 실패 client 즉시 제거 구현.
- [x] `src/server/events/event-publisher.ts` 생성.
- [x] `publishOrderCreated`, `publishOrderUpdated`, `publishOrderDeleted`, `publishTableCompleted` helper 구현.
- [x] `src/server/events/sse-format.ts` 생성.
- [x] SSE data frame과 ping frame formatter 구현.
- [x] Story coverage: US-CUST-004, US-ADMIN-002~US-ADMIN-005.

### Step 3: Admin SSE API Route

- [x] `src/app/api/admin/events/route.ts` 생성.
- [x] storeId query parameter validation 구현.
- [x] `ReadableStream` 기반 SSE response 구현.
- [x] `Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive` header 설정.
- [x] event bus subscribe/unsubscribe 연결.
- [x] comment ping keepalive interval 구현.
- [x] request abort/disconnect cleanup 구현.
- [x] Story coverage: US-ADMIN-002.

### Step 4: Mutation Route Event Publication Integration

- [x] `src/app/api/customer/orders/route.ts` 수정: 주문 생성 성공 후 `order-created` publish.
- [x] `src/app/api/admin/orders/status/route.ts` 수정: 상태 변경 성공 후 `order-updated` publish.
- [x] `src/app/api/admin/orders/route.ts` 수정: 주문 삭제 성공 후 `order-deleted` publish.
- [x] 주문 삭제 route는 event payload 생성을 위해 삭제 전 order 조회 또는 repository 반환값 확보.
- [x] `src/app/api/admin/tables/complete/route.ts` 수정: 테이블 완료 성공 후 `table-completed` publish.
- [x] 필요 시 `src/server/repositories/order-repository.ts`에 `findById` 또는 `deleteReturningOrder` 추가.
- [x] publish 실패가 API 성공 response를 rollback하지 않도록 처리.
- [x] Story coverage: US-CUST-004, US-ADMIN-003, US-ADMIN-004, US-ADMIN-005.

### Step 5: Realtime Client Hook

- [x] `src/features/realtime/use-admin-realtime-events.ts` 생성.
- [x] EventSource 생성/cleanup 구현.
- [x] connection state `connecting/open/failed/closed` 관리.
- [x] open 시 guarded dashboard reload 호출.
- [x] message 수신 시 parse/store filter/reload/highlight 처리.
- [x] error 시 기존 dashboard data를 보존하고 failed state만 표시.
- [x] in-flight reload guard와 pending reload 처리 구현.
- [x] highlight timer cleanup 구현.
- [x] Story coverage: US-ADMIN-002.

### Step 6: Realtime Tests and PBT

- [x] `src/features/realtime/realtime-event-helpers.test.ts` 생성.
- [x] event type/payload helper example test 작성.
- [x] store delivery predicate PBT 작성.
- [x] reload decision PBT 작성.
- [x] highlight expiry PBT 작성.
- [x] `src/server/events/event-bus.test.ts` 생성.
- [x] subscribe/unsubscribe/publish fan-out/failed client isolation test 작성.
- [x] `src/features/realtime/use-admin-realtime-events.test.ts` 생성.
- [x] EventSource mock 기반 open/message/error/cleanup test 작성.
- [x] Story coverage: US-ADMIN-002~US-ADMIN-005.

### Step 7: Dashboard UI Integration

- [x] `src/app/admin/dashboard/page.tsx` 수정.
- [x] `useAdminRealtimeEvents`를 dashboard reload callback과 연결.
- [x] `admin-realtime-status` 상태 표시 추가.
- [x] lastEventAt 표시 추가.
- [x] highlightedTableIds를 `TableCardGrid`로 전달.
- [x] `src/components/admin/table-card-grid.tsx` 수정.
- [x] highlighted table card class/data-state 적용.
- [x] 기존 `data-testid` 유지.
- [x] Story coverage: US-ADMIN-002.

### Step 8: Style Integration

- [x] `src/app/globals.css` 수정.
- [x] realtime status 표시 style 추가.
- [x] highlighted admin table card style 추가.
- [x] 기존 customer/admin style과 충돌하지 않도록 `admin-` 또는 `realtime-` prefix 사용.
- [x] 44px target, text overlap 방지, compact dashboard 유지.

### Step 9: Integration Consistency Review

- [x] API route publish와 event payload type contract 일치 여부 확인.
- [x] dashboard reload boundary가 기존 manual refresh와 충돌하지 않는지 확인.
- [x] malformed event와 store mismatch가 snapshot을 덮어쓰지 않는지 확인.
- [x] in-memory bus가 source of truth로 오해되지 않도록 code summary에 기록.
- [x] Story Traceability 표의 US-CUST-004, US-ADMIN-002~US-ADMIN-005를 구현 완료로 표시.

### Step 10: Code Summary Documentation

- [x] `aidlc-docs/construction/realtime-event/code/code-summary.md` 생성.
- [x] 생성/수정한 application code 목록 기록.
- [x] event flow, PBT coverage, resiliency implementation 요약.
- [x] Build and Test 단계에서 실행할 검증 명령 후보 기록.

## PBT Compliance Plan

| Rule | 적용 계획 |
|---|---|
| PBT-03 | store filter, payload validation, reload decision invariant 검증 |
| PBT-06 | highlight expiry와 EventSource state transition 검증 |
| PBT-07 | RealtimeEvent domain generator 사용 |
| PBT-08 | Build and Test 단계에서 seed 재현 방법 문서화 |
| PBT-10 | example-based test와 PBT를 함께 작성 |

## Resiliency Compliance Plan

| Rule | 적용 계획 |
|---|---|
| RESILIENCY-05 | connection state와 lastEventAt UI 제공 |
| RESILIENCY-10 | failed client isolation, malformed event ignore, store mismatch ignore 구현 |
| RESILIENCY-14 | EventSource mock test와 server restart 후 snapshot recovery 수동 검증 후보 기록 |

## Out of Scope

- Redis 또는 shared broker.
- Last-Event-ID replay buffer.
- WebSocket 전환.
- production auth hardening.
- multi-instance event distribution.
- production monitoring dashboard.
