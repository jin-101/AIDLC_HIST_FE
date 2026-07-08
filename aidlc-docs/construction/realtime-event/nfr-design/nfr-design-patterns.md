# NFR 설계 패턴 - Realtime Event

## 범위

이 문서는 Realtime Event Module의 NFR 요구사항을 구현 패턴으로 구체화한다. 대상은 in-memory event bus, SSE route, event publication, dashboard subscription, snapshot fallback, 신규 주문 highlight, 테스트 가능한 helper 경계이다.

## 확정된 설계 패턴 결정

| 관심사 | 결정 |
|---|---|
| Event bus registry | `Map<storeId, Map<clientId, client>>` 구조로 store별 fan-out을 직접 지원한다. |
| Failed client 처리 | publish 중 send 실패 client는 즉시 unsubscribe하고 다른 client 전송은 계속한다. |
| Dashboard reload | 유효 event마다 reload하되 lightweight in-flight guard로 중복 reload를 줄인다. |
| Highlight expiry | helper가 expiresAt 기반 highlight set을 계산하고 hook이 timer로 정리한다. |
| SSE keepalive | 주기적 comment ping을 보내고 disconnect 시 interval과 registry를 정리한다. |
| Component boundary | server event bus, SSE route, event publisher helper, realtime client hook, realtime pure helpers로 분리한다. |

## Event Bus 패턴

### Store-Scoped Fan-Out Registry Pattern

event bus는 storeId를 최상위 key로 사용하는 registry를 가진다.

설계 규칙:

- registry 구조는 `Map<storeId, Map<clientId, client>>`이다.
- `subscribe(storeId, client)`는 storeId bucket을 만들고 client를 등록한다.
- `unsubscribe(clientId)`는 모든 bucket에서 client를 제거하거나 clientId to storeId index를 함께 유지해 제거한다.
- `publish(event)`는 event.storeId bucket에만 fan-out한다.
- storeId가 없는 client는 등록하지 않는다.
- publish 결과는 delivery count, removed client count를 반환해 test와 관측 가능성을 높인다.

적용 이유:

- 같은 storeId client에게만 event를 전달해야 한다.
- publish 때 전체 client를 매번 순회하지 않아도 된다.
- MVP의 1~5개 연결에서는 단순하지만, 구조상 store scope가 명확하다.

### Failed Client Isolation Pattern

전송 실패 client는 즉시 격리한다.

설계 규칙:

- client `send`가 throw하거나 stream writer가 closed 상태이면 해당 client를 unsubscribe한다.
- 한 client 실패가 publish 전체 실패로 전파되지 않는다.
- 나머지 client에게는 event 전송을 계속한다.
- 실패 client 제거 수를 publish result에 기록한다.

적용 이유:

- 끊어진 SSE client가 event bus에 남아 메모리와 반복 실패를 만들지 않는다.
- 한 dashboard tab의 실패가 다른 관리자 dashboard에 영향을 주지 않는다.

## SSE Route 패턴

### Stream Lifecycle Cleanup Pattern

SSE route는 stream 생명주기를 명확히 닫는다.

설계 규칙:

- `/api/admin/events?storeId=...`는 storeId가 없으면 400 응답을 반환한다.
- 연결이 열리면 client를 event bus에 등록한다.
- response header는 `text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`를 사용한다.
- client disconnect signal을 감지하면 event bus에서 unsubscribe한다.
- disconnect 시 keepalive interval을 clear한다.
- stream close 시 writer/controller를 정리한다.

### Keepalive Comment Ping Pattern

SSE route는 주기적 comment ping을 전송한다.

설계 규칙:

- 일정 주기로 `: ping\n\n` 형태의 SSE comment를 보낸다.
- ping은 application event로 parse하지 않는다.
- ping 실패는 failed client isolation과 같은 cleanup 경로로 처리한다.
- ping 주기는 local prototype 기준 과도하게 짧게 잡지 않는다.

적용 이유:

- 중간 proxy 또는 브라우저 연결이 완전히 유휴 상태로 남지 않게 돕는다.
- 연결 상태 문제를 빨리 cleanup할 수 있다.

## Client Subscription 패턴

### Snapshot Recovery Subscription Pattern

dashboard는 SSE event를 patch source가 아니라 reload trigger로 사용한다.

설계 규칙:

- dashboard 진입 시 먼저 snapshot API를 호출한다.
- EventSource `open` 발생 시 snapshot reload를 호출한다.
- 유효 event message 수신 시 snapshot reload를 호출한다.
- malformed event와 store mismatch event는 reload하지 않는다.
- 연결 실패는 기존 dashboard snapshot을 덮어쓰지 않는다.
- manual refresh 버튼은 계속 유지한다.

적용 이유:

- in-memory event 유실과 reconnect 중 놓친 변경을 snapshot으로 복구한다.
- event payload를 작게 유지하고 source of truth를 SQLite/API에 둔다.

### Lightweight In-Flight Reload Guard Pattern

중복 reload는 간단한 in-flight guard로 줄인다.

설계 규칙:

- reload가 실행 중이면 추가 event는 pending reload flag만 세운다.
- 현재 reload가 끝난 뒤 pending flag가 있으면 한 번 더 reload한다.
- 강한 debounce로 실시간성을 늦추지 않는다.
- 유효 event마다 reload intent는 기록한다.

적용 이유:

- 짧은 시간에 여러 event가 몰려도 snapshot API 호출 폭증을 줄인다.
- 2초 이내 반영 목표를 유지하면서 구현 복잡도를 낮춘다.

## Highlight 패턴

### Expiring Highlight State Pattern

신규 주문 강조는 만료 가능한 client state로 표현한다.

설계 규칙:

- `order-created` event만 highlight state를 추가한다.
- helper는 현재 highlight 목록, tableId, now, highlightMs를 받아 expiresAt을 계산한다.
- 만료 시간이 지난 항목은 helper가 제거한다.
- hook은 timer를 사용해 만료 시점 이후 state를 정리한다.
- highlight 만료는 dashboard snapshot data를 바꾸지 않는다.

적용 이유:

- CSS animation만으로는 test 가능한 상태 확인이 어렵다.
- persistent unread count는 MVP 범위를 넘는다.
- PBT로 “만료 후 제거” 속성을 검증할 수 있다.

## Event Validation 패턴

### Defensive Event Parse Pattern

client는 event payload를 신뢰하지 않고 validation한다.

설계 규칙:

- JSON parse 실패는 null로 변환한다.
- 허용되지 않은 event type은 null로 변환한다.
- 필수 ID가 없는 payload는 null로 변환한다.
- occurredAt이 문자열이 아니면 null로 변환한다.
- null event는 dashboard snapshot과 connection state를 변경하지 않는다.

적용 이유:

- malformed event가 dashboard를 failed state로 덮어쓰지 않는다.
- PBT와 example-based test로 validation 경계를 검증할 수 있다.

## Publication 패턴

### Post-Persistence Publish Pattern

event는 DB 변경 성공 후에만 발행한다.

설계 규칙:

- 주문 생성 저장 성공 후 `order-created` publish.
- 주문 상태 변경 성공 후 `order-updated` publish.
- 주문 삭제 성공 후 `order-deleted` publish.
- 테이블 완료 성공 후 `table-completed` publish.
- validation 실패, persistence 실패, confirm 취소 시 publish하지 않는다.
- publish 실패는 이미 성공한 persistence를 rollback하지 않는다.

적용 이유:

- event는 notification이고 source of truth가 아니다.
- 잘못된 optimistic event로 dashboard가 앞서 나가는 문제를 피한다.

## PBT 설계 패턴

### Property-Friendly Realtime Helper Pattern

테스트 가능한 core logic을 pure helper로 분리한다.

PBT 대상:

| 대상 | 속성 |
|---|---|
| event type guard | 허용 type만 true이다. |
| event parser | malformed input은 null이고 valid input은 event로 유지된다. |
| store delivery predicate | 같은 storeId일 때만 delivery 대상이다. |
| reload decision helper | open 또는 valid event일 때 reload가 필요하다. |
| highlight helper | 만료된 highlight는 제거되고 order-created table은 추가된다. |

설계 규칙:

- helper는 DOM, EventSource, stream writer, fetch에 의존하지 않는다.
- generator는 event type, storeId, tableId, orderId, sessionId, occurredAt을 domain 구조로 만든다.
- PBT와 EventSource mock test를 분리한다.

## Resiliency 적용 요약

- event bus는 store-scoped registry로 delivery 범위를 제한한다.
- failed client는 즉시 제거해 다른 client로 장애가 번지지 않게 한다.
- SSE route는 keepalive와 cleanup을 가진다.
- client는 reconnect/open과 valid event에서 snapshot reload로 복구한다.
- malformed event와 store mismatch는 무시한다.
- in-memory bus의 multi-instance 한계는 명시하고 production shared broker를 후속 hardening으로 둔다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. pure helper 경계와 PBT 속성을 설계 패턴으로 명시했다.
- **Resiliency**: 준수. failed client isolation, keepalive cleanup, snapshot recovery, malformed event fallback을 반영했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
