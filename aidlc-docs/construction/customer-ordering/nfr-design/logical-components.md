# 논리 컴포넌트 - Customer Ordering NFR Design

## 개요

Customer Ordering Module은 UI page component와 테스트 가능한 client logic을 분리한다. 논리 컴포넌트는 Next.js/React 안에서 구현되며, 별도 infrastructure service나 외부 dependency를 추가하지 않는다.

## 컴포넌트 목록

| 컴포넌트 | 책임 |
|---|---|
| Customer Route Pages | `/customer/setup`, `/customer/menu`, `/customer/cart`, `/customer/orders` 화면을 제공한다. |
| Customer Route Guard | table context 필요 여부를 확인하고 setup 이동을 처리한다. |
| Table Context Storage Adapter | table context localStorage read/write/clear와 safe parse를 담당한다. |
| Cart Storage Adapter | cart localStorage read/write/clear, schema guard, session scope fallback을 담당한다. |
| Cart Domain Service | cart add/update/remove/clear, total 재계산, payload 준비에 필요한 pure logic을 담당한다. |
| Customer API Client | setup, menu, order, history API 호출과 response mapping을 담당한다. |
| Customer UI Hooks | storage, API client, domain service를 조합해 page state를 제공한다. |
| Failure Message Mapper | API/error state를 고객이 이해할 수 있는 메시지로 변환한다. |

## 상세 컴포넌트

### Customer Route Pages

예상 위치:

- `src/app/customer/setup/page.tsx`
- `src/app/customer/menu/page.tsx`
- `src/app/customer/cart/page.tsx`
- `src/app/customer/orders/page.tsx`

책임:

- route별 화면 composition.
- hook에서 받은 state와 action을 UI component에 전달.
- loading, empty, failed, success 상태 표시.
- 직접 localStorage parse나 raw fetch를 수행하지 않는다.

### Customer Route Guard

예상 위치:

- `src/features/customer/customer-route-guard.tsx`
- 또는 route별 hook 내부 guard

책임:

- table context 존재 여부 확인.
- schema mismatch 또는 parse 실패 시 context clear.
- context가 없으면 `/customer/setup`으로 이동.
- context가 있으면 child 화면 render.

입력:

- `tableContextStorage.read()`

출력:

- valid `TableContext`
- setup redirect
- guard loading state

### Table Context Storage Adapter

예상 위치:

- `src/features/customer/table-context-storage.ts`

책임:

- `table-order:customer:table-context` key 관리.
- table password를 저장하지 않음.
- safe parse와 schema guard.
- invalid context fallback.

주요 함수:

- `readTableContext(): TableContext | null`
- `writeTableContext(context: TableContext): void`
- `clearTableContext(): void`
- `isTableContext(value: unknown): value is TableContext`

Resiliency:

- storage 접근 실패, JSON parse 실패, schema mismatch를 null로 fallback한다.

### Cart Storage Adapter

예상 위치:

- `src/features/cart/cart-storage.ts`

책임:

- `table-order:customer:cart` key 관리.
- CartState safe parse.
- session scope check.
- deserialize 후 total 재계산.

주요 함수:

- `readCart(context: TableContext): CartState`
- `writeCart(cart: CartState): void`
- `clearCart(): void`
- `isCartState(value: unknown): value is CartState`

Resiliency:

- JSON parse 실패 시 empty cart.
- schema mismatch 시 empty cart.
- context scope mismatch 시 empty cart.
- storage write 실패 시 UI state는 유지하고 오류 표시 가능 상태를 반환한다.

PBT:

- serialize/deserialize round-trip property.
- malformed input fallback property.
- scope mismatch empty fallback property.

### Cart Domain Service

예상 위치:

- `src/features/cart/cart-service.ts`

책임:

- cart core operation을 pure function으로 제공.
- line total과 total amount 재계산.
- order payload mapper에 필요한 cart snapshot 검증.

주요 함수:

- `createEmptyCart(context: TableContext): CartState`
- `addItem(cart: CartState, item: MenuItem): CartState`
- `increaseQuantity(cart: CartState, menuItemId: string): CartState`
- `decreaseQuantity(cart: CartState, menuItemId: string): CartState`
- `removeItem(cart: CartState, menuItemId: string): CartState`
- `clearCartItems(cart: CartState): CartState`
- `toOrderDraft(context: TableContext, cart: CartState): OrderDraft`

PBT:

- total invariant.
- quantity never negative.
- same item merge.
- empty cart cannot produce order draft.
- order draft total equals cart total.

### Customer API Client

예상 위치:

- `src/features/customer/customer-api.ts`

책임:

- raw fetch 호출을 캡슐화.
- Foundation API response shape를 해석.
- 실패를 typed client error로 변환.

주요 함수:

- `setupTable(input): Promise<TableContext>`
- `fetchMenuCatalog(storeId): Promise<MenuCatalog>`
- `submitOrder(draft): Promise<SubmitResult>`
- `fetchCurrentSessionOrders(context): Promise<OrderWithItems[]>`

Resiliency:

- network/fetch 실패를 `CUSTOMER_API_UNAVAILABLE` 같은 client error로 변환한다.
- API `ok: false`는 error code와 message를 보존한다.
- page component는 raw response parsing을 반복하지 않는다.

### Customer UI Hooks

예상 위치:

- `src/features/customer/use-table-context.ts`
- `src/features/cart/use-cart.ts`
- `src/features/menu/use-menu-catalog.ts`
- `src/features/orders/use-order-submit.ts`
- `src/features/orders/use-current-session-orders.ts`

책임:

- storage adapter, domain service, API client를 조합한다.
- page component에 상태와 action을 제공한다.
- loading, failed, loaded, succeeded 상태를 명시한다.

주요 hook:

| Hook | 책임 |
|---|---|
| `useTableContext` | context read/write/clear와 setup 이동 지원 |
| `useCart` | cart 초기화, 조작, persistence |
| `useMenuCatalog` | menu load, component memory cache, retry |
| `useOrderSubmit` | payload 생성, submit state, success/failure 처리 |
| `useCurrentSessionOrders` | history load, failed state, retry |

### Failure Message Mapper

예상 위치:

- `src/features/customer/customer-error-messages.ts`

책임:

- API error code 또는 storage fallback reason을 고객 메시지로 변환한다.
- 내부 오류 detail을 고객에게 그대로 노출하지 않는다.

예시 mapping:

| Error | 고객 메시지 방향 |
|---|---|
| table setup validation failure | 테이블 정보를 다시 확인하도록 안내 |
| menu load failure | 메뉴를 불러오지 못했으며 다시 시도 가능함을 안내 |
| order submit failure | 장바구니는 유지되며 다시 주문 가능함을 안내 |
| history load failure | 주문 내역을 불러오지 못했으며 재시도 가능함을 안내 |

## 컴포넌트 상호작용

### Menu Flow

1. Route Guard가 TableContext를 확인한다.
2. `useMenuCatalog`가 Customer API Client로 menu catalog를 조회한다.
3. 성공 결과는 component memory에 유지한다.
4. 고객이 menu item을 추가하면 `useCart`가 Cart Domain Service를 호출한다.
5. `useCart`가 Cart Storage Adapter에 변경된 cart를 저장한다.

### Cart Submit Flow

1. `useCart`가 session scoped cart를 제공한다.
2. 고객이 제출하면 `useOrderSubmit`이 Cart Domain Service의 `toOrderDraft`를 호출한다.
3. Customer API Client가 order submit API를 호출한다.
4. 성공 시 Cart Storage Adapter가 cart를 비운다.
5. 실패 시 Cart Storage Adapter를 수정하지 않고 submit state만 failed로 둔다.

### History Flow

1. Route Guard가 TableContext를 확인한다.
2. `useCurrentSessionOrders`가 Customer API Client로 current session order를 조회한다.
3. 성공 시 주문 목록을 표시한다.
4. 실패 시 빈 목록 대신 failed state와 retry action을 표시한다.

## NFR 추적성

| NFR | 컴포넌트 대응 |
|---|---|
| 100ms 체감 화면 전환 | route 분리, pure cart service, component memory state |
| API 300ms 목표 | API client 경계, 불필요한 재호출 방지 |
| 주문 실패 cart 보존 | useOrderSubmit, Cart Storage Adapter |
| localStorage fallback | Table Context Storage Adapter, Cart Storage Adapter |
| 44px touch target과 UI state | Customer Route Pages와 UI component |
| PBT 가능성 | Cart Domain Service, Storage Adapter, Payload Mapper |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. 테스트 가능한 pure component 경계를 명시했다.
- **Resiliency**: 준수. 실패 격리, 수동 재시도, safe fallback, failed state 분리를 논리 컴포넌트에 매핑했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
