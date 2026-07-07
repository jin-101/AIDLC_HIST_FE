# Admin Operations Functional Design 계획

## 목적

Admin Operations Module의 관리자 로그인, dashboard snapshot, table card/order detail, 주문 상태 변경, 주문 삭제, table completion, history 조회, menu CRUD의 기능 설계를 정의한다.

## Unit Context

- **Unit**: Admin Operations Module
- **의존 대상**: Foundation and Data Module, 이후 Realtime Event Module
- **소유 스토리**:
  - US-ADMIN-001 관리자 로그인
  - US-ADMIN-002 실시간 주문 모니터링
  - US-ADMIN-003 주문 상세 확인 및 상태 변경
  - US-ADMIN-004 테이블 세션 관리
  - US-ADMIN-005 주문 정정
  - US-ADMIN-006 과거 주문 조회
  - US-ADMIN-007 메뉴 관리

## Planning Questions

## Question 1
관리자 화면 route 구조는 어떻게 구성할까요?

A) `/admin/login`, `/admin/dashboard`, `/admin/tables`, `/admin/history`, `/admin/menus`로 명시적으로 분리

B) `/admin` 단일 dashboard에서 tab/state로 dashboard/tables/history/menus를 전환

C) `/admin/dashboard` 중심으로 두고 tables/history/menus는 modal 또는 drawer로 표시

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
관리자 로그인 상태는 MVP에서 어떻게 유지할까요?

A) storeId와 admin login flag를 sessionStorage에 저장하고 브라우저 세션 동안 유지

B) localStorage에 저장해 브라우저를 닫았다 열어도 유지

C) 저장하지 않고 route 이동마다 다시 로그인

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
주문 상태 변경 workflow는 어떻게 제한할까요?

A) `waiting -> preparing -> completed` 순방향 변경을 기본으로 하되 관리자는 이전 상태로도 수동 정정 가능

B) `waiting -> preparing -> completed` 순방향 변경만 허용

C) 세 상태를 언제든 자유롭게 변경

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
주문 삭제와 table usage completion은 어떤 확인 절차를 둘까요?

A) 브라우저 confirm 또는 간단 확인 dialog로 확인 후 실행

B) 주문 삭제와 table completion 모두 비밀번호 재입력 후 실행

C) 별도 확인 없이 버튼 클릭 즉시 실행

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
메뉴 관리의 category 처리 방식은 어떻게 할까요?

A) 기존 category 목록에서 선택하고 MVP에서는 category 생성/삭제는 제외

B) 메뉴 생성/수정 form에서 새 category 이름을 입력하면 category도 함께 생성

C) category 관리 전용 화면까지 포함

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
- [x] 관리자 route/state/auth/status/menu 정책을 확정한다.
- [x] `business-logic-model.md`를 생성한다.
- [x] `business-rules.md`를 생성한다.
- [x] `domain-entities.md`를 생성한다.
- [x] `frontend-components.md`를 생성한다.
- [x] PBT Testable Properties section을 포함한다.
- [x] Functional Design 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

Admin Operations Module은 dashboard total aggregation, order status transition, order deletion recalculation, history date filter, menu validation/reorder에 대해 테스트 가능한 속성을 식별해야 한다.

### Resiliency

주문 상태 변경 실패, 주문 삭제 실패, table completion 실패, dashboard/history/menu API 실패 시 명확한 실패 상태와 재시도 또는 보존 전략을 반영해야 한다.
