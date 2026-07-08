# Testing and Quality Code Generation 계획

## 목적

Testing and Quality Module의 설계 산출물을 실제 테스트 코드, 공통 generator, 품질 검증 문서로 구현한다. 이 계획은 Code Generation Part 2의 단일 실행 기준이다.

## Unit Context

- **Unit**: Testing and Quality Module
- **Workspace Root**: `/Users/jhan/Desktop/test/ai-dlc/angular-study`
- **Project Type**: Greenfield monolith, 현재 Next.js/Vitest 코드 구조 존재
- **애플리케이션 코드 위치**: workspace root의 `src/` 아래
- **문서 위치**: `aidlc-docs/construction/testing-and-quality/code/`
- **Runtime dependency 정책**: 새 runtime dependency 추가 없음
- **Test framework**: Vitest
- **PBT framework**: fast-check

## Story Traceability

| Story | Testing and Quality 책임 | 구현 계획 |
|---|---|---|
| US-CUST-003 | 장바구니 상태 전이와 total invariant 검증 | cart/menu generator 보강 및 cart PBT 개선 |
| US-CUST-004 | 주문 제출 payload, total consistency, realtime `order-created` publication 검증 | 주문 통합형 테스트 추가 |
| US-ADMIN-002 | 실시간 주문 모니터링 helper/event 검증 | realtime publisher/event metadata 테스트 추가 |
| US-ADMIN-004 | table completion 후 dashboard current orders 제외 검증 | table completion repository/dashboard 테스트 추가 |
| US-ADMIN-005 | 주문 삭제 후 total 재계산과 `order-deleted` publication 검증 | 삭제/이벤트 검증은 기존 admin/realtime 테스트와 code summary에 연결 |
| US-ADMIN-007 | menu validation과 reorder invariant 검증 | 기존 menu-admin test와 generator catalog 추적 |

## Dependencies and Interfaces

### 기존 코드 의존성

- `src/test/generators/domain-generators.ts`
- `src/features/cart/cart-service.ts`
- `src/features/cart/cart-service.test.ts`
- `src/features/orders/order-submit.test.ts`
- `src/features/admin/dashboard-mapper.test.ts`
- `src/features/realtime/realtime-event-helpers.test.ts`
- `src/server/events/event-publisher.ts`
- `src/server/events/event-bus.ts`
- `src/server/repositories/order-repository.ts`
- `src/server/repositories/session-repository.ts`
- `src/test/fixtures/test-db.ts`

### 외부/도구 의존성

- `vitest`
- `fast-check`
- `@testing-library/react`
- `jsdom@24.1.3`
- `typescript`

### Service Boundary

Testing and Quality Module은 production runtime behavior를 새로 소유하지 않는다. 기존 domain/service/repository/realtime interface를 검증하는 테스트와 문서만 추가 또는 수정한다.

## Part 1 Planning Checklist

- [x] Unit design artifacts를 읽고 code generation 준비 상태를 검증한다.
- [x] Unit story map을 읽고 supporting story를 확인한다.
- [x] workspace root와 코드 위치 규칙을 확인한다.
- [x] 기존 테스트 구조와 generator 파일을 확인한다.
- [x] 새 runtime dependency를 추가하지 않는 계획으로 확정한다.
- [x] Code Generation Part 2 실행 단계를 정의한다.

## Part 2 Generation Checklist

### Step 1. 공통 Domain Generator 보강

- [x] `src/test/generators/domain-generators.ts`에 domain-specific generator를 추가한다.
- [x] `cartItemArb`, `cartStateArb`, `menuItemArb`, `orderWithItemsArb`, `tableSessionArb`, `realtimeEventArb`를 기존 export와 호환되게 설계한다.
- [x] 가격, 수량, status, event type constraint를 generator에 반영한다.
- [x] production code가 test generator에 의존하지 않도록 유지한다.

관련 규칙:

- TQ-RULE-010~TQ-RULE-014
- PBT-07

### Step 2. 장바구니 PBT 개선

- [x] `src/features/cart/cart-service.test.ts`의 raw primitive generator 사용을 공통 generator 기반으로 개선한다.
- [x] cart total invariant와 order draft total consistency를 유지한다.
- [x] example-based test는 유지하고 PBT는 보완 역할로 유지한다.

관련 스토리:

- US-CUST-003

관련 규칙:

- TQ-RULE-002
- PBT-03
- PBT-10

### Step 3. 주문 제출 통합형 테스트 보강

- [x] `src/features/orders/order-submit.test.ts`에 order draft와 generated order item input 기반 total consistency 검증을 추가한다.
- [x] 주문 payload가 line total과 total amount invariant를 만족하는지 검증한다.
- [x] 기존 cart mutation regression test를 유지한다.

관련 스토리:

- US-CUST-004

관련 규칙:

- TQ-RULE-003
- PBT-03
- PBT-10

### Step 4. Table Completion Dashboard 테스트 추가

- [x] table completion 후 completed session 주문이 dashboard current orders에서 제외되는 integration-style unit test를 추가한다.
- [x] 대상 파일은 기존 repository fixture 패턴에 맞춰 `src/server/repositories/repository-properties.test.ts`를 확장하거나, 필요 시 `src/server/repositories/table-session-dashboard.test.ts`를 생성한다.
- [x] SQLite test fixture를 사용하고 테스트 간 DB state를 격리한다.

관련 스토리:

- US-ADMIN-004

관련 규칙:

- TQ-RULE-005
- TQ-RULE-044
- RESILIENCY-14

### Step 5. Realtime Publish Flow 테스트 추가

- [x] `src/server/events/event-publisher.test.ts`를 생성해 `order-created`, `order-deleted`, `table-completed` event metadata를 검증한다.
- [x] failed publish가 caller를 깨뜨리지 않는 safe publish behavior를 검증한다.
- [x] realtime event generator를 사용할 수 있는 경우 PBT를 함께 적용한다.

관련 스토리:

- US-CUST-004
- US-ADMIN-002
- US-ADMIN-005

관련 규칙:

- TQ-RULE-004
- TQ-RULE-006
- RESILIENCY-10

### Step 6. PBT 재현성 및 수동 검증 문서 생성

- [x] `aidlc-docs/construction/testing-and-quality/code/pbt-reproducibility.md`를 생성한다.
- [x] fast-check seed/path 확인 방법과 실패 test file 재실행 예시를 작성한다.
- [x] `aidlc-docs/construction/testing-and-quality/code/manual-verification-checklist.md`를 생성한다.
- [x] realtime status, dashboard snapshot, 신규 주문 highlight, table completion 수동 검증 절차를 작성한다.

관련 규칙:

- TQ-RULE-022
- TQ-RULE-023
- TQ-RULE-040~TQ-RULE-044
- PBT-08
- RESILIENCY-14

### Step 7. Code Summary 생성

- [x] `aidlc-docs/construction/testing-and-quality/code/code-summary.md`를 생성한다.
- [x] 수정/생성 파일 목록, story coverage, PBT compliance, Resiliency compliance, known limitation을 요약한다.
- [x] Node.js `18.18.0` 이상 또는 `20.x` 이상 build prerequisite을 명시한다.

관련 규칙:

- TQ-RULE-030~TQ-RULE-034
- PBT-09
- RESILIENCY-03~RESILIENCY-04

### Step 8. 검증 실행

- [x] `npm test`를 실행한다.
- [x] `npx tsc --noEmit`을 실행한다.
- [x] `npm run build`는 현재 Node.js prerequisite 충족 여부를 확인하고, Node.js `18.17.1`이면 known limitation으로 기록한다.
- [x] 실패가 있으면 코드 또는 문서를 수정하고 관련 체크박스를 완료 상태로 갱신한다.

관련 규칙:

- TQ-RULE-030~TQ-RULE-034
- PBT-08
- RESILIENCY-14

## Completion Criteria

- 모든 Part 2 Generation Checklist 항목이 `[x]`로 갱신된다.
- 신규/수정 테스트는 `npm test`에서 통과한다.
- TypeScript compile은 `npx tsc --noEmit`에서 통과한다.
- Build prerequisite 상태가 code summary와 Build/Test 산출물로 이어질 수 있게 기록된다.
- Testing and Quality Module code summary가 한국어로 생성된다.

## Extension Compliance Plan

### Property-Based Testing

- PBT-07: domain-specific generator catalog를 보강한다.
- PBT-08: seed/path 재현 절차를 문서화한다.
- PBT-10: example-based test와 PBT를 함께 유지한다.
- PBT-02~PBT-06: 적용 가능한 invariant/stateful/round-trip 검증을 기존 테스트와 신규 테스트에 연결한다.

### Resiliency

- RESILIENCY-10: failed client isolation과 snapshot fallback 검증을 테스트와 checklist에 반영한다.
- RESILIENCY-14: local resiliency mechanism을 자동 테스트와 수동 checklist로 검증한다.
- RESILIENCY-03~RESILIENCY-04: CI/CD 구현 대신 반복 가능한 local quality gate 명령을 문서화한다.

### Security Baseline

Security Baseline은 비활성화되어 적용하지 않는다. 테스트 fixture에는 실제 credential이나 production data를 포함하지 않는다.
