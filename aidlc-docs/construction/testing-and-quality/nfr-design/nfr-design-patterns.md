# NFR 설계 패턴 - Testing and Quality

## 범위

이 문서는 Testing and Quality Module의 NFR 요구사항을 설계 패턴으로 구체화한다. 대상은 Vitest 기반 unit/PBT test, fast-check 재현성, integration-style unit test, 품질 게이트, Node.js build prerequisite, realtime 복원력 검증이다.

## 설계 결정 요약

| 영역 | 설계 결정 |
|---|---|
| 복원력 | SSE recovery, snapshot fallback, failed client isolation을 자동 테스트와 수동 checklist로 검증한다. |
| 확장성 | 로컬 MVP 기준으로 generator 재사용, 테스트 격리, 품질 게이트 순서만 설계한다. |
| 성능 | 빠른 unit/PBT 중심으로 유지하고 browser e2e는 현재 범위에서 제외한다. |
| 보안 | Security Baseline은 비활성화 상태를 유지하되 test fixture 데이터 보호 규칙은 적용한다. |
| 논리 컴포넌트 | generator catalog, integration-style test harness, PBT reproducibility guide, quality gate runner, manual verification checklist로 구성한다. |

## 복원력 패턴

### SSE Recovery Verification

- `EventSource` 연결 실패 상태를 테스트 가능한 상태 전이로 분리한다.
- 실패 이벤트는 monitor state에 반영되어야 하며, UI는 수동 새로고침이나 snapshot 조회로 복구 가능해야 한다.
- malformed realtime event는 전체 stream 처리를 깨뜨리지 않고 무시되어야 한다.
- 고객 주문 생성 후 dashboard snapshot이 갱신되는 경로를 수동 checklist로 검증한다.

적용 규칙:

- TQ-RULE-004
- TQ-RULE-040
- TQ-RULE-041
- TQ-RULE-043
- RESILIENCY-10
- RESILIENCY-14

### Snapshot Fallback Verification

- realtime stream이 실패하거나 지연될 때 dashboard snapshot API가 최신 상태를 다시 가져오는 fallback 역할을 한다.
- 자동 테스트는 repository/API/helper contract를 검증하고, browser realtime 체감은 수동 checklist로 보완한다.
- 수동 checklist는 고객 주문 생성, 신규 주문 highlight, table completion 후 active order 제거를 포함한다.

적용 규칙:

- TQ-RULE-040
- TQ-RULE-041
- TQ-RULE-042
- TQ-RULE-044
- RESILIENCY-14

### Failed Client Isolation

- 하나의 SSE client publish 실패가 다른 client delivery를 막지 않아야 한다.
- realtime publish helper는 failed client cleanup과 정상 client delivery를 분리해서 검증한다.
- 이 패턴은 production infrastructure circuit breaker 대신 local in-process event bus 격리 패턴으로 다룬다.

적용 규칙:

- TQ-RULE-004
- RESILIENCY-10

## 확장성 패턴

### Generator Reuse Pattern

- domain-specific generator는 `src/test/generators/domain-generators.ts`에 모은다.
- 각 generator는 business constraint를 반영한다.
- test file별 raw primitive generator 중복을 줄인다.
- generator가 복잡해지면 domain별 export로 나누되 runtime dependency는 추가하지 않는다.

적용 대상:

- `cartItemArb`
- `cartStateArb`
- `menuItemArb`
- `orderItemInputArb`
- `orderWithItemsArb`
- `tableSessionArb`
- `realtimeEventArb`

적용 규칙:

- TQ-RULE-010~TQ-RULE-014
- PBT-07

### Test Isolation Pattern

- integration-style unit test는 SQLite test fixture를 사용하고 테스트 간 database state를 격리한다.
- 테스트 순서에 의존하지 않도록 setup/cleanup 책임을 test harness에 둔다.
- queue, cache, distributed worker는 현재 local MVP 범위에서 제외한다.

적용 규칙:

- RESILIENCY-09: local MVP에는 N/A. 별도 autoscaling 또는 capacity component를 설계하지 않는다.
- RESILIENCY-10: in-process dependency isolation 관점에서 일부 적용한다.

## 성능 패턴

### Fast Feedback Test Suite

- 기본 검증 명령은 `npm test`이다.
- 로컬 MVP 기준 전체 test suite는 60초 이내 완료를 목표로 한다.
- PBT run 수를 임의로 과도하게 줄이지 않고 fast-check 기본 설정과 shrinking을 유지한다.
- browser e2e는 현재 범위에서 제외하고 수동 checklist로 보완한다.

적용 규칙:

- TQ-RULE-030
- PBT-08
- PBT-10

### Quality Gate Ordering

품질 게이트는 빠른 실패 확인에서 production readiness 확인 순서로 실행한다.

| 순서 | Gate | 명령 | Prerequisite |
|---|---|---|---|
| 1 | Unit/PBT test | `npm test` | dependency 설치 완료 |
| 2 | TypeScript compile | `npx tsc --noEmit` | dependency 설치 완료 |
| 3 | Production build | `npm run build` | Node.js `18.18.0` 이상 또는 `20.x` 이상 |

현재 local known limitation:

- Node.js `18.17.1`에서는 Next.js build가 시작 전 중단된다.
- 이 실패는 코드 실패가 아니라 runtime prerequisite 미충족으로 기록한다.

적용 규칙:

- TQ-RULE-030~TQ-RULE-034
- RESILIENCY-03~RESILIENCY-04: production CI/CD는 MVP 범위 밖이며 Build and Test 지침에서 명령 기준으로만 다룬다.

## PBT 재현성 패턴

### Seed and Path Capture

- fast-check shrinking은 비활성화하지 않는다.
- 실패 시 fast-check 출력의 seed/path와 최소 실패 입력을 확인한다.
- Build and Test 문서는 실패한 test file만 재실행하는 명령 예시를 포함한다.
- 반복되는 실패는 example-based regression test로 승격한다.

적용 규칙:

- TQ-RULE-022
- TQ-RULE-023
- PBT-08
- PBT-10

### Complementary Testing Pattern

- business-critical path는 example-based test를 최소 하나 이상 가진다.
- PBT는 total, validation, filtering, realtime event invariant를 넓은 입력 공간에서 검증한다.
- PBT가 찾은 실패 사례는 구체적인 example test로 고정한다.

적용 규칙:

- TQ-RULE-020
- TQ-RULE-021
- PBT-03
- PBT-10

## 보안 및 데이터 보호 패턴

- Security Baseline 확장은 사용자 결정에 따라 비활성화되어 있다.
- 테스트 fixture에는 실제 credential, production data, 개인 정보를 포함하지 않는다.
- sample password와 seed data는 MVP용 더미 데이터로만 유지한다.
- test failure output에 민감 정보가 포함되지 않도록 test fixture 값을 제한한다.

## 복원력 테스트 접근 방식

선택된 접근 방식:

- 현재 local MVP에서는 별도 DR/chaos engineering infrastructure를 만들지 않는다.
- 복원력 mechanism은 자동 unit/integration-style test와 수동 realtime verification checklist로 검증한다.
- Operations 단계의 production DR drill은 현재 placeholder 범위라 N/A로 기록한다.

추적 방식:

- 자동 검증 결과는 `npm test` 결과로 추적한다.
- 수동 검증 결과는 Build and Test 단계의 manual verification checklist로 추적한다.
- known limitation은 Build and Test summary에 기록한다.

## 확장 규칙 준수

### Property-Based Testing

| Rule | 상태 | 근거 |
|---|---|---|
| PBT-01 | 준수 | Functional Design에서 testable properties를 식별했고 Code Generation으로 전달한다. |
| PBT-02 | 준수 계획 | storage serialization round-trip test 유지 대상이다. |
| PBT-03 | 준수 계획 | total, validation, filter, realtime invariant를 PBT로 보강한다. |
| PBT-04 | N/A | 현재 단위에서 idempotent operation을 새로 정의하지 않는다. |
| PBT-05 | N/A | 별도 oracle implementation은 MVP 범위 밖이다. |
| PBT-06 | 준수 계획 | cart state, table completion, realtime state transition을 stateful property 관점으로 평가한다. |
| PBT-07 | 준수 계획 | domain-specific generator catalog를 중앙화한다. |
| PBT-08 | 준수 계획 | fast-check seed/path 재현 절차와 shrinking 유지를 설계했다. |
| PBT-09 | 준수 | fast-check와 Vitest를 기술 스택으로 확정했다. |
| PBT-10 | 준수 계획 | example-based test와 PBT를 함께 사용한다. |

### Resiliency

| Rule | 상태 | 근거 |
|---|---|---|
| RESILIENCY-01 | 준수 | 고객 주문, 관리자 dashboard, realtime monitor를 핵심 workload로 검증 범위에 포함한다. |
| RESILIENCY-02 | 부분 적용 | project-level RTO/RPO는 이전 산출물에서 다루며 이 단위는 검증 가능성을 제공한다. |
| RESILIENCY-03 | 부분 적용 | formal change process는 MVP 범위 밖이며 품질 게이트 명령을 문서화한다. |
| RESILIENCY-04 | 부분 적용 | CI/CD pipeline은 만들지 않지만 build/test 명령 순서를 정의한다. |
| RESILIENCY-05 | N/A | production monitoring 구성은 이 단위 범위 밖이다. |
| RESILIENCY-06 | N/A | production health endpoint 추가는 이 단위 범위 밖이다. |
| RESILIENCY-07 | N/A | resiliency posture monitoring은 local MVP 범위 밖이다. |
| RESILIENCY-08 | N/A | deployment topology는 infrastructure 설계 범위이며 현재 skip 상태다. |
| RESILIENCY-09 | N/A | autoscaling/capacity management는 local MVP 테스트 단위에 적용하지 않는다. |
| RESILIENCY-10 | 준수 계획 | SSE failed client isolation과 snapshot fallback 검증을 설계했다. |
| RESILIENCY-11 | N/A | DR strategy infrastructure는 현재 단위 범위 밖이다. |
| RESILIENCY-12 | N/A | backup/replication 설계는 현재 단위 범위 밖이다. |
| RESILIENCY-13 | N/A | production failover runbook은 현재 단위 범위 밖이다. |
| RESILIENCY-14 | 준수 계획 | 자동 테스트와 수동 checklist로 local resiliency mechanism 검증 방식을 정의했다. |
| RESILIENCY-15 | N/A | incident response process는 MVP 운영 placeholder 범위다. |

### Security Baseline

Security Baseline은 `aidlc-state.md`에서 비활성화되어 있다. 확장 규칙으로는 적용하지 않으며, 기본 테스트 데이터 보호 원칙만 유지한다.
