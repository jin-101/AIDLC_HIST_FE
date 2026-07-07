# 기술 스택 결정 - Customer Ordering

## 선택 기술

| 관심사 | 결정 | 근거 |
|---|---|---|
| Application framework | Next.js App Router | 승인된 프로젝트 아키텍처이며 customer route를 명시적으로 구성하기 적합하다. |
| Language | TypeScript | TableContext, CartState, OrderDraft 같은 client model을 type-safe하게 다룬다. |
| UI runtime | React client components | localStorage, cart interaction, redirect timer, loading/error state를 client에서 처리해야 한다. |
| Client persistence | browser localStorage | table context와 cart persistence에 충분하며 프로토타입 요구사항과 일치한다. |
| State organization | React hook + pure utility 조합 | cart reducer, storage adapter, payload mapper를 UI와 분리해 테스트 가능하게 만든다. |
| API contract | Foundation API response helper | `{ ok: true, data }`, `{ ok: false, error }` 형태를 고객 화면에서 일관되게 처리한다. |
| Test runner | Vitest | Foundation에서 선택한 test runner를 재사용한다. |
| Property-based testing | `fast-check` | 활성화된 PBT 확장 요구사항이며 cart/state transformation 검증에 적합하다. |

## Route 및 Rendering 결정

| Route | Rendering 성격 | 이유 |
|---|---|---|
| `/customer/setup` | Client component 중심 | form state, localStorage context 저장, submit loading/error가 필요하다. |
| `/customer/menu` | Server/API data + client cart interaction | menu 조회와 cart 추가 상호작용이 필요하다. |
| `/customer/cart` | Client component 중심 | cart 수정, payload 생성, submit state, 실패 시 cart 보존이 필요하다. |
| `/customer/orders` | API data 조회 + client retry | current session history 조회와 실패 재시도가 필요하다. |

## Local Storage 결정

| Key | 결정 |
|---|---|
| `table-order:customer:table-context` | TableContext만 저장한다. table password는 저장하지 않는다. |
| `table-order:customer:cart` | CartState만 저장한다. session scope mismatch 시 empty cart로 fallback한다. |

Storage adapter 요구사항:

- JSON parse 실패를 throw하지 않고 safe result로 반환한다.
- schema mismatch는 empty state로 처리한다.
- cart total은 deserialize 후 재계산한다.
- storage 접근은 browser 환경에서만 실행한다.

## State Management 결정

- 별도 전역 state library는 도입하지 않는다.
- `useCart`, `useTableContext`, `useOrderSubmit`, `useCurrentSessionOrders` 같은 hook을 사용한다.
- cart 연산은 pure reducer 또는 pure function으로 작성해 PBT 대상이 되도록 한다.
- 제출 중복 방지는 `submitState === "submitting"`으로 제어한다.

## API Integration 결정

| 기능 | Client 처리 |
|---|---|
| Table setup | credential 검증 API 호출 후 TableContext 저장 |
| Menu catalog | 조회 실패 시 retry 가능한 failed state 표시 |
| Order submit | cart snapshot으로 payload 생성, 성공 시 cart clear, 실패 시 cart 유지 |
| Current session orders | session ID 기준 조회, 실패 시 빈 상태와 구분 |

## UX 기술 결정

- CSS는 기존 Next.js 앱 구조 안에서 전역 스타일 또는 scoped module 중 현재 code generation 단계의 프로젝트 패턴에 맞춰 적용한다.
- 주요 button과 input은 44px 이상 터치 타깃을 확보한다.
- loading, disabled, failed state는 component prop/state로 명시한다.
- 성공 redirect는 `setTimeout` 기반 client timer로 구현하되 component unmount 시 timer를 정리한다.

## 테스트 기술 결정

| 테스트 대상 | 방식 |
|---|---|
| cart reducer | Vitest example test + `fast-check` state sequence property |
| cartStorage | `fast-check` round-trip property |
| order payload mapper | example test + total invariant property |
| failed submit preservation | mock API failure example test |
| route guard | table context 없음 또는 parse 실패 시 setup 이동 동작 검증 |

## Dependency 영향

새 runtime dependency는 기본적으로 추가하지 않는다.

이미 Foundation에서 선택한 dependency를 재사용한다.

- `next`
- `react`
- `react-dom`
- `vitest`
- `fast-check`

후속 Code Generation 단계에서 테스트 유틸이 필요하면 최소 범위로 추가 여부를 판단한다.

## Prototype 제약

- localStorage는 같은 브라우저/기기 안에서만 유지된다.
- 다중 태블릿 동기화는 이 unit 범위가 아니다.
- offline order queue는 구현하지 않는다. 주문 API 실패 시 cart 보존과 수동 재시도로 처리한다.
- production monitoring, analytics, Sentry 같은 외부 관측성 도구는 MVP 범위 밖이다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. `fast-check`를 유지하고 cart reducer, storage, payload mapper를 pure function 중심으로 설계한다.
- **Resiliency**: 준수. 실패 격리와 재시도 가능성을 client state와 storage adapter 설계에 반영한다.
- **Security Baseline**: 사용자 결정에 따라 비활성화되어 적용하지 않는다.
