# Admin Operations NFR Design 계획

## 목적

Admin Operations Module의 NFR 요구사항을 구현 가능한 설계 패턴과 논리 컴포넌트로 구체화한다.

## Unit Context

- **Unit**: Admin Operations Module
- **선행 산출물**:
  - `aidlc-docs/construction/admin-operations/functional-design/`
  - `aidlc-docs/construction/admin-operations/nfr-requirements/`
- **핵심 NFR**:
  - dashboard snapshot 및 주요 mutation 500ms 목표
  - Realtime 전 수동 새로고침과 mutation 성공 후 재조회
  - mutation 실패 시 기존 snapshot/form state 보존
  - compact 관리자 dashboard와 44px 이상 주요 조작 타깃
  - dashboard mapper, status helper, history filter, menu validation/reorder PBT 가능 경계

## Planning Questions

## Question 1
관리자 mutation 실패에 대한 resilience pattern은 어떻게 설계할까요?

A) optimistic update 없이 서버 성공 후 재조회하고, 실패 시 기존 snapshot/form state를 보존

B) optimistic update를 먼저 적용하고 실패 시 rollback

C) 실패 시 전체 화면을 초기화하고 다시 조회

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
dashboard snapshot refresh pattern은 어떻게 설계할까요?

A) 수동 새로고침 버튼과 mutation 성공 후 필요한 snapshot만 재조회

B) 5초 polling을 hook에 포함하고 mutation 성공 후에도 polling에 맡김

C) Realtime Event Module 전까지 별도 refresh pattern을 정의하지 않음

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
PBT 가능한 helper 경계는 어디까지 분리할까요?

A) dashboard mapper, status helper, history filter, menu validator, reorder helper를 UI 밖 pure function으로 분리

B) dashboard mapper만 pure function으로 분리하고 나머지는 hook 내부에 둠

C) helper 분리 없이 page component 내부에서 처리

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
관리자 sessionStorage fallback pattern은 어느 수준으로 둘까요?

A) safe parse + schema guard 실패 시 session clear 후 `/admin/login` 이동

B) JSON parse만 보호하고 schema guard는 구현하지 않음

C) sessionStorage 오류를 error boundary로 throw

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
Realtime Event Module과의 경계는 어떻게 설계할까요?

A) 현재 unit은 snapshot reload boundary만 정의하고, SSE subscribe/apply는 Realtime Event Module에서 추가

B) Admin Operations에서 SSE client hook까지 선구현

C) Realtime 통합을 고려하지 않고 dashboard만 구현

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
- [x] resilience, refresh, helper boundary, session fallback, realtime boundary 패턴을 확정한다.
- [x] `nfr-design-patterns.md`를 생성한다.
- [x] `logical-components.md`를 생성한다.
- [x] PBT와 Resiliency 활성화 규칙 반영 여부를 검증한다.
- [x] NFR Design 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

NFR Design은 dashboard mapper, status helper, history filter, menu validator, reorder helper를 pure function 중심으로 분리해 `fast-check` 속성 테스트가 가능하도록 설계해야 한다.

### Resiliency

NFR Design은 mutation 실패 state 보존, manual refresh, 성공 후 scoped reload, safe session fallback, Realtime Event Module 전후 경계 분리를 구현 패턴으로 명시해야 한다.
