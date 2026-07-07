# NFR 설계 패턴 - Customer Ordering

## 범위

이 문서는 Customer Ordering Module의 NFR 요구사항을 구현 패턴으로 구체화한다. 대상은 고객 태블릿의 table setup, menu 탐색, cart 관리, order submit, current session order history 조회이다.

## 확정된 설계 패턴 결정

| 관심사 | 결정 |
|---|---|
| 주문 실패 resilience | 자동 재시도 없이 cart를 보존하고 같은 화면에서 수동 재시도 버튼을 제공한다. |
| 메뉴 조회 성능 | 페이지 진입 시 API 조회, 성공 결과는 component memory에 유지하고 실패 시 재시도 버튼을 제공한다. |
| localStorage fallback | safe parse, schema guard, session scope check 실패 시 empty state로 복구한다. |
| 성능 최적화 | cart 계산 pure function, 최소 memoization, 불필요한 API 재호출 방지만 적용한다. |
| 논리 경계 | storage adapter, cart domain service, API client, route guard, UI state hooks로 분리한다. |

## Resilience 패턴

### Manual Retry With Preserved Cart Pattern

주문 제출 실패 시 자동 재시도 또는 background queue를 사용하지 않는다.

설계 규칙:

- submit 시작 시 현재 cart snapshot을 보존한다.
- API 실패 시 cart localStorage를 수정하지 않는다.
- submit state만 `failed`로 변경한다.
- 오류 메시지와 다시 주문 버튼을 같은 cart 화면에 표시한다.
- 다시 주문 버튼은 동일 cart snapshot에서 새 payload를 생성해 제출한다.
- `submitting` 상태에서는 중복 제출을 막는다.

적용 이유:

- prototype에서 중복 주문 위험을 낮춘다.
- 실패 후 고객이 눈으로 주문 내역을 다시 확인할 수 있다.
- offline queue나 idempotency key 없이도 단순하고 예측 가능하다.

### Failure State Separation Pattern

각 API 실패는 별도 UI state로 분리한다.

| 실패 | 상태 | 화면 처리 |
|---|---|---|
| table setup 실패 | setup failed | 입력값 유지, inline error 표시 |
| menu 조회 실패 | menu failed | cart 유지, retry 버튼 표시 |
| order submit 실패 | submit failed | cart 유지, 다시 주문 버튼 표시 |
| order history 조회 실패 | history failed | 빈 주문과 구분되는 오류 상태 표시 |

적용 이유:

- 빈 데이터와 실패를 혼동하지 않는다.
- 사용자가 다음 행동을 이해하기 쉽다.

### Safe Redirect Timer Pattern

주문 성공 화면의 5초 redirect는 client timer로 구현하되 cleanup을 보장한다.

설계 규칙:

- 주문 성공 후 cart clear가 완료된 다음 success state로 전환한다.
- success state 진입 시 5초 timer를 시작한다.
- component unmount 시 timer를 정리한다.
- timer가 끝나면 `/customer/menu`로 이동한다.

## Storage 패턴

### Safe Storage Adapter Pattern

localStorage 접근은 page component가 직접 하지 않고 adapter를 통해 수행한다.

설계 규칙:

- browser 환경인지 확인한 뒤 storage에 접근한다.
- JSON parse 실패는 exception을 밖으로 던지지 않고 safe result로 변환한다.
- schema guard 실패는 empty state로 처리한다.
- cart deserialize 후 totalAmount를 items 기준으로 재계산한다.
- table context와 cart의 storeId, tableId, sessionId가 맞지 않으면 cart를 empty state로 복구한다.

적용 대상:

- `tableContextStorage`
- `cartStorage`

### Session Scoped Cart Pattern

cart는 session 범위를 가진다.

설계 규칙:

- cart state는 storeId, tableId, sessionId를 포함한다.
- route guard 또는 `useCart` 초기화 시 TableContext와 CartState scope를 비교한다.
- scope mismatch가 있으면 기존 cart를 새 session에 사용하지 않는다.
- session 변경 시 empty cart를 저장하거나 cart key를 제거한다.

## Performance 패턴

### Pure Cart Calculation Pattern

cart 계산은 pure function으로 분리한다.

설계 규칙:

- add, increase, decrease, remove, clear는 입력 state와 command를 받아 새 state를 반환한다.
- lineTotal과 totalAmount는 매번 계산 결과로 만든다.
- cart 계산 중 API 호출이나 storage write를 하지 않는다.
- hook은 pure function 결과를 받은 뒤 storage persistence를 수행한다.

적용 이유:

- 100ms 이내 체감 반응성을 유지한다.
- PBT에서 cart invariant를 쉽게 검증한다.
- UI component의 복잡도를 낮춘다.

### Component Memory Menu Cache Pattern

메뉴 catalog는 page lifecycle 동안만 memory에 유지한다.

설계 규칙:

- `/customer/menu` 진입 시 menu API를 호출한다.
- 성공한 category/item 결과는 component state에 보관한다.
- 같은 page lifecycle에서 category 전환은 API를 재호출하지 않는다.
- 실패 시 retry 버튼으로 동일 API를 다시 호출한다.
- localStorage에는 menu catalog를 저장하지 않는다.

적용 이유:

- stale menu cache 위험을 줄인다.
- prototype의 단순성을 유지한다.
- category 전환 성능을 확보한다.

### Minimal Memoization Pattern

과도한 최적화 대신 계산 경계를 명확히 한다.

설계 규칙:

- cart total, cart count, category filtered items처럼 반복 계산되는 값만 필요 시 memoization한다.
- prototype 메뉴 규모에서는 virtualization을 기본 적용하지 않는다.
- API 재호출 방지와 pure calculation을 우선한다.

## API 통합 패턴

### Typed API Client Pattern

고객 화면 API 호출은 얇은 client wrapper를 통해 수행한다.

설계 규칙:

- Foundation API response shape를 해석한다.
- `ok: false` 응답을 UI가 사용할 수 있는 error state로 변환한다.
- raw fetch와 response parsing을 page component에 반복하지 않는다.
- table setup, menu 조회, order submit, history 조회 함수를 분리한다.

### Snapshot Payload Mapping Pattern

주문 payload는 제출 직전 cart snapshot에서 만든다.

설계 규칙:

- order payload mapper는 pure function이다.
- 빈 cart에서는 payload를 만들지 않는다.
- payload total은 cart item line total 합과 일치해야 한다.
- TableContext와 CartState의 scope가 일치해야 payload를 만들 수 있다.

## UI State 패턴

### Explicit Load State Pattern

비동기 화면은 명시적인 load state를 사용한다.

권장 state:

- `idle`
- `loading`
- `loaded`
- `failed`

적용 대상:

- table setup submit
- menu catalog load
- order submit
- current session orders load

### Touch First Interaction Pattern

주요 조작 요소는 태블릿 우선으로 설계한다.

설계 규칙:

- 주요 버튼과 입력은 44px 이상 touch target을 확보한다.
- disabled, loading, failed, focused 상태를 시각적으로 구분한다.
- 오류 메시지는 동작 근처에 표시한다.
- cart submit 버튼은 submitting 상태에서 비활성화한다.

## PBT 설계 패턴

### Property-Friendly Boundary Pattern

테스트 가능한 core logic을 UI 밖에 둔다.

PBT 대상:

| 대상 | 속성 |
|---|---|
| cart domain service | total invariant, quantity invariant, same-item merge |
| cartStorage | serialize/deserialize round-trip |
| payload mapper | cart snapshot과 payload total 일치 |
| submit failure handler | 실패 후 cart state 보존 |

설계 규칙:

- generator는 CartItem, CartState, command sequence를 만들 수 있어야 한다.
- storage adapter의 parse 결과는 success/fallback을 명확히 구분해야 한다.
- UI rendering test와 domain property test를 분리한다.

## Resiliency 적용 요약

- 주문 실패는 cart state와 submit state를 분리해 격리한다.
- localStorage 손상은 safe adapter에서 empty fallback으로 흡수한다.
- menu/history 실패는 빈 데이터와 구분한다.
- 자동 재시도와 offline queue는 MVP에서 제외해 중복 주문 위험을 줄인다.
- production monitoring, multi-region, failover는 local prototype에서 N/A이다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. pure cart service, storage adapter, payload mapper 경계를 PBT 가능하게 설계했다.
- **Resiliency**: 준수. 수동 재시도, cart 보존, storage fallback, failure state separation을 설계 패턴으로 반영했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
