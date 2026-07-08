# Unit Test Execution

## 목적

모든 unit의 example-based test와 property-based test를 실행해 business logic, repository, API helper, realtime helper, UI hook behavior를 검증한다.

## Run Unit Tests

### 1. Execute All Unit Tests

```bash
npm test
```

현재 검증 결과:

- Test files: 19 passed
- Tests: 66 passed
- Status: Pass

### 2. Run Specific Test File

예시:

```bash
npx vitest run src/features/cart/cart-service.test.ts
```

PBT 실패를 재현할 때는 실패한 test file만 먼저 재실행한다.

### 3. Review Test Results

기대 결과:

- 모든 Vitest test 통과
- PBT 실패 없음
- seed/path가 출력된 경우 `pbt-reproducibility.md` 절차에 따라 재현

## 주요 Test Coverage

| 영역 | 대표 파일 |
|---|---|
| Foundation and Data | `src/server/repositories/repository-properties.test.ts` |
| Customer Ordering | `src/features/cart/cart-service.test.ts`, `src/features/orders/order-submit.test.ts` |
| Admin Operations | `src/features/admin/*.test.ts` |
| Realtime Event | `src/server/events/event-bus.test.ts`, `src/server/events/event-publisher.test.ts`, `src/features/realtime/*.test.ts` |
| Testing and Quality | `src/server/repositories/table-session-dashboard.test.ts`, `src/test/generators/domain-generators.ts` |

## PBT 재현성

상세 절차:

- `aidlc-docs/construction/testing-and-quality/code/pbt-reproducibility.md`

핵심 원칙:

- fast-check shrinking을 유지한다.
- 실패 시 seed/path를 기록한다.
- 최소 실패 입력은 가능한 경우 example-based regression test로 승격한다.

## Fix Failing Tests

1. 실패한 test file과 assertion을 확인한다.
2. PBT failure이면 seed/path를 기록한다.
3. business rule 또는 generator constraint 누락 여부를 확인한다.
4. code 또는 test generator를 수정한다.
5. `npm test`를 재실행한다.
