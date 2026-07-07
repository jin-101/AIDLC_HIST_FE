# 논리 컴포넌트 - Foundation and Data NFR Design

## 개요

Foundation and Data Module의 NFR 설계는 다음 논리 컴포넌트로 구성된다.

| 컴포넌트 | 책임 |
|---|---|
| SQLite Connection Provider | `better-sqlite3` database connection 제공 |
| Schema Initializer | table 생성과 schema 초기화 |
| Seed Data Loader | deterministic seed data 삽입 |
| Repository Layer | SQL 실행과 row/domain mapping |
| Transaction Helper | multi-step write transaction 실행 |
| API Response Helper | 성공/실패 응답 형태 표준화 |
| Error Mapper | 내부 error를 구조화된 API error로 변환 |
| PBT Generator Set | domain-specific test input 생성 |
| Backup/Restore Documentation | 수동 backup/restore 절차 문서화 대상 |

## SQLite Connection Provider

책임:

- SQLite database file 경로를 관리한다.
- `better-sqlite3` connection을 생성한다.
- repository layer가 같은 connection provider를 사용하도록 한다.

설계 메모:

- local prototype에서는 singleton-style provider가 적합하다.
- test에서는 별도 temporary database 또는 isolated file을 사용할 수 있어야 한다.

## Schema Initializer

책임:

- `stores`, `tables`, `table_sessions`, `menu_categories`, `menu_items`, `orders`, `order_items`, `admin_credentials` table을 생성한다.
- 필요한 unique constraint와 index를 정의한다.

권장 constraint:

- `stores.code` unique.
- `(tables.store_id, tables.number)` unique.
- table은 최대 하나의 active session을 갖도록 application rule과 query로 보장.

## Seed Data Loader

책임:

- default store 1개.
- table 4개.
- category 3개.
- menu item 8개.
- admin password 1개.

설계 메모:

- seed는 idempotent해야 한다.
- stable `store.code`로 seed 여부를 판단한다.

## Repository Layer

책임:

- SQL 실행.
- row-to-domain mapping.
- not-found/null 결과 표현.
- service에 persistence detail을 숨긴다.

Repository 목록:

- `storeRepository`
- `tableRepository`
- `sessionRepository`
- `menuRepository`
- `orderRepository`
- `historyRepository`
- `adminCredentialRepository`

## Transaction Helper

책임:

- transaction 실행 wrapper 제공.
- commit/rollback 경계를 명확히 한다.
- 실패 시 typed persistence error를 반환하거나 throw한다.

적용 workflow:

- order 생성.
- table completion.
- order deletion.

## API Response Helper

책임:

- 성공 응답 생성.
- 실패 응답 생성.
- route handler 간 응답 형태 통일.

형태:

```ts
type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };
```

## Error Mapper

책임:

- validation, not-found, conflict, persistence error를 stable code로 mapping한다.
- SQL 내부 error detail을 client 응답에서 제거한다.

권장 mapping:

| 내부 상황 | API code |
|---|---|
| 필수 field 누락 | `VALIDATION_ERROR` |
| 조회 대상 없음 | `NOT_FOUND` |
| active session 중복 등 충돌 | `CONFLICT` |
| SQLite write/read 실패 | `PERSISTENCE_ERROR` |
| 예기치 못한 실패 | `UNKNOWN_ERROR` |

## PBT Generator Set

책임:

- `fast-check`용 domain generator 제공.
- menu item, order item, cart/order total, session status, API result payload를 생성한다.

설계 메모:

- generator는 domain constraint를 지켜야 한다.
- price와 quantity는 양의 정수 범위로 제한한다.
- session status는 allowed values만 생성한다.

## Backup/Restore Documentation

책임:

- Build and Test 단계에서 수동 절차로 문서화한다.
- DB 파일 복사, 복원, 검증 절차를 포함한다.

## NFR Design 준수 요약

### PBT

- **PBT-09**: `fast-check` 선택을 논리 컴포넌트와 test generator 설계에 반영했다.
- **PBT-07**: domain-specific generator set을 설계했다.
- **PBT-08**: seed/reproducibility는 Build and Test에서 실행 지침으로 문서화한다.
- **PBT-10**: example-based test와 PBT를 함께 사용하도록 설계했다.

### Resiliency

- transaction helper, structured error mapping, backup/restore 문서화로 local prototype 범위의 복원력 요구를 반영했다.
- multi-zone, auto-scaling, centralized monitoring, chaos testing은 local MVP 범위에서는 N/A로 유지한다.

