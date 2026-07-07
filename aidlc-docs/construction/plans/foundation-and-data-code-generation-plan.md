# Foundation and Data Code Generation 계획

## 목적

Foundation and Data Module의 실제 애플리케이션 코드, 테스트, 코드 산출물 요약을 생성하기 위한 실행 계획이다.
이 계획은 Foundation and Data Code Generation의 단일 기준 문서이며, 승인 후 이 순서대로만 코드를 생성한다.

## Unit Context

- **Unit**: Foundation and Data Module
- **프로젝트 유형**: Greenfield 단일 Next.js 애플리케이션
- **Workspace Root**: `/Users/jhan/Desktop/test/ai-dlc/angular-study`
- **애플리케이션 코드 위치**: workspace root
- **문서 위치**: `aidlc-docs/` 아래

## 구현 범위

Foundation and Data Module은 다음 기반을 생성한다.

- Next.js + TypeScript 프로젝트 기본 설정.
- SQLite database connection, schema initialization, seed data.
- domain type 정의.
- API response helper와 error mapper.
- direct SQL repository layer.
- transaction helper.
- Vitest + `fast-check` 테스트 기반.
- Foundation module 코드 요약 문서.

## Story Traceability

Foundation and Data Module은 다음 user story를 지원한다.

- US-CUST-001
- US-CUST-002
- US-CUST-004
- US-CUST-005
- US-ADMIN-001
- US-ADMIN-002
- US-ADMIN-003
- US-ADMIN-004
- US-ADMIN-005
- US-ADMIN-006
- US-ADMIN-007

이 unit은 위 story의 persisted data, repository, shared type, API helper 기반을 제공한다.

## Unit Dependencies

- upstream dependency 없음.
- Customer, Admin, Realtime, Testing unit이 이 unit에 의존한다.

## 생성 대상 경로

### 애플리케이션 코드

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `vitest.config.ts`
- `src/lib/types/domain.ts`
- `src/lib/api/response.ts`
- `src/lib/api/errors.ts`
- `src/server/db/connection.ts`
- `src/server/db/schema.ts`
- `src/server/db/seed.ts`
- `src/server/db/init.ts`
- `src/server/db/transaction.ts`
- `src/server/repositories/store-repository.ts`
- `src/server/repositories/table-repository.ts`
- `src/server/repositories/session-repository.ts`
- `src/server/repositories/menu-repository.ts`
- `src/server/repositories/order-repository.ts`
- `src/server/repositories/history-repository.ts`
- `src/server/repositories/admin-credential-repository.ts`
- `src/test/generators/domain-generators.ts`
- `src/test/fixtures/test-db.ts`
- `src/lib/api/response.test.ts`
- `src/server/repositories/repository-properties.test.ts`

### 문서

- `aidlc-docs/construction/foundation-and-data/code/code-summary.md`

## 실행 단계

- [x] **Step 1: 프로젝트 설정 생성**
  - `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`를 생성한다.
  - `better-sqlite3`, `uuid`, `vitest`, `fast-check`, TypeScript 관련 dependency를 명시한다.

- [x] **Step 2: 공유 domain type 생성**
  - `src/lib/types/domain.ts`를 생성한다.
  - Store, Table, TableSession, MenuCategory, MenuItem, Order, OrderItem, AdminCredential, API 입력 type을 정의한다.

- [x] **Step 3: API response helper와 error mapper 생성**
  - `src/lib/api/response.ts`와 `src/lib/api/errors.ts`를 생성한다.
  - `ApiSuccess`, `ApiFailure`, `ApiResult`, `ok`, `fail`, stable error code를 구현한다.

- [x] **Step 4: SQLite connection과 schema 생성**
  - `src/server/db/connection.ts`, `schema.ts`, `init.ts`를 생성한다.
  - `stores`, `tables`, `table_sessions`, `menu_categories`, `menu_items`, `orders`, `order_items`, `admin_credentials` table을 정의한다.
  - 필요한 unique constraint와 index를 포함한다.

- [x] **Step 5: seed data와 transaction helper 생성**
  - `src/server/db/seed.ts`, `transaction.ts`를 생성한다.
  - store 1개, table 4개, category 3개, menu item 8개, admin password 1개를 deterministic하게 seed한다.

- [x] **Step 6: repository layer 생성**
  - 모든 repository 파일을 생성한다.
  - 직접 SQL과 row-to-domain mapping을 repository에 캡슐화한다.
  - 사용자 입력값은 parameterized statement를 사용한다.

- [x] **Step 7: 테스트 generator와 fixture 생성**
  - `src/test/generators/domain-generators.ts`를 생성한다.
  - `src/test/fixtures/test-db.ts`를 생성한다.
  - `fast-check` domain-specific generator와 isolated test DB fixture를 제공한다.

- [x] **Step 8: API helper unit/PBT 테스트 생성**
  - `src/lib/api/response.test.ts`를 생성한다.
  - response wrapper payload 보존 속성과 example-based test를 포함한다.

- [x] **Step 9: repository property 테스트 생성**
  - `src/server/repositories/repository-properties.test.ts`를 생성한다.
  - order total, session status, active/completed query, menu reorder, row mapping 관련 PBT/example test를 포함한다.

- [x] **Step 10: 코드 요약 문서 생성**
  - `aidlc-docs/construction/foundation-and-data/code/code-summary.md`를 생성한다.
  - 생성 파일, 책임, 테스트 범위, 후속 unit 의존 사항을 한국어로 요약한다.

- [x] **Step 11: 계획 체크박스 및 상태 갱신**
  - 완료된 모든 step을 `[x]`로 표시한다.
  - `aidlc-state.md`를 Foundation and Data Code Generation Review 상태로 갱신한다.

## PBT 적용 계획

- `fast-check`를 사용한다.
- domain-specific generator를 만든다.
- shrinking과 seed 재현성은 Vitest 기본 출력과 Build and Test 문서에서 다룬다.
- PBT는 example-based test를 대체하지 않고 보완한다.

## Resiliency 적용 계획

- transaction helper로 multi-step write의 부분 실패를 방지한다.
- structured error mapping으로 실패 유형을 안정적으로 표현한다.
- SQLite file backup/restore는 Build and Test 문서에서 수동 절차로 다룬다.
- local prototype 범위에서 multi-zone, auto-scaling, chaos testing은 N/A이다.

## 승인 기준

이 계획이 승인되면 실제 코드 생성을 시작한다.
승인 전에는 application code를 생성하지 않는다.
