# Admin Operations NFR Requirements 계획

## 목적

Admin Operations Module의 관리자 업무 화면에 필요한 성능, 신뢰성, 복원력, 사용성, 유지보수성, 테스트 요구사항과 기술 결정을 정리한다.

## Unit Context

- **Unit**: Admin Operations Module
- **선행 산출물**: `aidlc-docs/construction/admin-operations/functional-design/`
- **주요 흐름**:
  - 관리자 로그인과 sessionStorage 세션
  - dashboard snapshot과 table card 조회
  - 주문 상태 변경과 주문 삭제
  - table setup과 table usage completion
  - completed session history 조회
  - menu CRUD와 reorder

## Planning Questions

## Question 1
관리자 dashboard의 local prototype 성능 목표는 어느 수준으로 둘까요?

A) dashboard snapshot API는 일반 조건에서 500ms 이내, status/delete/table/menu mutation은 500ms 이내 목표

B) API 응답 1초 이내면 충분하며 mutation별 목표는 별도로 두지 않음

C) 정량 목표 없이 정상 동작 중심으로 정의

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
Realtime Event Module 통합 전 dashboard 갱신 방식은 어떻게 둘까요?

A) 수동 새로고침 버튼과 mutation 성공 후 snapshot 재조회

B) 5초 polling으로 자동 갱신

C) 사용자가 페이지를 새로고침할 때만 갱신

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
관리자 mutation 실패 시 UI state 보존 수준은 어떻게 둘까요?

A) 기존 snapshot/form 값을 유지하고 오류 메시지와 재시도 동작을 제공

B) 실패 시 관련 화면을 자동 재조회해서 서버 상태로 덮어씀

C) 오류 toast만 표시하고 별도 보존 규칙은 두지 않음

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
관리자 화면 접근성/사용성 기준은 어느 수준으로 둘까요?

A) 44px 이상 주요 조작 타깃, 명확한 loading/error/disabled/focus 상태, dashboard scan이 쉬운 compact layout

B) 기본 HTML 접근성만 준수하고 dashboard 밀도 기준은 제외

C) 프로토타입이므로 접근성 기준은 별도 정의하지 않음

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Recommended Prototype Answers

- Question 1: A
- Question 2: A
- Question 3: A
- Question 4: A

## Execution Checklist

- [x] 모든 planning question 답변 완료 여부를 검증한다.
- [x] 답변의 모호성 또는 모순을 분석한다.
- [x] 성능, 갱신, mutation failure, 사용성, 테스트 요구사항을 확정한다.
- [x] `nfr-requirements.md`를 생성한다.
- [x] `tech-stack-decisions.md`를 생성한다.
- [x] PBT와 Resiliency 활성화 규칙 반영 여부를 검증한다.
- [x] NFR Requirements 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

Admin Operations Module의 dashboard total aggregation, status transition helper, deletion recalculation, history date filtering, menu validation/reorder는 후속 Code Generation과 Build and Test에서 `fast-check` 기반 테스트 대상으로 추적한다.

### Resiliency

dashboard 조회 실패, mutation 실패, table completion 실패, history/menu 조회 실패에서 기존 state 보존, 오류 표시, 재시도 동작을 NFR 요구사항으로 명시해야 한다.
