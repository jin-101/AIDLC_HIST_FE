# 기술 스택 결정 - Testing and Quality

## 선택 기술

| 관심사 | 결정 | 근거 |
|---|---|---|
| Test runner | Vitest | 기존 프로젝트 테스트가 Vitest로 구성되어 있고 TypeScript unit/PBT 실행에 적합하다. |
| PBT framework | fast-check | 활성화된 PBT 확장 요구사항이며 TypeScript와 Vitest에 적합하다. |
| Hook test utility | `@testing-library/react` | React hook과 component interaction 검증에 필요한 dev dependency이다. |
| DOM test environment | `jsdom@24.1.3` | 현재 Node.js 18 계열에서 동작 가능한 jsdom 버전을 사용한다. |
| Type check | TypeScript `tsc --noEmit` | build 전 type-level regression을 빠르게 잡는다. |
| Build tool | Next.js build | production build 검증 기준이다. Node.js prerequisite가 필요하다. |
| DB fixture | existing SQLite test fixture | repository integration-style unit test에 적합하다. |

## Dependency 결정

### Runtime dependency

새 runtime dependency는 추가하지 않는다.

기존 runtime dependency:

- `better-sqlite3`
- `next`
- `react`
- `react-dom`
- `uuid`

### Dev dependency

유지할 dev dependency:

- `vitest`
- `fast-check`
- `@testing-library/react`
- `jsdom@24.1.3`
- `typescript`
- `tsx`
- 기존 type packages

제외한 선택:

| 선택지 | 제외 이유 |
|---|---|
| Playwright | 현재 범위는 integration-style unit test와 수동 checklist로 충분하다. |
| MSW | API route와 repository/helper 검증 중심이라 별도 network mock이 과하다. |
| 모든 PBT seed 고정 | 다양한 입력 탐색과 shrinking 장점을 약화한다. |
| Next.js downgrade | build prerequisite 문제를 dependency downgrade로 해결하지 않는다. |

## Quality Gate 결정

| Gate | 명령 | Prerequisite |
|---|---|---|
| Test | `npm test` | `npm install` 완료 |
| TypeScript | `npx tsc --noEmit` | dependency 설치 완료 |
| Build | `npm run build` | Node.js `18.18.0` 이상 또는 `20.x` 이상 |

## PBT 재현성 결정

- fast-check 기본 seed 생성과 shrink 동작을 유지한다.
- 실패 시 출력되는 seed/path를 Build and Test 문서에 기록하도록 안내한다.
- 실패 test file만 대상으로 Vitest를 재실행하는 명령 예시를 제공한다.
- 발견된 최소 실패 입력은 가능한 경우 example-based regression test로 추가한다.

## Generator 결정

공통 generator 위치:

- `src/test/generators/domain-generators.ts`

보강 대상:

- cart item/cart state
- menu item/menu draft
- order/order item
- table session
- realtime event

설계 원칙:

- positive price/quantity 등 business constraint를 generator에 반영한다.
- 허용 enum/status/type만 생성한다.
- test file별 raw primitive generator 중복을 줄인다.
- generator 자체가 지나치게 복잡해지면 작은 domain별 export로 나눈다.

## Integration-Style Unit Test 결정

대상:

- customer order total consistency
- admin table completion dashboard exclusion
- realtime publish flow metadata

방식:

- UI browser e2e 대신 repository/API/helper 조합 수준에서 검증한다.
- SQLite test fixture를 사용한다.
- 테스트 간 database state를 격리한다.
- 속성 검증은 PBT와 조합하고, 핵심 happy path는 example-based test로 고정한다.

## Node.js Build Prerequisite 결정

- 현재 local observation: Node.js `18.17.1`
- Next.js requirement: `^18.18.0 || ^19.8.0 || >=20.0.0`
- 결정: dependency downgrade 없이 Node.js upgrade를 prerequisite로 문서화한다.
- Build and Test 단계에서 `npm run build`는 Node.js upgrade 후 실행해야 하는 검증으로 기록한다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. fast-check 유지, generator 보강, seed/path 재현성, example test 보완 전략을 기술 결정으로 확정했다.
- **Resiliency**: 준수. 품질 게이트, known limitation, recovery 수동 검증, 실패 재현 절차를 반영했다.
- **Security Baseline**: 사용자 결정에 따라 비활성화되어 적용하지 않는다.
