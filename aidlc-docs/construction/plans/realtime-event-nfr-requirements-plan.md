# Realtime Event NFR Requirements 계획

## 목적

Realtime Event Module의 SSE 성능, 복원력, 가용성, 테스트 가능성, 기술 선택을 확정한다.

## Unit Context

- **Unit**: Realtime Event Module
- **이전 단계**: Functional Design 완료
- **핵심 설계**:
  - in-memory event bus
  - `/api/admin/events?storeId=...` SSE endpoint
  - EventSource 기반 dashboard subscription
  - event 수신 및 reconnect open 시 dashboard snapshot 재조회
  - `order-created` table card 단기 highlight

## Planning Questions

## Question 1
SSE 갱신 성능 목표는 어떻게 둘까요?

A) 로컬 MVP 정상 실행 조건에서 mutation 성공 후 2초 이내 dashboard에 반영

B) 1초 이내 반영을 목표로 더 공격적으로 설정

C) 성능 목표를 명시하지 않고 best-effort로 처리

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
동시 SSE client 규모는 프로토타입에서 어느 정도로 가정할까요?

A) 단일 매장 기준 관리자 브라우저 1~5개 연결

B) 단일 매장 기준 20개 이상 연결까지 고려

C) 여러 매장과 다수 연결을 production 수준으로 고려

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
event 유실 복구 요구사항은 어떻게 정의할까요?

A) replay buffer 없이 reconnect/open 또는 event 수신 시 snapshot 재조회로 복구

B) 최근 event replay buffer를 두고 Last-Event-ID 기반 재전송을 지원

C) 유실 이벤트 복구 없이 EventSource 기본 재연결만 사용

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
SSE 연결 상태 UI는 어느 수준으로 표시할까요?

A) 연결 중/연결됨/연결 실패와 마지막 event 시각을 보조 상태로 표시

B) 실패 상태만 표시하고 정상 상태는 숨김

C) SSE 연결 상태 UI는 표시하지 않음

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
Realtime Event Module의 테스트 전략은 어떻게 둘까요?

A) event helper PBT + event bus unit test + EventSource mock 기반 hook test를 작성

B) pure helper PBT만 작성하고 EventSource 동작은 수동 확인

C) e2e 중심으로만 확인

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 6
기술 스택은 어떻게 확정할까요?

A) 추가 runtime dependency 없이 Next.js route handler, Web Streams, browser EventSource, Vitest, fast-check 사용

B) SSE 전용 library를 추가

C) WebSocket으로 변경

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
- [x] SSE 성능/지연 목표를 확정한다.
- [x] 동시 연결과 scalability boundary를 확정한다.
- [x] reconnect, event 유실, snapshot fallback 복원력 요구사항을 확정한다.
- [x] 연결 상태 UI와 관측성 요구사항을 확정한다.
- [x] PBT 및 example-based test 요구사항을 확정한다.
- [x] 기술 스택 결정을 확정한다.
- [x] `nfr-requirements.md`를 생성한다.
- [x] `tech-stack-decisions.md`를 생성한다.
- [x] Extension compliance를 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

NFR Requirements 단계에서는 `fast-check` 사용 결정을 유지하고, event validation/filter/reload/highlight helper에 대한 PBT 요구사항을 문서화해야 한다.

### Resiliency

SSE는 best-effort notification이며, authoritative recovery는 dashboard snapshot API이다. reconnect, 유실 event, server restart, malformed payload, failed client isolation 요구사항을 명시해야 한다.
