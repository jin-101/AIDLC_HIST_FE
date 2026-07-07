# Customer Ordering NFR Design 계획

## 목적

Customer Ordering Module의 NFR 요구사항을 구현 가능한 설계 패턴과 논리 컴포넌트로 구체화한다.

## Unit Context

- **Unit**: Customer Ordering Module
- **선행 산출물**:
  - `aidlc-docs/construction/customer-ordering/functional-design/`
  - `aidlc-docs/construction/customer-ordering/nfr-requirements/`
- **핵심 NFR**:
  - 100ms 이내 체감 화면 전환
  - local prototype API 300ms 이내 목표
  - 주문 실패 시 cart 보존과 같은 화면 재시도
  - localStorage 손상/schema mismatch fallback
  - 44px 이상 touch target과 명확한 UI state

## Planning Questions

## Question 1
주문 제출 실패에 대한 client-side resilience pattern은 어떻게 설계할까요?

A) 자동 재시도 없이 cart를 보존하고 같은 화면에서 수동 재시도 버튼을 제공

B) 1회 자동 재시도 후 실패하면 수동 재시도 버튼을 제공

C) 실패 주문을 local queue에 저장하고 나중에 자동 재전송

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
메뉴 조회 성능 패턴은 어떻게 설계할까요?

A) 페이지 진입 시 API 조회, 성공 결과는 component memory에 유지하고 실패 시 재시도 버튼 제공

B) localStorage에 메뉴 catalog도 cache해서 새로고침 후에도 재사용

C) 서버 렌더링으로 메뉴를 고정 제공하고 client fetch는 제외

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
localStorage adapter fallback pattern은 어느 수준으로 둘까요?

A) safe parse + schema guard + session scope check를 통과하지 못하면 empty state로 복구

B) JSON parse만 보호하고 schema guard는 구현하지 않음

C) localStorage 오류를 상위 component로 throw해서 error boundary에서 처리

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
성능 최적화 패턴은 어느 수준까지 적용할까요?

A) cart 계산 pure function, memoization 최소 적용, 불필요한 API 재호출 방지만 수행

B) 메뉴 list virtualization과 aggressive memoization을 기본 적용

C) 성능 패턴은 후속 단계로 미루고 기능 구현만 우선

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
논리 컴포넌트 경계는 어떻게 나눌까요?

A) storage adapter, cart domain service, API client, route guard, UI state hooks로 분리

B) 각 page component 안에 필요한 logic을 직접 포함

C) 전역 store 하나에 모든 customer state를 통합

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
- [x] resilience, performance, storage fallback, component boundary 패턴을 확정한다.
- [x] `nfr-design-patterns.md`를 생성한다.
- [x] `logical-components.md`를 생성한다.
- [x] PBT와 Resiliency 활성화 규칙 반영 여부를 검증한다.
- [x] NFR Design 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

NFR Design은 cart domain service와 storage adapter를 pure function 중심으로 분리해 `fast-check` 속성 테스트가 가능하도록 설계해야 한다.

### Resiliency

NFR Design은 주문 실패 cart 보존, manual retry, safe storage fallback, API failure state separation을 구현 패턴으로 명시해야 한다.
