# 논리 컴포넌트 - Testing and Quality

## 개요

Testing and Quality Module은 production runtime component를 추가하지 않는다. 이 단위의 논리 컴포넌트는 테스트 코드, generator, 품질 게이트, 재현성 문서, 수동 검증 checklist로 구성된다.

## Component Summary

| Component | 책임 | 주요 산출 위치 |
|---|---|---|
| Domain Generator Catalog | domain constraint를 만족하는 재사용 generator 제공 | `src/test/generators/domain-generators.ts` |
| Integration-Style Test Harness | repository/API/helper 수준의 핵심 흐름 검증 | `src/**/*.test.ts`, `src/**/*.spec.ts` |
| PBT Reproducibility Guide | fast-check seed/path 재현 절차 제공 | Build and Test 지침 |
| Quality Gate Runner | test, type check, build 명령 순서 정의 | Build and Test 지침 |
| Manual Verification Checklist | realtime browser 동작과 recovery 수동 확인 | Build and Test 지침 |

## Domain Generator Catalog

### 책임

- domain object별 fast-check generator를 중앙화한다.
- 가격, 수량, 상태, 이벤트 타입 같은 business constraint를 생성 단계에서 보장한다.
- PBT test가 raw primitive generator에 직접 의존하지 않도록 한다.

### Export 후보

| Export | 대상 | Constraint |
|---|---|---|
| `cartItemArb` | cart item | 양수 수량, 양수 가격, 유효 menu item id |
| `cartStateArb` | cart state | item list와 total 계산 가능 상태 |
| `menuItemArb` | menu item | 양수 가격, 유효 category, 표시 가능한 이름 |
| `orderItemInputArb` | order item input | 양수 수량, order total 계산 가능 |
| `orderWithItemsArb` | order aggregate | 하나 이상의 item, 유효 status |
| `tableSessionArb` | table session | 유효 table number와 session status |
| `realtimeEventArb` | realtime event | 허용 event type과 timestamp |

### 의존성

- `fast-check`
- production type definition
- 테스트 전용 helper

### 금지 사항

- runtime dependency 추가
- production code가 test generator에 의존
- 실제 credential 또는 production data 사용

## Integration-Style Test Harness

### 책임

- SQLite test fixture와 repository/API/helper 조합으로 핵심 흐름을 검증한다.
- UI browser e2e 없이 business invariant와 persistence interaction을 확인한다.
- 테스트 간 database state를 격리한다.

### 우선 검증 흐름

| 흐름 | 검증 대상 |
|---|---|
| Customer order total consistency | cart/order item total invariant |
| Admin table completion dashboard exclusion | completed table session이 active dashboard order에서 제외되는지 검증 |
| Realtime publish flow metadata | `order-created`, `order-deleted`, dashboard event metadata 검증 |

### 설계 원칙

- 핵심 happy path는 example-based test로 고정한다.
- 입력 공간이 넓은 invariant는 PBT로 검증한다.
- external browser, network mock, queue worker는 현재 범위에서 제외한다.

## PBT Reproducibility Guide

### 책임

- fast-check 실패 재현 절차를 명확히 문서화한다.
- seed/path와 shrunk minimal input을 regression workflow로 연결한다.

### 포함할 내용

- 실패 출력에서 seed와 path를 찾는 방법
- 실패한 test file만 재실행하는 명령 예시
- 실패 입력을 example-based regression test로 승격하는 기준
- PBT flakiness를 무시하지 않고 원인 분석 대상으로 기록하는 원칙

### 설계 결정

- fast-check shrinking은 유지한다.
- 모든 seed를 고정하지 않는다.
- 실패 재현이 필요한 경우에만 seed/path를 사용한다.

## Quality Gate Runner

### 책임

- 개발자가 동일한 순서로 품질 검증을 실행할 수 있게 한다.
- local known limitation과 prerequisite를 명확히 분리한다.

### 실행 순서

| Step | 명령 | 성공 기준 |
|---|---|---|
| 1 | `npm test` | 모든 Vitest example/PBT test 통과 |
| 2 | `npx tsc --noEmit` | TypeScript error 없음 |
| 3 | `npm run build` | Node.js prerequisite 충족 후 Next.js build 통과 |

### Known Limitation 처리

- 현재 관측된 Node.js는 `18.17.1`이다.
- Next.js build prerequisite는 `18.18.0` 이상 또는 `20.x` 이상이다.
- Node.js version mismatch로 build가 중단되면 코드 실패가 아니라 prerequisite 실패로 기록한다.

## Manual Verification Checklist

### 책임

- 자동화하지 않은 realtime browser behavior를 짧은 scenario로 검증한다.
- local MVP에서 production monitoring 대신 사용자 관점의 recovery를 확인한다.

### Scenario 후보

| Scenario | 기대 결과 |
|---|---|
| 고객 주문 생성 후 관리자 dashboard 확인 | 2초 이내 snapshot 또는 realtime event로 주문 표시 |
| 신규 주문 highlight | 새 table card가 시각적으로 강조됨 |
| SSE 연결 실패 상태 확인 | status가 실패 또는 재연결 상태를 표시하고 수동 새로고침 가능 |
| table completion | 완료된 table session 주문이 current orders에서 제외됨 |

## Component Interaction

1. Domain Generator Catalog가 domain-constrained input을 생성한다.
2. Integration-Style Test Harness가 generated input과 example fixture를 사용한다.
3. PBT 실패 시 Reproducibility Guide에 따라 seed/path를 기록한다.
4. Quality Gate Runner가 `npm test`, `npx tsc --noEmit`, `npm run build` 순서로 검증한다.
5. 자동화되지 않은 realtime browser behavior는 Manual Verification Checklist로 확인한다.

## Extension Compliance

### Property-Based Testing

- Domain Generator Catalog가 PBT-07 generator quality를 충족하도록 설계되어 있다.
- PBT Reproducibility Guide가 PBT-08 seed/path 재현성을 다룬다.
- Integration-Style Test Harness는 PBT와 example-based test를 함께 사용해 PBT-10을 충족한다.

### Resiliency

- Manual Verification Checklist는 RESILIENCY-14의 local resiliency test approach 역할을 한다.
- Integration-Style Test Harness는 RESILIENCY-10의 failed client isolation과 fallback 검증을 지원한다.
- Quality Gate Runner는 change safety를 위한 반복 가능한 검증 절차를 제공한다.

### Security Baseline

Security Baseline은 비활성화되어 있다. 논리 컴포넌트는 실제 credential과 production data를 사용하지 않는 기본 데이터 보호 원칙만 따른다.
