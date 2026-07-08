# 도메인 엔티티 - Realtime Event

## 개요

Realtime Event Module은 persistent domain entity를 새로 만들지 않는다. 이 모듈의 엔티티는 SSE 연결과 event notification을 표현하는 runtime model이다.

## RealtimeEvent

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `type` | `RealtimeEventType` | 예 | 발생한 변경 유형 |
| `storeId` | `string` | 예 | event가 속한 매장 ID |
| `tableId` | `string` | 예 | event가 영향을 주는 테이블 ID |
| `orderId` | `string` | 조건부 | 주문 관련 event일 때 포함 |
| `sessionId` | `string` | 예 | 영향을 받는 table session ID |
| `occurredAt` | `string` | 예 | event 발생 시각 ISO 8601 문자열 |

## RealtimeEventType

| 값 | 의미 | 발생 원천 |
|---|---|---|
| `order-created` | 새 주문 생성 | 고객 주문 제출 성공 |
| `order-updated` | 주문 상태 변경 | 관리자 주문 상태 변경 성공 |
| `order-deleted` | 주문 삭제 | 관리자 주문 삭제 성공 |
| `table-completed` | 테이블 이용 완료 | 관리자 table completion 성공 |

## EventClientRegistration

| 필드 | 타입 | 설명 |
|---|---|---|
| `clientId` | `string` | server memory에서 SSE client를 식별하는 ID |
| `storeId` | `string` | 이 client가 구독한 store scope |
| `connectedAt` | `string` | 연결 등록 시각 |
| `send` | function | SSE frame을 client stream에 쓰는 함수 |

## EventConnectionState

| 값 | 의미 |
|---|---|
| `connecting` | EventSource를 생성했거나 재연결 중 |
| `open` | SSE 연결이 열림 |
| `closed` | client가 명시적으로 연결을 닫음 |
| `failed` | 오류가 발생했으며 reconnect 또는 수동 복구가 필요 |

## HighlightedTable

| 필드 | 타입 | 설명 |
|---|---|---|
| `tableId` | `string` | 강조할 table card |
| `expiresAt` | `number` | client clock 기준 만료 timestamp |

## 관계

| 관계 | 설명 |
|---|---|
| Store to EventClientRegistration | 하나의 storeId에 여러 관리자 SSE client가 연결될 수 있다. |
| RealtimeEvent to Store | event는 항상 하나의 storeId에 속한다. |
| RealtimeEvent to Table | event는 항상 하나의 tableId에 영향을 준다. |
| RealtimeEvent to Order | 주문 관련 event는 orderId를 포함한다. |
| RealtimeEvent to Session | 모든 event는 현재 또는 완료된 table session ID를 포함한다. |
| HighlightedTable to RealtimeEvent | `order-created` event만 highlight state를 만든다. |

## Validation 규칙

| 대상 | 규칙 |
|---|---|
| RealtimeEvent | 허용 type, 필수 ID, ISO 시각 문자열을 만족해야 한다. |
| EventClientRegistration | storeId가 빈 문자열이면 등록하지 않는다. |
| Client event apply | event storeId가 admin session storeId와 다르면 무시한다. |
| HighlightedTable | expiresAt이 현재 시각 이하가 되면 제거한다. |

## Persistence

- RealtimeEvent는 SQLite에 저장하지 않는다.
- EventClientRegistration은 process memory에만 존재한다.
- HighlightedTable은 browser memory에만 존재한다.
- authoritative dashboard state는 기존 orders, tables, sessions repository와 `/api/admin/dashboard` snapshot에서 복구한다.

## PBT Testable Properties

| Entity | 속성 |
|---|---|
| RealtimeEvent | 유효 event type과 필수 field가 있는 payload만 통과한다. |
| EventClientRegistration | 같은 storeId client만 delivery target이 된다. |
| EventConnectionState | open 이벤트는 reload decision을 만든다. |
| HighlightedTable | 만료 시간이 지난 highlight는 제거된다. |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. runtime entity의 guard와 state transition 속성을 식별했다.
- **Resiliency**: 준수. runtime memory model은 source of truth가 아니며 snapshot 복구 경계를 명시했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
