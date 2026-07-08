# 비즈니스 규칙 - Testing and Quality

## Coverage 규칙

| Rule ID | 규칙 |
|---|---|
| TQ-RULE-001 | Testing and Quality Module은 지원 스토리별 검증 artifact를 하나 이상 추적해야 한다. |
| TQ-RULE-002 | US-CUST-003은 cart state transition과 total invariant test로 검증해야 한다. |
| TQ-RULE-003 | US-CUST-004는 order payload/submit flow와 realtime `order-created` publication을 검증해야 한다. |
| TQ-RULE-004 | US-ADMIN-002는 realtime helper, event bus, EventSource hook, dashboard 수동 확인 절차로 검증해야 한다. |
| TQ-RULE-005 | US-ADMIN-004는 table completion 후 active dashboard 제외와 history 가능성을 검증해야 한다. |
| TQ-RULE-006 | US-ADMIN-005는 order delete 후 total 재계산과 `order-deleted` publication을 검증해야 한다. |
| TQ-RULE-007 | US-ADMIN-007은 menu validation과 reorder invariant를 검증해야 한다. |

## Generator 규칙

| Rule ID | 규칙 |
|---|---|
| TQ-RULE-010 | 공통 generator는 domain constraint를 반영해야 한다. |
| TQ-RULE-011 | 가격과 수량 generator는 양수 범위로 제한해야 한다. |
| TQ-RULE-012 | order/session/realtime event generator는 필수 ID와 허용 status/type을 사용해야 한다. |
| TQ-RULE-013 | PBT에서 domain object를 만들 때 raw primitive generator만 반복 사용하는 것을 피해야 한다. |
| TQ-RULE-014 | generator는 여러 test file에서 재사용 가능하도록 `src/test/generators/`에 둔다. |

## PBT 규칙

| Rule ID | 규칙 |
|---|---|
| TQ-RULE-020 | PBT는 example-based test를 대체하지 않고 보완해야 한다. |
| TQ-RULE-021 | business-critical path는 최소 하나의 example-based test를 가져야 한다. |
| TQ-RULE-022 | PBT 실패 시 fast-check가 출력하는 seed와 path를 기록할 수 있어야 한다. |
| TQ-RULE-023 | Build/Test 문서는 PBT 실패 재실행 방법을 포함해야 한다. |
| TQ-RULE-024 | PBT helper는 DOM, fetch, storage 같은 외부 효과에 직접 의존하지 않아야 한다. |

## 검증 명령 규칙

| Rule ID | 규칙 |
|---|---|
| TQ-RULE-030 | 기본 test command는 `npm test`이다. |
| TQ-RULE-031 | TypeScript 검증 command는 `npx tsc --noEmit`이다. |
| TQ-RULE-032 | build 검증 command는 `npm run build`이다. |
| TQ-RULE-033 | Next.js build는 Node.js `18.18.0` 이상 또는 `20.x` 이상을 전제로 한다. |
| TQ-RULE-034 | 현재 local Node.js `18.17.1`에서 build가 중단되는 것은 코드 실패가 아니라 prerequisite 실패로 기록한다. |

## 수동 검증 규칙

| Rule ID | 규칙 |
|---|---|
| TQ-RULE-040 | 관리자 dashboard realtime status가 표시되는지 확인해야 한다. |
| TQ-RULE-041 | 고객 주문 생성 후 2초 이내 dashboard snapshot이 갱신되는지 확인해야 한다. |
| TQ-RULE-042 | 신규 주문 table card highlight가 표시되는지 확인해야 한다. |
| TQ-RULE-043 | SSE 실패 또는 재연결 상황에서도 수동 새로고침이 유지되는지 확인해야 한다. |
| TQ-RULE-044 | table completion 후 해당 active session 주문이 dashboard current orders에서 제외되는지 확인해야 한다. |

## Acceptance Criteria 매핑

| Story | 관련 규칙 |
|---|---|
| US-CUST-003 | TQ-RULE-002, TQ-RULE-010~TQ-RULE-014, TQ-RULE-020 |
| US-CUST-004 | TQ-RULE-003, TQ-RULE-020~TQ-RULE-024 |
| US-ADMIN-002 | TQ-RULE-004, TQ-RULE-040~TQ-RULE-043 |
| US-ADMIN-004 | TQ-RULE-005, TQ-RULE-044 |
| US-ADMIN-005 | TQ-RULE-006 |
| US-ADMIN-007 | TQ-RULE-007 |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. generator 품질, PBT 보완성, seed 재현성 규칙을 명시했다.
- **Resiliency**: 준수. build prerequisite, SSE recovery, 수동 검증 규칙을 명시했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
