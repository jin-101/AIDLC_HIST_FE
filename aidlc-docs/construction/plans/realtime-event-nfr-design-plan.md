# Realtime Event NFR Design 계획

## 목적

Realtime Event Module의 NFR 요구사항을 구현 패턴과 논리 컴포넌트 설계로 구체화한다.

## Unit Context

- **Unit**: Realtime Event Module
- **이전 단계**: NFR Requirements 완료
- **핵심 NFR**:
  - mutation 성공 후 2초 이내 dashboard 반영
  - 단일 매장 기준 관리자 브라우저 1~5개 연결
  - replay buffer 없이 EventSource reconnect + snapshot reload fallback
  - 연결 상태와 마지막 event 시각 보조 표시
  - event helper PBT, event bus unit test, EventSource mock hook test

## Planning Questions

## Question 1
SSE event bus의 client registry는 어떤 구조로 설계할까요?

A) `Map<storeId, Map<clientId, client>>` 구조로 store별 fan-out을 직접 지원

B) 단일 `Map<clientId, client>`로 두고 publish 때마다 storeId를 필터링

C) 배열 기반 registry로 단순 구현

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
SSE 전송 실패 client는 어떻게 처리할까요?

A) publish 중 send 실패가 발생하면 해당 client를 즉시 unsubscribe하고 다른 client 전송은 계속

B) 실패 client를 유지하고 다음 publish 때 다시 시도

C) 하나라도 실패하면 publish 전체를 실패 처리

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
dashboard reload는 event 수신마다 어떻게 제어할까요?

A) 유효 event마다 즉시 reload하되, 구현 시 중복 호출을 줄이는 lightweight in-flight guard를 둠

B) debounce를 강하게 걸어 여러 event를 묶어 1회 reload

C) event type별로 일부만 reload

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
신규 주문 highlight 만료는 어떤 패턴으로 구현할까요?

A) helper가 expiresAt 기반 highlight set을 계산하고 hook이 timer로 정리

B) CSS animation만 사용하고 state에는 highlight를 보관하지 않음

C) highlight를 manual dismiss할 때까지 유지

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
SSE route의 keepalive는 어떻게 설계할까요?

A) 주기적 comment ping을 보내 연결 유지를 돕고, client disconnect 시 interval과 registry를 정리

B) keepalive 없이 event가 있을 때만 전송

C) client에서 polling으로 연결 상태를 확인

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 6
NFR logical component 경계는 어떻게 나눌까요?

A) server event bus, SSE route, event publisher helper, realtime client hook, realtime pure helpers로 분리

B) 모든 realtime 로직을 dashboard page에 직접 구현

C) 모든 realtime 로직을 API route 내부에만 구현

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Recommended Prototype Answers

- Question 1: A
- Question 2: A
- Question 3: A
- Question 4: A
- Question 5: A
- Question 6: A

## Execution Checklist

- [x] 모든 planning question 답변 완료 여부를 검증한다.
- [x] 답변의 모호성 또는 모순을 분석한다.
- [x] event bus registry/fan-out pattern을 확정한다.
- [x] failed client isolation pattern을 확정한다.
- [x] snapshot reload 및 in-flight guard pattern을 확정한다.
- [x] highlight expiry pattern을 확정한다.
- [x] keepalive/cleanup pattern을 확정한다.
- [x] logical component 경계를 확정한다.
- [x] `nfr-design-patterns.md`를 생성한다.
- [x] `logical-components.md`를 생성한다.
- [x] Extension compliance를 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

NFR Design은 event type guard, store fan-out predicate, reload decision, highlight expiry, malformed event fallback을 pure helper로 분리하는 패턴을 명시해야 한다.

### Resiliency

NFR Design은 failed client isolation, EventSource reconnect + open reload, ping keepalive, stream cleanup, snapshot recovery, in-memory bus 한계와 production hardening 경계를 명시해야 한다.
