# Realtime Event Functional Design 계획

## 목적

Realtime Event Module의 SSE 기반 관리자 실시간 주문 업데이트 기능 설계를 정의한다.

## Unit Context

- **Unit**: Realtime Event Module
- **의존 대상**: Foundation and Data Module, Customer Ordering Module, Admin Operations Module
- **지원 스토리**:
  - US-CUST-004 주문 제출
  - US-ADMIN-002 실시간 주문 모니터링
  - US-ADMIN-003 주문 상세 확인 및 상태 변경
  - US-ADMIN-004 테이블 세션 관리
  - US-ADMIN-005 주문 정정

## 설계 범위

- in-memory event bus
- `/api/admin/events` SSE endpoint
- 관리자 dashboard client subscription
- 성공한 주문/테이블 mutation 후 event publication
- `order-created`, `order-updated`, `order-deleted`, `table-completed` event 처리
- SSE 연결 실패/재연결 시 dashboard snapshot 재조회 fallback

## Planning Questions

## Question 1
SSE event payload는 어느 수준으로 포함할까요?

A) event type, storeId, tableId, orderId/sessionId, occurredAt만 포함하고 dashboard는 event 수신 후 snapshot API를 재조회

B) event payload에 변경된 주문/테이블 snapshot까지 포함해 client가 부분 업데이트

C) event payload에는 type만 포함하고 client가 항상 전체 dashboard를 재조회

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
SSE 연결이 끊겼다가 재연결되면 dashboard는 어떻게 복구할까요?

A) EventSource 재연결 이벤트를 활용하고, 연결 open 시 dashboard snapshot을 재조회

B) 유실 이벤트를 복구하기 위해 event id와 replay buffer를 구현

C) 재연결은 브라우저 기본 동작에 맡기고 별도 snapshot 재조회는 하지 않음

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
신규 주문 강조 표시는 어떤 방식으로 설계할까요?

A) `order-created` 수신 시 해당 table card를 짧게 강조하고, 별도 persistent unread count는 두지 않음

B) table별 unread count를 유지하고 관리자가 카드 확인 시 제거

C) 신규 주문 강조는 제외하고 목록만 갱신

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
event publication은 어느 계층에서 담당할까요?

A) API route에서 repository mutation 성공 직후 publish

B) 별도 service wrapper를 만들고 customer/admin mutation route가 service를 호출하여 publish

C) repository 내부에서 mutation과 publish를 함께 처리

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
프로토타입에서 SSE client scope는 어떻게 제한할까요?

A) 관리자 session의 storeId로 구독하고, 같은 storeId event만 반영

B) 인증 없이 모든 event를 수신하되 client에서 table filter만 적용

C) tableId별 개별 SSE endpoint를 둠

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Recommended Prototype Answers

- Question 1: A
- Question 2: A
- Question 3: A
- Question 4: A
- Question 5: A

## Execution Checklist

- [x] 모든 planning question 답변 완료 여부를 검증한다.
- [x] 답변의 모호성 또는 모순을 분석한다.
- [x] SSE event type과 payload contract를 확정한다.
- [x] event publication 계층과 mutation 통합 방식을 확정한다.
- [x] dashboard subscription, reconnect, snapshot fallback 동작을 확정한다.
- [x] `business-logic-model.md`를 생성한다.
- [x] `business-rules.md`를 생성한다.
- [x] `domain-entities.md`를 생성한다.
- [x] `frontend-components.md`를 생성한다.
- [x] PBT Testable Properties section을 포함한다.
- [x] Functional Design 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

Realtime Event Module은 event payload validation, storeId filtering, event apply/reload decision, highlighted table state expiration에 대해 테스트 가능한 속성을 식별해야 한다.

### Resiliency

SSE는 source of truth가 아니며 SQLite snapshot API가 authoritative recovery path이다. 연결 끊김, 유실 이벤트, malformed event, store mismatch에 대한 fallback과 무시 규칙을 설계해야 한다.
