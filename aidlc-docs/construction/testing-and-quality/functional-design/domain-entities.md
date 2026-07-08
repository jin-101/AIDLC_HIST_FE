# 도메인 엔티티 - Testing and Quality

## 개요

Testing and Quality Module은 production domain entity를 추가하지 않는다. 이 단위의 도메인은 테스트와 검증을 구성하는 품질 엔티티이다.

## TestCoverageMap

| 필드 | 타입 | 설명 |
|---|---|---|
| `storyId` | `string` | 사용자 스토리 ID |
| `coverageType` | `example | pbt | integration-style | manual` | 검증 방식 |
| `artifactPath` | `string` | test file 또는 문서 경로 |
| `status` | `planned | implemented | verified` | 검증 상태 |

관계:

- 하나의 story는 여러 coverage artifact를 가질 수 있다.
- 하나의 test artifact는 여러 story를 지원할 수 있다.

## GeneratorCatalog

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | `string` | generator 이름 |
| `domainType` | `string` | 생성 대상 domain type |
| `constraints` | `string[]` | generator가 보장하는 business constraint |
| `usedBy` | `string[]` | 사용 test 파일 |

대상 generator:

- `cartItemArb`
- `cartStateArb`
- `menuItemArb`
- `orderItemInputArb`
- `orderWithItemsArb`
- `tableSessionArb`
- `realtimeEventArb`

## VerificationCommandSet

| 필드 | 타입 | 설명 |
|---|---|---|
| `name` | `string` | 검증 이름 |
| `command` | `string` | 실행 명령 |
| `prerequisite` | `string` | 실행 전 조건 |
| `expectedResult` | `string` | 기대 결과 |
| `knownLimitation` | `string | null` | 알려진 제약 |

기본 command:

- `npm test`
- `npx tsc --noEmit`
- `npm run build`
- 수동 browser verification checklist

## PbtReproducibilityGuide

| 필드 | 타입 | 설명 |
|---|---|---|
| `framework` | `string` | `fast-check` |
| `runner` | `string` | `Vitest` |
| `failureOutput` | `string` | 실패 시 seed/path 출력 위치 |
| `rerunCommand` | `string` | 재실행 명령 예시 |
| `notes` | `string[]` | 재현 시 주의사항 |

예상 내용:

- fast-check 실패 출력에서 seed와 path를 확인한다.
- 해당 test file만 Vitest로 재실행한다.
- 필요 시 실패한 seed를 test에 고정하거나 regression example로 승격한다.

## BuildPrerequisite

| 필드 | 타입 | 설명 |
|---|---|---|
| `runtime` | `string` | Node.js |
| `requiredVersion` | `string` | `18.18.0` 이상 또는 `20.x` 이상 |
| `currentObservedVersion` | `string` | local observation 기준 `18.17.1` |
| `impact` | `string` | `npm run build` 시작 전 중단 |
| `resolution` | `string` | Node.js upgrade 후 build 재실행 |

## ManualVerificationScenario

| 필드 | 타입 | 설명 |
|---|---|---|
| `scenarioId` | `string` | 수동 검증 ID |
| `precondition` | `string` | 사전 조건 |
| `steps` | `string[]` | 검증 절차 |
| `expectedResult` | `string` | 기대 결과 |
| `relatedStory` | `string` | 연결 story |

주요 scenario:

- 고객 주문 생성 후 관리자 dashboard realtime 갱신
- 신규 주문 highlight
- 테이블 완료 후 active order 제거
- SSE 연결 실패 상태에서 수동 새로고침 유지

## PBT Testable Properties

| Entity | 속성 |
|---|---|
| GeneratorCatalog | generator는 domain constraint를 만족하는 값만 생성한다. |
| TestCoverageMap | 지원 story는 하나 이상의 coverage artifact를 가진다. |
| VerificationCommandSet | known prerequisite가 있는 command는 문서에 제약을 포함한다. |
| PbtReproducibilityGuide | 실패 재현 정보는 framework와 runner를 모두 포함한다. |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. generator catalog, seed reproducibility, coverage map을 명시했다.
- **Resiliency**: 준수. build prerequisite와 manual recovery verification scenario를 품질 엔티티로 포함했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
