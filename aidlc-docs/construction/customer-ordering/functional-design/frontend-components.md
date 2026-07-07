# 프론트엔드 컴포넌트 - Customer Ordering

## Route 구조

| Route | 목적 |
|---|---|
| `/customer/setup` | table setup과 context 저장 |
| `/customer/menu` | category별 메뉴 탐색과 cart 추가 |
| `/customer/cart` | cart 검토, 수량 조정, 주문 제출 |
| `/customer/orders` | 현재 session 주문 내역 조회 |

## 공통 Layout

### CustomerShell

고객 화면 공통 navigation과 table context 표시를 담당한다.

| 항목 | 내용 |
|---|---|
| Props | `tableContext`, `cartCount`, `children` |
| State | 없음. route별 container에서 주입한다. |
| 동작 | 메뉴, 장바구니, 주문내역 이동 버튼 제공 |
| 오류 처리 | context가 없을 때 route guard가 setup으로 이동 |

### CustomerRouteGuard

table context가 필요한 route 접근을 보호한다.

| 항목 | 내용 |
|---|---|
| 입력 | localStorage table context |
| 성공 | child route render |
| 실패 | `/customer/setup` 이동 |
| Resiliency | parse 실패 또는 schema 불일치 시 context를 제거하고 setup 이동 |

## Setup 화면

### TableSetupPage

| 항목 | 내용 |
|---|---|
| Route | `/customer/setup` |
| State | `storeCode`, `tableNumber`, `tablePassword`, `loadState`, `errorMessage` |
| API | table credential 검증 및 active session 확보 |
| 성공 | TableContext 저장 후 `/customer/menu` 이동 |
| 실패 | 입력값 유지, 오류 표시 |

### TableSetupForm

| 항목 | 내용 |
|---|---|
| Props | `value`, `isSubmitting`, `errorMessage`, `onChange`, `onSubmit` |
| Validation | 모든 입력은 필수 |
| UX | tablet touch input에 맞는 큰 입력 영역과 제출 버튼 |

## Menu 화면

### CustomerMenuPage

| 항목 | 내용 |
|---|---|
| Route | `/customer/menu` |
| State | `menuLoadState`, `categories`, `items`, `activeCategoryId`, `cartState`, `errorMessage` |
| API | store 기준 menu category/item 조회 |
| 실패 | 오류 메시지와 재시도 버튼 표시 |

### CategoryTabs

| 항목 | 내용 |
|---|---|
| Props | `categories`, `activeCategoryId`, `onSelectCategory` |
| 동작 | category 선택 시 menu list filtering 또는 scroll 이동 |

### MenuItemList

| 항목 | 내용 |
|---|---|
| Props | `items`, `cartState`, `onAddItem` |
| 동작 | menu item을 표시하고 cart 추가 동작 호출 |
| 표시 | 이름, 설명, 가격, category |

### MenuItemCard

| 항목 | 내용 |
|---|---|
| Props | `item`, `quantityInCart`, `onAdd` |
| 동작 | add button 클릭 시 cart quantity 증가 |
| Validation | unavailable item은 추가 불가 |

## Cart 화면

### CustomerCartPage

| 항목 | 내용 |
|---|---|
| Route | `/customer/cart` |
| State | `cartState`, `submitState`, `errorMessage`, `submitResult` |
| API | 주문 생성 |
| 성공 | cart clear, 성공 화면 표시, 5초 후 `/customer/menu` 이동 |
| 실패 | cart 유지, 오류 메시지 표시 |

### CartItemList

| 항목 | 내용 |
|---|---|
| Props | `items`, `onIncrease`, `onDecrease`, `onRemove` |
| 동작 | 수량 증가, 감소, 삭제 |

### CartSummary

| 항목 | 내용 |
|---|---|
| Props | `totalAmount`, `itemCount`, `canSubmit`, `isSubmitting`, `onSubmit`, `onClear` |
| 동작 | 주문 제출, 장바구니 비우기 |
| Validation | cart empty 또는 submitting 상태에서는 제출 비활성화 |

### OrderSuccessPanel

| 항목 | 내용 |
|---|---|
| Props | `orderNumber`, `totalAmount`, `redirectRemainingSeconds` |
| 동작 | 성공 정보 표시 후 자동 redirect |

## Orders 화면

### CustomerOrdersPage

| 항목 | 내용 |
|---|---|
| Route | `/customer/orders` |
| State | `loadState`, `orders`, `errorMessage` |
| API | current session 주문 내역 조회 |
| 성공 | 주문 시각 순으로 표시 |
| 실패 | 오류 메시지와 재시도 버튼 표시 |

### OrderHistoryList

| 항목 | 내용 |
|---|---|
| Props | `orders` |
| 표시 | 주문 번호, 주문 시각, 상태, 항목, 총액 |

### OrderHistoryItem

| 항목 | 내용 |
|---|---|
| Props | `order` |
| 표시 | 주문 단위 상세 정보 |

## Client Hook 및 Utility

| 이름 | 책임 |
|---|---|
| `useTableContext` | TableContext localStorage read/write/clear와 route guard 지원 |
| `useCart` | cart add/update/remove/clear, total 계산, localStorage persistence |
| `useMenuCatalog` | menu API 조회와 retry |
| `useOrderSubmit` | order payload 생성, 제출 상태, 성공/실패 처리 |
| `useCurrentSessionOrders` | 현재 session 주문 내역 조회와 retry |
| `cartStorage` | CartState serialize/deserialize, schema fallback |
| `tableContextStorage` | TableContext serialize/deserialize, schema fallback |

## User Interaction Flow

### 첫 설정

1. 고객이 setup form을 입력한다.
2. 제출 중 버튼이 비활성화된다.
3. 성공 시 table context가 저장된다.
4. 메뉴 화면으로 이동한다.

### 장바구니 추가

1. 고객이 메뉴 항목의 추가 버튼을 누른다.
2. cart state가 갱신된다.
3. total과 cart count가 즉시 갱신된다.
4. localStorage에 저장된다.

### 주문 제출

1. 고객이 cart 화면에서 주문 내역을 확인한다.
2. 주문 제출 버튼을 누른다.
3. 제출 중 중복 제출을 막는다.
4. 성공 시 cart를 비우고 주문 번호를 표시한다.
5. 실패 시 cart를 유지하고 오류를 표시한다.

## PBT Testable Properties

| 대상 | 속성 |
|---|---|
| `useCart` reducer | add, increase, decrease, remove 연산 후 total invariant 유지 |
| `cartStorage` | serialize/deserialize round-trip 후 cart 의미 보존 |
| `useOrderSubmit` payload mapper | payload item 합계가 cart total과 일치 |
| `CustomerCartPage` 실패 처리 | submit 실패 후 cart state가 실패 전과 동일 |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. hook, storage utility, payload mapper의 테스트 가능한 속성을 정의했다.
- **Resiliency**: 준수. API 실패, localStorage parse 실패, 주문 제출 실패의 고객 화면 대응을 정의했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
