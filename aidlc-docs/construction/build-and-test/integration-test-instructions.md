# Integration Test Instructions

## 목적

unit 간 상호작용을 검증한다. 이 프로젝트는 별도 microservice가 아닌 local monolith 구조이므로, integration test는 repository/API/helper 조합과 in-memory 또는 local SQLite fixture 중심으로 수행한다.

## Test Environment

### Local Database

```bash
npm run db:init
```

테스트에서는 필요 시 in-memory SQLite 또는 임시 SQLite 파일을 사용한다.

## Integration Scenarios

### Scenario 1. Customer Ordering to Foundation/Data

설명:

- 고객 cart/order draft가 repository create input으로 변환 가능한지 검증한다.

관련 테스트:

- `src/features/orders/order-submit.test.ts`
- `src/server/repositories/repository-properties.test.ts`

검증 명령:

```bash
npm test
```

기대 결과:

- 주문 item line total 합과 total amount가 일치한다.
- quantity와 unit price가 양수 constraint를 만족한다.

### Scenario 2. Admin Table Completion to Dashboard

설명:

- active table session 완료 후 dashboard current orders에서 completed session 주문이 제외되는지 검증한다.

관련 테스트:

- `src/server/repositories/table-session-dashboard.test.ts`

검증 명령:

```bash
npx vitest run src/server/repositories/table-session-dashboard.test.ts
```

기대 결과:

- completion 전에는 dashboard에 주문이 표시된다.
- completion 후에는 active session이 없고 current orders가 비어 있다.

### Scenario 3. Realtime Event Publisher to Event Bus

설명:

- order/table event metadata가 SSE client로 전달되고, 실패 client가 다른 client delivery를 막지 않는지 검증한다.

관련 테스트:

- `src/server/events/event-publisher.test.ts`
- `src/server/events/event-bus.test.ts`

검증 명령:

```bash
npx vitest run src/server/events/event-publisher.test.ts src/server/events/event-bus.test.ts
```

기대 결과:

- `order-created`, `order-deleted`, `table-completed` metadata가 올바르다.
- failed client는 제거되고 healthy client delivery는 유지된다.

### Scenario 4. Admin Menu and Dashboard Helpers

설명:

- menu reorder, dashboard filtering, history filtering 같은 UI helper contract를 검증한다.

관련 테스트:

- `src/features/admin/menu-admin-helpers.test.ts`
- `src/features/admin/dashboard-mapper.test.ts`
- `src/features/admin/history-filter.test.ts`

검증 명령:

```bash
npm test
```

기대 결과:

- helper는 원본 배열을 불필요하게 mutation하지 않는다.
- dashboard total과 filter 결과가 invariant를 만족한다.

## Manual Integration Verification

browser realtime behavior는 다음 checklist로 보완한다.

- `aidlc-docs/construction/testing-and-quality/code/manual-verification-checklist.md`

## Cleanup

테스트가 임시 SQLite 파일을 사용한 경우 test process 종료 후 파일은 OS temp directory에 남을 수 있다. 반복 실행에는 영향을 주지 않도록 파일명에 process/time/random suffix를 포함한다.
