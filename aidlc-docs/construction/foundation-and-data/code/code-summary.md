# Foundation and Data 코드 생성 요약

## 생성 범위

Foundation and Data Module의 애플리케이션 기반 코드를 생성했다.

## 생성 파일

### 프로젝트 설정

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `vitest.config.ts`

### 공유 타입 및 API helper

- `src/lib/types/domain.ts`
- `src/lib/api/response.ts`
- `src/lib/api/errors.ts`

### SQLite 기반

- `src/server/db/connection.ts`
- `src/server/db/schema.ts`
- `src/server/db/seed.ts`
- `src/server/db/init.ts`
- `src/server/db/transaction.ts`

### Repository 계층

- `src/server/repositories/row-mappers.ts`
- `src/server/repositories/store-repository.ts`
- `src/server/repositories/table-repository.ts`
- `src/server/repositories/session-repository.ts`
- `src/server/repositories/menu-repository.ts`
- `src/server/repositories/order-repository.ts`
- `src/server/repositories/history-repository.ts`
- `src/server/repositories/admin-credential-repository.ts`

### 테스트 기반

- `src/test/generators/domain-generators.ts`
- `src/test/fixtures/test-db.ts`
- `src/lib/api/response.test.ts`
- `src/server/repositories/repository-properties.test.ts`

## 반영된 설계

- SQLite는 `better-sqlite3`로 접근한다.
- 모든 주요 ID는 text UUID이다.
- 직접 SQL은 repository 계층에 캡슐화했다.
- multi-step write는 transaction helper를 사용한다.
- API response helper는 `{ ok: true, data }` / `{ ok: false, error }` 형태를 제공한다.
- seed data는 demo store, table 4개, category 3개, menu item 8개, admin password를 생성한다.

## 테스트 범위

- API response helper example-based test.
- API response payload 보존 PBT.
- order total invariant PBT.
- session status allowed value PBT.
- menu reorder model PBT.
- completed session 제외 모델 PBT.

## 후속 unit 의존 사항

- Customer Ordering Module은 menu/order/session repository와 domain type을 사용한다.
- Admin Operations Module은 dashboard, table, menu, history repository를 사용한다.
- Realtime Event Module은 order/table mutation 후 event publication을 연결한다.
- Build and Test 단계에서 실제 dependency install 후 test 실행과 seed 재현성 검증이 필요하다.
