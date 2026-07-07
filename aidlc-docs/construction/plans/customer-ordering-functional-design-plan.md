# Customer Ordering Functional Design 계획

## 목적

Customer Ordering Module의 고객용 table tablet flow, localStorage 상태, cart 계산, order submit, 현재 session order history의 기능 설계를 정의한다.

## Unit Context

- **Unit**: Customer Ordering Module
- **의존 대상**: Foundation and Data Module
- **소유 스토리**:
  - US-CUST-001 테이블 자동 로그인
  - US-CUST-002 카테고리별 메뉴 탐색
  - US-CUST-003 장바구니 관리
  - US-CUST-004 주문 제출
  - US-CUST-005 현재 세션 주문 내역 조회

## Planning Questions

## Question 1
고객 화면 route 구조는 어떻게 구성할까요?

A) `/customer/setup`, `/customer/menu`, `/customer/cart`, `/customer/orders`로 명시적으로 분리

B) `/customer` 단일 화면에서 내부 tab/state로 setup/menu/cart/orders를 전환

C) `/customer/menu` 중심으로 두고 cart와 orders는 modal/drawer로 표시

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
cart localStorage 저장 형태는 어떻게 할까요?

A) `{ tableContext, items, updatedAt }` 형태로 table context와 cart items를 함께 저장

B) table context와 cart를 별도 key로 분리 저장

C) cart items만 저장하고 table context는 매번 API로 확인

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
주문 성공 후 5초 redirect는 어떻게 설계할까요?

A) 성공 화면을 표시하고 5초 timer 후 `/customer/menu`로 이동

B) toast만 표시하고 즉시 menu 화면으로 이동

C) 성공 화면에 직접 돌아가기 버튼만 제공하고 자동 이동은 제외

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
주문 실패 시 cart 보존은 어느 수준으로 할까요?

A) localStorage cart를 그대로 유지하고 오류 메시지만 표시

B) 실패 응답을 별도 retry state로 저장하고 재시도 버튼을 제공

C) cart 유지 없이 오류만 표시

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Recommended Prototype Answers

- Question 1: A
- Question 2: B
- Question 3: A
- Question 4: A

## Execution Checklist

- [x] 모든 planning question 답변 완료 여부를 검증한다.
- [x] 답변의 모호성 또는 모순을 분석한다.
- [x] 고객 route/state/cart 설계 방향을 확정한다.
- [x] `business-logic-model.md`를 생성한다.
- [x] `business-rules.md`를 생성한다.
- [x] `domain-entities.md`를 생성한다.
- [x] `frontend-components.md`를 생성한다.
- [x] PBT Testable Properties section을 포함한다.
- [x] Functional Design 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

Customer Ordering Module은 cart total, quantity update, order payload shaping, localStorage serialization에 대해 테스트 가능한 속성을 식별해야 한다.

### Resiliency

주문 실패 시 cart 보존, API 실패 메시지 표시, 현재 session history 조회 실패 처리 등 고객 경험에 직접 영향을 주는 복원력 요구를 반영해야 한다.
