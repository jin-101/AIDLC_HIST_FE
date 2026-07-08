# 비즈니스 로직 모델 - Testing and Quality

## 범위

Testing and Quality Module은 이미 구현된 Foundation, Customer Ordering, Admin Operations, Realtime Event 기능을 검증 가능한 품질 체계로 묶는다. 이 단위는 새로운 사용자 기능을 만들기보다 공통 generator, 핵심 flow test, PBT seed/reproducibility 문서화, Build and Test 지침의 기반을 설계한다.

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| 남은 구현 범위 | 공통 generator 보강, 핵심 flow integration-style unit test, Build/Test 문서화 중심으로 최소 보강 |
| Generator 범위 | cart, menu item, order, session, realtime event generator를 `src/test/generators/`에 보강 |
| 핵심 flow test 방식 | repository/API/helper 조합의 integration-style unit test로 customer order, admin table completion, realtime publish flow 검증 |
| PBT seed/reproducibility | Build and Test 지침에 Vitest/fast-check 실패 seed 확인과 재실행 방법 명시 |
| Build prerequisite | Node.js `18.18.0` 이상 또는 `20.x` 이상 필요 조건과 현재 실패 원인 명시 |

## 현재 품질 기준선

| 검증 | 현재 상태 |
|---|---|
| Unit/PBT test | `npm test` 기준 17개 test file, 59개 test 통과 |
| TypeScript compile | `npx tsc --noEmit` 통과 |
| Next build | local Node.js `18.17.1`이 Next.js 요구사항보다 낮아 시작 전 중단 |
| 공통 generator | `src/test/generators/domain-generators.ts` 존재 |

## 핵심 Workflow

### 공통 Generator 보강

1. 기존 `src/test/generators/domain-generators.ts`를 기준으로 generator 목록을 확장한다.
2. cart, menu item, order, session, realtime event를 생성할 수 있는 domain-specific arbitrary를 추가한다.
3. generator는 business constraint를 반영한다.
4. 테스트 파일에서 raw primitive generator만 반복하지 않도록 공통 generator를 재사용한다.

### Customer Flow 품질 검증

1. cart state transition은 example test와 PBT를 함께 유지한다.
2. 주문 payload 생성은 cart snapshot과 line total invariant를 검증한다.
3. 주문 제출 실패 시 cart 보존은 기존 Customer Ordering test와 Build/Test 지침에서 추적한다.
4. integration-style unit test는 repository/API/helper 조합 수준에서 주문 생성 결과와 총액 일관성을 검증한다.

### Admin Flow 품질 검증

1. dashboard mapper는 active session order total 합계를 검증한다.
2. table completion은 active session이 완료되고 dashboard current orders에서 제외되는 흐름을 검증한다.
3. order delete는 삭제 후 total 재계산과 realtime event publication 대상 정보를 검증한다.
4. menu validation/reorder는 example test와 PBT를 함께 유지한다.

### Realtime Flow 품질 검증

1. event helper는 malformed payload, store mismatch, reload decision, highlight expiry를 검증한다.
2. event bus는 subscribe, unsubscribe, same-store fan-out, failed client isolation을 검증한다.
3. EventSource hook은 open, message, error, cleanup 흐름을 mock 기반으로 검증한다.
4. Build/Test 지침에는 SSE 수동 확인 절차와 snapshot recovery 확인 절차를 포함한다.

### Build and Test 지침 생성 기반

1. 검증 명령을 build-and-test 단계에서 파일별로 분리한다.
2. `npm test`, `npx tsc --noEmit`, `npm run build`의 기대 결과와 prerequisite을 명시한다.
3. PBT 실패 시 seed 확인과 재실행 절차를 문서화한다.
4. Node.js 버전 요구사항을 명확히 기록한다.

## 상태 모델

| 상태 | 설명 |
|---|---|
| TestCoverageMap | story와 test artifact의 연결 관계 |
| GeneratorCatalog | 공통 generator 목록과 생성 가능한 domain type |
| VerificationCommandSet | test, typecheck, build, 수동 확인 명령/절차 |
| PbtReproducibilityGuide | fast-check 실패 seed 확인과 재실행 절차 |
| BuildPrerequisite | Node.js version, dependency install, db init 같은 실행 전제 |

## PBT Testable Properties

| 속성 | 범주 | 기대 규칙 |
|---|---|---|
| cart total은 line total 합과 같다 | Invariant | 임의 cart items에서 total은 `quantity * unitPrice` 합과 같다. |
| order payload는 cart snapshot total과 일치한다 | Invariant | payload line total 합은 제출 직전 cart와 같다. |
| table completion 후 active dashboard에서 session order가 제외된다 | State transition | 완료된 session은 active dashboard current orders에 남지 않는다. |
| menu reorder는 항목 집합을 보존한다 | Invariant | 순서 변경 후 ID 집합은 변경 전과 같다. |
| realtime store filter는 다른 store event를 제외한다 | Invariant | event storeId와 session storeId가 같을 때만 전달된다. |
| highlight expiry는 만료 항목을 제거한다 | State transition | expiresAt 이후 highlighted table set에서 제거된다. |

## Resiliency 반영

| 실패/제약 | 설계 대응 |
|---|---|
| 주문 제출 실패 | cart 보존 test와 수동 검증 지침으로 추적 |
| mutation 실패 | 기존 snapshot/form state 보존 test와 지침으로 추적 |
| SSE 연결 실패 | EventSource mock test와 수동 확인 절차로 추적 |
| Node.js build prerequisite 불일치 | Build/Test 문서에 요구 버전과 현재 실패 원인 명시 |
| PBT 실패 재현 어려움 | seed 확인과 재실행 절차 문서화 |

## 확장 규칙 준수

### Property-Based Testing

- **PBT-01**: 준수. 테스트 가능한 속성과 대상 story를 명시했다.
- **PBT-02**: 준수 계획. storage serialization round-trip을 유지한다.
- **PBT-03**: 준수 계획. total, filter, validation, reorder invariant를 유지/보강한다.
- **PBT-04**: N/A. 주요 mutation은 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 MVP 범위 밖이다.
- **PBT-06**: 준수 계획. cart, table completion, realtime highlight state transition을 검증한다.
- **PBT-07**: 준수 계획. domain-specific generator catalog를 보강한다.
- **PBT-08**: 준수 계획. Build and Test 단계에서 seed 재현 절차를 문서화한다.
- **PBT-09**: 준수. TypeScript PBT framework는 `fast-check`이다.
- **PBT-10**: 준수. example-based test와 PBT를 함께 사용한다.

### Resiliency

- **적용 결과**: 실패 보존, snapshot fallback, SSE reconnect, Node prerequisite, PBT 재현성 지침을 품질 설계에 반영했다.
- **N/A 판단**: production DR, multi-region failover, production monitoring은 local MVP 품질 단위 범위를 벗어난다.
