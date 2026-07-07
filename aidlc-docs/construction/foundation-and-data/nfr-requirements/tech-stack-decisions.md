# 기술 스택 결정 - Foundation and Data

## 선택 기술

| 관심사 | 결정 | 근거 |
|---|---|---|
| Application framework | Next.js | 이미 승인된 애플리케이션 아키텍처. |
| Language | TypeScript | domain model과 repository 경계를 type-safe하게 유지. |
| Database | SQLite | 가벼운 local prototype persisted storage. |
| SQLite library | `better-sqlite3` | local prototype과 direct SQL repository에 적합한 단순 synchronous API. |
| Data access style | Direct SQL repository functions | ORM 부담 없이 prototype을 가볍게 유지. |
| Test runner | Vitest | TypeScript 지원이 좋고 Next.js 스타일 코드와 통합이 단순함. |
| Property-based testing | `fast-check` | 활성화된 PBT 확장 요구사항. custom generator, shrinking, reproducibility 지원. |

## Dependency 기대사항

Runtime dependencies:

- `better-sqlite3`
- `uuid` 또는 동등한 UUID generation 지원

Development/test dependencies:

- `vitest`
- `fast-check`
- 필요한 runtime dependency type definition

## Repository Pattern

Repository module은 모든 SQL을 소유한다.

예상 repository 영역:

- `storeRepository`
- `tableRepository`
- `sessionRepository`
- `menuRepository`
- `orderRepository`
- `historyRepository`
- `adminCredentialRepository`

## API Response Helper

공유 helper type:

```ts
type ApiSuccess<T> = { ok: true; data: T };
type ApiFailure = { ok: false; error: { code: string; message: string } };
type ApiResult<T> = ApiSuccess<T> | ApiFailure;
```

## PBT Framework 결정

TypeScript property-based testing에는 `fast-check`를 사용한다.

필수 capability:

- domain-specific generator.
- automatic shrinking.
- seed-based reproducibility.
- Vitest 통합.

## Local Prototype 제약

- `better-sqlite3`의 synchronous database call은 local prototype에 적합하다.
- 향후 production 또는 multi-instance scenario에서는 database access와 eventing 재설계가 필요할 수 있다.
- MVP 단계의 backup/restore는 자동 script가 아니라 문서화된 절차로 둔다.
