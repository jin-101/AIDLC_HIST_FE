# 비즈니스 로직 모델 - Realtime Event

## 범위

Realtime Event Module은 성공한 주문/테이블 변경을 관리자 대시보드에 SSE로 전달한다. 이 모듈은 데이터의 source of truth가 아니며, SQLite와 dashboard snapshot API가 authoritative recovery path이다.

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| Event payload 수준 | `event type`, `storeId`, `tableId`, 관련 `orderId` 또는 `sessionId`, `occurredAt`만 포함한다. |
| Dashboard 갱신 방식 | event 수신 후 dashboard snapshot API를 재조회한다. |
| 재연결 복구 | EventSource `open` 시 dashboard snapshot을 재조회한다. |
| 신규 주문 강조 | `order-created` 수신 시 해당 table card를 짧게 강조한다. persistent unread count는 두지 않는다. |
| Event publication 계층 | API route에서 repository mutation 성공 직후 publish한다. |
| 구독 scope | 관리자 session의 `storeId`로 구독하고 같은 store event만 반영한다. |

## 핵심 Workflow

### 관리자 SSE 구독

1. 관리자 dashboard가 sessionStorage의 관리자 session에서 `storeId`를 읽는다.
2. dashboard는 먼저 `/api/admin/dashboard?storeId=...` snapshot을 조회한다.
3. dashboard는 `/api/admin/events?storeId=...`에 `EventSource`를 연다.
4. SSE endpoint는 `storeId`가 없으면 연결을 거부한다.
5. event bus는 연결 client를 `storeId` 기준으로 등록한다.
6. 연결이 열리면 dashboard는 snapshot을 한 번 재조회하여 유실 event 가능성을 흡수한다.

### 주문 생성 Event

1. 고객이 주문을 확정한다.
2. `/api/customer/orders` route가 주문 저장을 완료한다.
3. 저장 성공 후 route는 `order-created` event를 publish한다.
4. event에는 `storeId`, `tableId`, `orderId`, `sessionId`, `occurredAt`을 포함한다.
5. 같은 storeId로 연결된 관리자 dashboard client만 event를 수신한다.
6. client는 해당 tableId를 highlight 대상으로 표시하고 dashboard snapshot을 재조회한다.

### 주문 상태 변경 Event

1. 관리자가 주문 상태를 변경한다.
2. `/api/admin/orders/status` route가 주문 상태 변경을 완료한다.
3. 저장 성공 후 route는 `order-updated` event를 publish한다.
4. client는 event를 수신하면 dashboard snapshot을 재조회한다.
5. 상태 변경 실패 시 event는 publish하지 않는다.

### 주문 삭제 Event

1. 관리자가 주문 삭제를 확인한다.
2. `/api/admin/orders` DELETE route가 주문 삭제를 완료한다.
3. 삭제 성공 후 route는 `order-deleted` event를 publish한다.
4. client는 event를 수신하면 dashboard snapshot을 재조회한다.
5. 삭제 실패 또는 confirm 취소 시 event는 publish하지 않는다.

### 테이블 완료 Event

1. 관리자가 테이블 이용 완료를 확인한다.
2. `/api/admin/tables/complete` route가 active session 완료를 저장한다.
3. 저장 성공 후 route는 `table-completed` event를 publish한다.
4. event에는 `storeId`, `tableId`, `sessionId`, `occurredAt`을 포함한다.
5. client는 event 수신 후 dashboard snapshot을 재조회한다.

## 상태 모델

| 상태 | 위치 | 설명 |
|---|---|---|
| EventClientRegistration | server memory | SSE writer, storeId, connectedAt, clientId를 포함한다. |
| RealtimeEvent | server/client boundary | event type, storeId, tableId, orderId/sessionId, occurredAt을 포함한다. |
| EventConnectionState | client memory | connecting, open, closed, failed 상태를 표현한다. |
| HighlightedTableState | client memory | `tableId`와 expiresAt을 포함하며 짧은 시각 강조에 사용한다. |
| DashboardSnapshot | client memory | event 수신 또는 reconnect 후 재조회되는 authoritative view state이다. |

## API 통합

| 기능 | API 방향 | 기대 동작 |
|---|---|---|
| SSE 연결 | `GET /api/admin/events?storeId=...` | 같은 store event만 stream으로 전달한다. |
| 주문 생성 | `POST /api/customer/orders` | 저장 성공 후 `order-created` publish. |
| 주문 상태 변경 | `PATCH /api/admin/orders/status` | 저장 성공 후 `order-updated` publish. |
| 주문 삭제 | `DELETE /api/admin/orders` | 삭제 성공 후 `order-deleted` publish. |
| 테이블 완료 | `POST /api/admin/tables/complete` | 완료 성공 후 `table-completed` publish. |
| Dashboard 복구 | `GET /api/admin/dashboard?storeId=...` | event 수신, reconnect, manual refresh 시 snapshot 재조회. |

## PBT Testable Properties

| 속성 | 범주 | 기대 규칙 |
|---|---|---|
| storeId filter는 다른 매장 event를 제외한다 | Invariant | 임의 event/client storeId 조합에서 동일 storeId인 경우만 전달 대상으로 판단한다. |
| event payload validation은 허용된 type만 통과시킨다 | Invariant | `order-created`, `order-updated`, `order-deleted`, `table-completed` 외 type은 거부한다. |
| snapshot reload decision은 유효 event와 open event에서 true이다 | Invariant | 유효 event 또는 EventSource open은 dashboard reload를 요구한다. |
| highlight state는 만료 시 제거된다 | State transition | expiresAt 이후 highlighted table set에는 해당 tableId가 남지 않는다. |
| malformed event는 dashboard state를 직접 변경하지 않는다 | Invariant | parse 실패 또는 store mismatch event는 snapshot을 덮어쓰지 않는다. |

## Resiliency 반영

| 실패 상황 | 설계 대응 |
|---|---|
| SSE 연결 끊김 | EventSource 기본 재연결을 사용하고 open 시 snapshot을 재조회한다. |
| in-memory event 유실 | event replay를 구현하지 않고 snapshot API 재조회로 복구한다. |
| 잘못된 event payload | client validator가 무시하고 기존 dashboard snapshot을 유지한다. |
| 다른 store event 수신 | storeId filter가 event를 무시한다. |
| publish 중 일부 client 전송 실패 | 실패 client는 제거하고 나머지 client 전송은 계속한다. |
| 서버 재시작 | event bus memory는 비워지지만 dashboard snapshot API로 현재 상태를 회복한다. |

## 확장 규칙 준수

### Property-Based Testing

- **PBT-01**: 준수. store filter, payload validation, reload decision, highlight expiry 속성을 식별했다.
- **PBT-02**: N/A. 이 단계의 핵심 event payload는 lossy notification이며 round-trip 변환을 요구하지 않는다.
- **PBT-03**: 준수 계획. store filtering과 payload validation invariant를 적용한다.
- **PBT-04**: N/A. SSE publish는 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 이 unit 범위에 포함하지 않는다.
- **PBT-06**: 준수 계획. highlight state expiration과 connection state transition을 테스트한다.
- **PBT-07~PBT-10**: Code Generation 및 Build and Test 단계에서 구체화한다.

### Resiliency

- **활성화 상태**: `aidlc-state.md` 기준 Resiliency Baseline은 enabled이다.
- **적용 결과**: snapshot recovery, EventSource reconnect, malformed event ignore, store scoped delivery, failed client isolation을 설계에 반영했다.
- **N/A 판단**: multi-instance event distribution, cross-region failover, replay buffer는 local MVP 범위를 벗어나며 production hardening 항목이다.
