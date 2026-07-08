# 논리 컴포넌트 - Realtime Event

## 개요

Realtime Event Module은 기존 Customer/Admin mutation route와 Admin dashboard에 실시간 notification layer를 추가한다. source of truth는 SQLite와 dashboard snapshot API이며, Realtime 컴포넌트는 변경 사실을 전달하고 재조회 트리거를 제공한다.

## 컴포넌트 목록

| 컴포넌트 | 위치 | 책임 |
|---|---|---|
| Realtime Event Types | `src/features/realtime/types.ts` 또는 `src/server/events/types.ts` | event type과 payload contract 정의 |
| Realtime Pure Helpers | `src/features/realtime/realtime-event-helpers.ts` | parse, type guard, store filter, reload decision, highlight 계산 |
| Server Event Bus | `src/server/events/event-bus.ts` | store-scoped client registry, subscribe, unsubscribe, publish |
| SSE Route Handler | `src/app/api/admin/events/route.ts` | `text/event-stream` 응답, keepalive, cleanup |
| Event Publisher Helper | `src/server/events/event-publisher.ts` | mutation 결과를 RealtimeEvent payload로 변환하고 publish |
| Mutation Route Integration | 기존 customer/admin API route | persistence 성공 후 event publish 호출 |
| Realtime Client Hook | `src/features/realtime/use-admin-realtime-events.ts` | EventSource 연결, connection state, reload callback, highlight state |
| Dashboard UI Integration | `src/app/admin/dashboard/page.tsx`, `TableCardGrid` | realtime status 표시, highlighted table card 표시 |
| Realtime Tests | `src/features/realtime/*.test.ts`, `src/server/events/*.test.ts` | PBT, event bus unit, EventSource mock hook test |

## Realtime Event Types

책임:

- `RealtimeEventType` union 정의.
- `RealtimeEvent` payload 정의.
- `EventConnectionState` 정의.
- `HighlightedTable` 정의.

계약:

- `order-created`, `order-updated`, `order-deleted`는 orderId를 포함한다.
- `table-completed`는 sessionId와 tableId를 포함한다.
- 모든 event는 storeId, tableId, sessionId, occurredAt을 포함한다.

## Realtime Pure Helpers

책임:

- unknown payload를 safe parse한다.
- event type이 허용 집합에 있는지 판정한다.
- event storeId와 session storeId가 같은지 판정한다.
- EventSource open/message signal이 reload를 요구하는지 판정한다.
- highlight 목록을 추가/만료 기준으로 갱신한다.

설계 제약:

- fetch, EventSource, DOM, stream writer에 의존하지 않는다.
- 모든 함수는 deterministic하게 동작한다.
- PBT generator로 검증 가능해야 한다.

## Server Event Bus

책임:

- store별 SSE client registry 유지.
- client subscribe/unsubscribe.
- event publish fan-out.
- failed client isolation.
- publish result 반환.

내부 모델:

| 필드 | 설명 |
|---|---|
| `clientsByStore` | `Map<storeId, Map<clientId, client>>` |
| `clientStoreIndex` | 선택 사항. clientId로 store bucket을 빠르게 찾기 위한 보조 index |
| `client.send` | SSE frame 또는 ping을 전송하는 함수 |
| `client.connectedAt` | 연결 등록 시각 |

주요 메서드:

| 메서드 | 입력 | 출력 | 설명 |
|---|---|---|---|
| `subscribe` | storeId, client | clientId 또는 registration | store bucket에 client 등록 |
| `unsubscribe` | clientId | void | registry에서 client 제거 |
| `publish` | RealtimeEvent | PublishResult | 같은 storeId client에게 event 전송 |
| `sizeForStore` | storeId | number | test/관측용 연결 수 |
| `clear` | 없음 | void | test cleanup |

## SSE Route Handler

책임:

- storeId query validation.
- SSE response header 구성.
- stream writer/controller 생성.
- event bus subscribe.
- keepalive ping interval 시작.
- request abort/disconnect cleanup.

Response 요구사항:

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

Stream frame:

| 종류 | 형식 |
|---|---|
| Event | `data: {json}\n\n` |
| Keepalive | `: ping\n\n` |

Cleanup:

- abort signal 또는 stream close 시 unsubscribe.
- keepalive interval clear.
- writer/controller close 시도.

## Event Publisher Helper

책임:

- mutation route가 event payload를 일관되게 만들도록 돕는다.
- occurredAt을 생성한다.
- publish 호출을 event bus로 위임한다.

사용 위치:

| Mutation | Event |
|---|---|
| customer order create success | `order-created` |
| admin order status update success | `order-updated` |
| admin order delete success | `order-deleted` |
| admin table complete success | `table-completed` |

제약:

- repository 내부에서는 호출하지 않는다.
- persistence 성공 후에만 호출한다.
- publish result를 route response에 노출하지 않는다.

## Realtime Client Hook

책임:

- EventSource 생성과 cleanup.
- open/message/error event 처리.
- connection state 관리.
- lastEventAt 관리.
- valid event 수신 시 reload callback 호출.
- order-created highlight state 관리.
- in-flight reload guard 관리.

Reload guard 상태:

| 상태 | 설명 |
|---|---|
| `isReloading` | reload callback 실행 중 |
| `pendingReload` | 실행 중 event가 추가로 들어와 한 번 더 reload 필요 |

동작:

1. storeId가 없으면 연결하지 않는다.
2. storeId가 생기면 EventSource를 생성한다.
3. open 시 connectionState를 open으로 바꾸고 guarded reload를 호출한다.
4. message 시 payload를 parse하고 같은 store인지 확인한다.
5. valid event이면 lastEventAt을 갱신하고 guarded reload를 호출한다.
6. order-created이면 highlighted table state를 갱신한다.
7. error 시 connectionState를 failed로 표시하되 snapshot data는 유지한다.
8. unmount/logout 시 EventSource를 close한다.

## Dashboard UI Integration

변경 대상:

- `AdminDashboardPage`
- `TableCardGrid`
- CSS admin table card highlight style

UI 표시:

| 요소 | 표시 |
|---|---|
| 실시간 상태 | `data-testid="admin-realtime-status"` |
| 연결 실패 | 기존 snapshot 유지 + 상태 메시지 |
| 마지막 event 시각 | 보조 텍스트 |
| highlighted card | 기존 card test id 유지 + highlighted class |

## Test Components

| 테스트 | 목적 |
|---|---|
| `realtime-event-helpers.test.ts` | parser/filter/reload/highlight helper example + PBT |
| `event-bus.test.ts` | subscribe/unsubscribe/publish/failed client isolation |
| `use-admin-realtime-events.test.ts` | EventSource open/message/error/cleanup mock test |

## Dependency 관계

| 컴포넌트 | 의존 대상 |
|---|---|
| SSE Route Handler | Server Event Bus |
| Event Publisher Helper | Server Event Bus, Realtime Event Types |
| Mutation Route Integration | Event Publisher Helper |
| Realtime Client Hook | Realtime Pure Helpers, browser EventSource |
| Dashboard UI Integration | Realtime Client Hook, existing dashboard reload |
| Tests | Realtime Pure Helpers, Event Bus, EventSource mock |

## Production Hardening Boundary

MVP에서 제외하고 후속 hardening으로 둘 항목:

- shared broker 또는 Redis pub/sub.
- Last-Event-ID replay buffer.
- production auth hardening.
- multi-instance event distribution.
- production metrics/alert routing.
- long-running connection pressure test beyond 1~5 admin browsers.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. pure helper, event bus predicate, highlight transition, malformed event fallback을 테스트 가능한 컴포넌트로 분리했다.
- **Resiliency**: 준수. snapshot recovery, failed client isolation, stream cleanup, keepalive, in-memory 한계와 hardening 경계를 명시했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
