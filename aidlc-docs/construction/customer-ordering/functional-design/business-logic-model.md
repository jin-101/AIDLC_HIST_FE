# 비즈니스 로직 모델 - Customer Ordering

## 범위

Customer Ordering Module은 고객 태블릿에서 테이블 context를 설정하고, 메뉴를 탐색하며, 장바구니를 관리하고, 주문을 제출하고, 현재 table session의 주문 내역을 조회하는 흐름을 담당한다.

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| 고객 route 구조 | `/customer/setup`, `/customer/menu`, `/customer/cart`, `/customer/orders`로 명시적으로 분리한다. |
| localStorage 구조 | table context와 cart를 별도 key로 분리한다. |
| 주문 성공 처리 | 성공 화면을 표시하고 5초 후 `/customer/menu`로 이동한다. |
| 주문 실패 처리 | localStorage cart를 유지하고 오류 메시지만 표시한다. |

## 핵심 Workflow

### 테이블 설정 및 자동 복원

1. 고객 태블릿이 `/customer/setup`에 접근한다.
2. 클라이언트는 localStorage의 table context key를 확인한다.
3. 유효한 context가 있으면 active session 확인 API를 호출한다.
4. active session이 확인되면 `/customer/menu`로 이동한다.
5. context가 없거나 검증에 실패하면 store code, table number, table password 입력 상태를 유지한다.
6. 설정 성공 시 table context를 localStorage에 저장하고 메뉴 화면으로 이동한다.

### 메뉴 탐색

1. `/customer/menu` 진입 시 table context를 요구한다.
2. context가 없으면 `/customer/setup`으로 이동한다.
3. 메뉴 API에서 category와 menu item 목록을 조회한다.
4. unavailable menu item은 고객 주문 가능 목록에서 제외하거나 disabled 상태로 표시한다.
5. 고객은 category 탭 또는 목록 선택으로 메뉴를 탐색한다.
6. 메뉴 추가 시 cart key에 item snapshot을 저장한다.

### 장바구니 관리

1. cart는 menu item ID 기준으로 항목을 합산한다.
2. 동일 menu item을 추가하면 quantity를 1 증가시킨다.
3. quantity 감소 결과가 0이면 cart에서 제거한다.
4. cart total은 모든 line total의 합으로 매번 재계산한다.
5. cart 변경 후 localStorage에 즉시 저장한다.
6. 장바구니 비우기는 cart key를 빈 items 상태로 갱신한다.

### 주문 제출

1. `/customer/cart`는 table context와 cart items를 모두 요구한다.
2. cart가 비어 있으면 주문 제출을 비활성화한다.
3. 주문 payload는 store ID, table ID, session ID, item ID, 메뉴명 snapshot, 수량, 단가를 포함한다.
4. 제출 전 클라이언트 total과 payload line total을 다시 계산한다.
5. API 성공 시 cart key를 비우고 주문 번호를 성공 화면에 표시한다.
6. 성공 화면은 5초 timer 후 `/customer/menu`로 이동한다.
7. API 실패 시 cart key를 유지하고 고객이 이해할 수 있는 오류 메시지를 표시한다.

### 현재 세션 주문 내역 조회

1. `/customer/orders`는 table context를 요구한다.
2. 현재 session ID로 주문 내역 API를 호출한다.
3. 응답은 주문 생성 시각 오름차순으로 표시한다.
4. 이전 session 또는 completed session의 주문은 표시하지 않는다.
5. 조회 실패 시 빈 이력으로 오인되지 않도록 오류 상태와 재시도 동작을 표시한다.

## 상태 모델

| 상태 | 저장 위치 | 설명 |
|---|---|---|
| TableContext | localStorage | store ID, store code, table ID, table number, active session ID, savedAt을 포함한다. |
| CartState | localStorage | table/session 범위의 cart items, updatedAt을 포함한다. |
| MenuCatalog | client memory | API 조회 결과이며 새로고침 시 재조회한다. |
| SubmitState | client memory | idle, submitting, succeeded, failed 중 하나이다. |
| OrderHistoryState | client memory | loading, loaded, failed 중 하나이다. |

## API 통합

| 기능 | API 방향 | 기대 응답 |
|---|---|---|
| 테이블 설정 | table credential 검증 및 active session 확보 | TableContext에 필요한 store/table/session 데이터 |
| 메뉴 조회 | store 기준 category와 menu item 조회 | category별 menu item 목록 |
| 주문 생성 | cart를 order payload로 제출 | 주문 번호와 생성된 주문 데이터 |
| 주문 내역 | current session 기준 조회 | 현재 session의 주문 목록 |

## PBT Testable Properties

| 속성 | 범주 | 기대 규칙 |
|---|---|---|
| cart total은 line total 합과 같다 | Invariant | 임의 cart items에 대해 `total = sum(quantity * unitPrice)`가 항상 성립한다. |
| quantity update는 음수 수량을 만들지 않는다 | State transition | 감소 연산 후 quantity는 1 이상이거나 항목이 제거되어야 한다. |
| 동일 menu item add는 항목 중복 대신 수량 증가로 귀결된다 | State transition | 같은 menuItemId를 여러 번 추가해도 cart item은 하나이며 quantity만 증가한다. |
| order payload total은 cart snapshot과 일치한다 | Invariant | payload의 item 수량, 단가, line total 합은 제출 직전 cart와 일치해야 한다. |
| localStorage serialization은 round-trip 후 cart 의미를 보존한다 | Round-trip | serialize 후 parse한 cart는 item ID, quantity, unitPrice, total이 동일해야 한다. |

## Resiliency 반영

| 실패 상황 | 설계 대응 |
|---|---|
| table context 검증 실패 | 저장된 context를 사용하지 않고 setup 화면에서 재설정을 요구한다. |
| 메뉴 조회 실패 | 기존 cart는 보존하고 메뉴 영역에 오류와 재시도 동작을 표시한다. |
| 주문 제출 실패 | cart localStorage를 유지하고 제출 상태만 failed로 전환한다. |
| 주문 성공 후 redirect timer 중 새로고침 | cart는 이미 비워진 상태이며 menu 진입 시 정상적으로 빈 cart로 시작한다. |
| 주문 내역 조회 실패 | 빈 주문으로 표시하지 않고 오류 상태와 재시도를 제공한다. |

## 확장 규칙 준수

### Property-Based Testing

- **PBT-01**: 준수. cart total, quantity transition, payload shaping, localStorage round-trip 속성을 식별했다.
- **PBT-02**: 준수 계획. cart serialization과 payload 변환에 round-trip property를 적용한다.
- **PBT-03**: 준수 계획. cart total과 quantity invariant를 적용한다.
- **PBT-04**: N/A. 고객 주문 제출은 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 이 unit 범위에 포함하지 않는다.
- **PBT-06**: 준수 계획. cart state transition의 순차 연산 property를 테스트한다.
- **PBT-07~PBT-10**: Code Generation 및 Build and Test 단계에서 구체화한다.

### Resiliency

- **활성화 상태**: `aidlc-state.md` 기준 Resiliency Baseline은 enabled이다.
- **적용 결과**: 주문 실패 시 cart 보존, API 실패 메시지, 주문 내역 실패 상태를 설계에 반영했다.
- **N/A 판단**: multi-region, failover, production DR 절차는 local MVP 고객 모듈 기능 설계 범위를 벗어나며 후속 운영 hardening 항목이다.
