# Testing and Quality Functional Design 계획

## 목적

Testing and Quality Module의 테스트 전략, 공통 generator, 핵심 flow coverage, PBT seed/reproducibility, Build and Test 지침의 기능 설계를 정의한다.

## Unit Context

- **Unit**: Testing and Quality Module
- **의존 대상**: Foundation and Data, Customer Ordering, Admin Operations, Realtime Event
- **지원 스토리**:
  - US-CUST-003 장바구니 관리
  - US-CUST-004 주문 제출
  - US-ADMIN-002 실시간 주문 모니터링
  - US-ADMIN-004 테이블 세션 관리
  - US-ADMIN-005 주문 정정
  - US-ADMIN-007 메뉴 관리

## 현재 테스트 현황

- `npm test`: 최근 검증 기준 17개 test file, 59개 test 통과.
- `npx tsc --noEmit`: 통과.
- `npm run build`: local Node.js `18.17.1`이 Next.js 요구사항보다 낮아 시작 전 중단.
- 기존 공통 generator: `src/test/generators/domain-generators.ts`

## Planning Questions

## Question 1
Testing and Quality Module의 남은 구현 범위는 어떻게 둘까요?

A) 공통 generator 보강, 핵심 flow integration-style unit test, Build/Test 문서화를 중심으로 최소 보강

B) Playwright 기반 browser e2e까지 추가

C) 테스트는 이미 충분하므로 문서화만 수행

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
공통 domain generator는 어느 수준까지 확장할까요?

A) cart, menu item, order, session, realtime event generator를 `src/test/generators/`에 보강

B) 현재 generator를 유지하고 각 test file 내부 generator만 사용

C) fixture JSON 파일 중심으로 전환

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
핵심 flow test는 어떤 방식으로 설계할까요?

A) repository/API/helper 조합의 integration-style unit test로 customer order, admin table completion, realtime publish flow를 검증

B) UI component rendering test 중심으로 검증

C) 수동 QA checklist만 작성

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
PBT seed/reproducibility는 어떻게 문서화할까요?

A) Build and Test 지침에 Vitest/fast-check 실패 seed 확인과 재실행 방법을 명시

B) CI 설정 파일을 지금 생성해 seed를 고정

C) seed 문서화는 제외

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
Node.js 버전으로 막히는 build 검증은 어떻게 다룰까요?

A) Build/Test 문서에 Node.js `18.18.0` 이상 또는 `20.x` 이상 필요 조건과 현재 실패 원인을 명시

B) 프로젝트 dependency를 낮춰 현재 Node.js `18.17.1`에서 build되게 조정

C) build 검증은 제외

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
- [x] Testing and Quality 남은 구현 범위를 확정한다.
- [x] 공통 generator 범위를 확정한다.
- [x] 핵심 flow test 설계를 확정한다.
- [x] PBT seed/reproducibility 문서화 방식을 확정한다.
- [x] Node.js build prerequisite 처리 방식을 확정한다.
- [x] `business-logic-model.md`를 생성한다.
- [x] `business-rules.md`를 생성한다.
- [x] `domain-entities.md`를 생성한다.
- [x] PBT Testable Properties section을 포함한다.
- [x] Functional Design 완전성을 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

Testing and Quality Module은 활성화된 PBT 확장의 최종 품질 단위이므로 generator 품질, example test와 PBT의 보완 관계, seed 재현성 문서화가 핵심이다.

### Resiliency

Build/Test 지침은 실패 재시도, Node prerequisite, SSE reconnect 검증, snapshot recovery 수동 검증을 포함해야 한다.
