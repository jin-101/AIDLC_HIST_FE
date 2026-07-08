# 비즈니스 규칙 - Realtime Event

## Event Type 규칙

| Rule ID | 규칙 |
|---|---|
| RT-RULE-001 | 허용 event type은 `order-created`, `order-updated`, `order-deleted`, `table-completed` 네 가지이다. |
| RT-RULE-002 | 알 수 없는 event type은 publish와 client apply 모두에서 거부하거나 무시한다. |
| RT-RULE-003 | `order-created`, `order-updated`, `order-deleted` event는 `orderId`, `storeId`, `tableId`, `sessionId`, `occurredAt`을 포함해야 한다. |
| RT-RULE-004 | `table-completed` event는 `storeId`, `tableId`, `sessionId`, `occurredAt`을 포함해야 한다. |
| RT-RULE-005 | `occurredAt`은 ISO 8601 문자열이어야 한다. |

## Publication 규칙

| Rule ID | 규칙 |
|---|---|
| RT-RULE-010 | event는 repository mutation이 성공한 뒤에만 publish한다. |
| RT-RULE-011 | validation 실패, persistence 실패, confirm 취소 시 event를 publish하지 않는다. |
| RT-RULE-012 | repository는 event bus를 직접 호출하지 않는다. |
| RT-RULE-013 | API route는 mutation 결과에서 event payload에 필요한 ID를 구성한다. |
| RT-RULE-014 | publish 실패는 이미 성공한 persistence를 rollback하지 않는다. |

## 구독 및 Delivery 규칙

| Rule ID | 규칙 |
|---|---|
| RT-RULE-020 | SSE endpoint는 `storeId` query parameter가 없으면 연결을 거부한다. |
| RT-RULE-021 | event bus는 client를 storeId 기준으로 등록한다. |
| RT-RULE-022 | event는 같은 storeId client에게만 전달한다. |
| RT-RULE-023 | client 전송 실패가 발생하면 해당 client를 제거하고 다른 client 전달은 계속한다. |
| RT-RULE-024 | in-memory bus는 local prototype 범위에서만 신뢰한다. 다중 instance production에서는 shared broker가 필요하다. |

## Client Apply 규칙

| Rule ID | 규칙 |
|---|---|
| RT-RULE-030 | client는 event payload만으로 dashboard를 직접 authoritative하게 갱신하지 않는다. |
| RT-RULE-031 | 유효 event를 수신하면 dashboard snapshot API를 재조회한다. |
| RT-RULE-032 | EventSource `open` 발생 시 snapshot API를 재조회한다. |
| RT-RULE-033 | malformed event 또는 storeId mismatch event는 무시한다. |
| RT-RULE-034 | event parse 실패는 dashboard를 failed 상태로 덮어쓰지 않는다. |
| RT-RULE-035 | manual refresh 버튼은 SSE 동작과 독립적으로 유지한다. |

## 신규 주문 강조 규칙

| Rule ID | 규칙 |
|---|---|
| RT-RULE-040 | `order-created` event 수신 시 해당 tableId를 highlight 대상으로 등록한다. |
| RT-RULE-041 | highlight는 짧은 시간 후 자동 제거된다. |
| RT-RULE-042 | `order-updated`, `order-deleted`, `table-completed`는 신규 주문 highlight를 만들지 않는다. |
| RT-RULE-043 | highlight 만료는 주문 상태나 dashboard snapshot data를 변경하지 않는다. |

## 오류 처리 규칙

| Rule ID | 규칙 |
|---|---|
| RT-RULE-050 | SSE 연결 실패 시 기존 dashboard snapshot을 유지한다. |
| RT-RULE-051 | 연결 상태는 UI에 보조 상태로 표시할 수 있으나 주문 data 자체의 source of truth가 아니다. |
| RT-RULE-052 | snapshot 재조회 실패 시 기존 snapshot을 유지하고 오류 메시지와 수동 재시도 경로를 제공한다. |
| RT-RULE-053 | server restart로 event bus가 초기화되어도 client는 reconnect 후 snapshot 재조회로 복구한다. |

## Acceptance Criteria 매핑

| Story | 관련 규칙 |
|---|---|
| US-CUST-004 주문 제출 | RT-RULE-010, RT-RULE-011, RT-RULE-003 |
| US-ADMIN-002 실시간 주문 모니터링 | RT-RULE-020~RT-RULE-035, RT-RULE-040~RT-RULE-043 |
| US-ADMIN-003 주문 상태 변경 | RT-RULE-010, RT-RULE-003, RT-RULE-031 |
| US-ADMIN-004 테이블 세션 관리 | RT-RULE-004, RT-RULE-031 |
| US-ADMIN-005 주문 정정 | RT-RULE-003, RT-RULE-031 |

## PBT 적용 규칙

| PBT 대상 | 검증할 규칙 |
|---|---|
| Event type guard | RT-RULE-001, RT-RULE-002 |
| Store scoped delivery predicate | RT-RULE-021, RT-RULE-022 |
| Client event validator | RT-RULE-030, RT-RULE-033, RT-RULE-034 |
| Reload decision helper | RT-RULE-031, RT-RULE-032 |
| Highlight expiry helper | RT-RULE-040~RT-RULE-043 |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. 각 business rule 중 순수 판정 가능한 부분을 PBT 대상으로 식별했다.
- **Resiliency**: 준수. 연결 실패, 유실 event, malformed event, publish 실패 client 격리를 규칙으로 정의했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
