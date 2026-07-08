# NFR 요구사항 - Testing and Quality

## 범위

이 문서는 Testing and Quality Module의 테스트 실행 성능, 재현성, 유지보수성, 품질 게이트, build prerequisite를 정의한다. 대상은 Vitest test suite, fast-check PBT, 공통 generator, integration-style unit test, Build and Test 지침이다.

## 확정된 NFR 결정

| 항목 | 결정 |
|---|---|
| 테스트 실행 시간 | 로컬 MVP 기준 `npm test`는 60초 이내를 목표로 한다. |
| PBT 실행 설정 | 개별 PBT는 기본 fast-check 설정을 유지한다. |
| 품질 게이트 | `npm test`, `npx tsc --noEmit`, Node upgrade 후 `npm run build` 조합으로 정의한다. |
| PBT 재현성 | fast-check 실패 출력의 seed/path를 문서화하고 실패 case는 regression example로 승격 가능하게 설계한다. |
| 테스트 dependency | Vitest, fast-check, `@testing-library/react`, `jsdom@24.1.3`만 유지하고 runtime dependency는 추가하지 않는다. |
| Build prerequisite | Node.js `18.18.0` 이상 또는 `20.x` 이상을 build prerequisite으로 문서화한다. |

## 성능

- `npm test`는 local MVP 기준 60초 이내 완료를 목표로 한다.
- PBT는 기본 fast-check 설정을 유지해 shrinking과 다양한 입력 생성을 보존한다.
- 성능 목표를 맞추기 위해 PBT run 수를 임의로 과도하게 낮추지 않는다.
- 장시간 실행되는 browser e2e는 현재 범위에서 제외한다.
- integration-style unit test는 DB fixture와 repository 조합을 사용하되, 테스트 간 격리를 유지한다.

## 재현성

- PBT 실패 시 fast-check 출력의 seed/path를 확인할 수 있어야 한다.
- Build and Test 지침은 실패한 test file만 재실행하는 명령 예시를 포함해야 한다.
- PBT가 발견한 최소 실패 사례는 가능한 경우 example-based regression test로 승격한다.
- generator는 domain constraint를 반영해 의미 없는 random input으로 인한 잡음을 줄인다.
- test data fixture와 generator는 테스트 간 순서 의존성을 만들지 않아야 한다.

## 품질 게이트

| Gate | 명령 | 기대 결과 |
|---|---|---|
| Unit/PBT test | `npm test` | 모든 Vitest example/PBT test 통과 |
| TypeScript compile | `npx tsc --noEmit` | type error 없음 |
| Production build | `npm run build` | Node.js prerequisite 충족 후 Next build 통과 |

현재 local known limitation:

- Node.js `18.17.1`에서는 Next.js build가 시작 전 중단된다.
- 이 실패는 코드 실패가 아니라 runtime prerequisite 미충족으로 기록한다.

## 가용성 및 복원력

- test failure는 재현 가능한 정보와 함께 기록해야 한다.
- SSE recovery, snapshot fallback, failed client isolation은 자동 test와 수동 검증 절차로 함께 다룬다.
- build prerequisite 불일치는 명확한 해결 방법과 함께 문서화한다.
- 수동 검증 checklist는 자동화가 부족한 realtime browser 동작을 보완한다.

## 유지보수성

- 공통 generator는 `src/test/generators/`에 모아 중복을 줄인다.
- test file은 기능 영역별로 유지한다.
- PBT helper는 DOM, fetch, storage 같은 외부 효과에 직접 의존하지 않는다.
- integration-style unit test는 UI rendering보다 repository/API/helper contract 검증에 집중한다.
- 새 runtime dependency는 추가하지 않는다.

## 보안 및 데이터 보호

- Security Baseline 확장은 사용자 결정에 따라 비활성화되어 있다.
- 테스트 fixture에는 실제 credential이나 production data를 포함하지 않는다.
- seed data와 test password는 MVP용 sample data로 한정한다.
- test failure output에 민감 정보가 포함되지 않도록 한다.

## 사용성 및 운영성

- Build and Test 문서는 개발자가 바로 실행할 수 있는 명령 중심으로 작성한다.
- Node.js version prerequisite와 known limitation을 문서 상단에 명확히 둔다.
- 수동 검증 checklist는 고객 주문, 관리자 dashboard, realtime status, table completion을 짧은 시나리오로 제공한다.
- PBT seed 재현 절차는 실패 시 우선 확인할 위치와 재실행 예시를 제공한다.

## 테스트 요구사항

- 공통 generator 보강:
  - cart item/cart state
  - menu item/menu draft
  - order/order item
  - table session
  - realtime event
- integration-style unit test:
  - customer order total consistency
  - admin table completion removes active dashboard orders
  - realtime publish flow emits expected event metadata
- 문서화:
  - PBT seed 재현 절차
  - Node.js build prerequisite
  - 수동 realtime verification checklist

## Resiliency 준수

- **RESILIENCY-01**: 준수. 주문 생성, 관리자 dashboard, realtime monitor를 핵심 workload로 테스트 coverage에 반영한다.
- **RESILIENCY-02**: 부분 적용. project-level RTO/RPO는 요구사항에서 정의되어 있고, 이 단위는 실패 재현성과 검증 가능성을 제공한다.
- **RESILIENCY-03~RESILIENCY-04**: 부분 적용. CI/CD 자체는 생성하지 않지만 품질 게이트 명령을 정의한다.
- **RESILIENCY-05~RESILIENCY-06**: 부분 적용. runtime monitoring 대신 test failure와 manual verification으로 local MVP 상태를 검증한다.
- **RESILIENCY-07~RESILIENCY-09**: local MVP에서는 N/A.
- **RESILIENCY-10**: 준수. SSE failed client isolation, malformed event ignore, snapshot fallback 검증을 포함한다.
- **RESILIENCY-11~RESILIENCY-13**: N/A. 이 단위는 DR infrastructure를 소유하지 않는다.
- **RESILIENCY-14**: 준수. realtime recovery와 snapshot fallback을 test/manual verification 항목으로 포함한다.
- **RESILIENCY-15**: N/A. production incident response 연동은 MVP 범위 밖이다.

## PBT 준수

- **PBT-01**: 준수. Functional Design에서 테스트 가능한 속성을 식별했다.
- **PBT-02**: 준수 계획. storage serialization round-trip을 유지한다.
- **PBT-03**: 준수 계획. total, filter, validation, reorder, realtime invariant를 유지/보강한다.
- **PBT-04**: N/A. 주요 mutation은 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 MVP 범위 밖이다.
- **PBT-06**: 준수 계획. cart, table completion, realtime highlight state transition을 검증한다.
- **PBT-07**: 준수 계획. domain-specific generator catalog를 보강한다.
- **PBT-08**: 준수 계획. seed/path 재현 절차를 Build and Test 지침에 포함한다.
- **PBT-09**: 준수. TypeScript PBT framework는 `fast-check`이다.
- **PBT-10**: 준수. example-based test와 PBT를 함께 사용한다.
