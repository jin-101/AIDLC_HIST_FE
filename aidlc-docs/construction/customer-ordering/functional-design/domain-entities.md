# 도메인 엔티티 - Customer Ordering

## 개요

Customer Ordering Module은 Foundation and Data Module의 persisted entity를 사용하고, 고객 화면에 필요한 client-side state와 view model을 추가한다.

## Foundation Entity 재사용

| Entity | 사용 목적 |
|---|---|
| Store | table setup과 menu 조회의 store 범위 지정 |
| Table | 고객 태블릿의 table 식별 |
| TableSession | 현재 손님의 주문 범위 지정 |
| MenuCategory | menu category 탐색 |
| MenuItem | cart 추가 대상 |
| Order | 주문 성공 및 현재 세션 이력 표시 |
| OrderItem | 주문 항목 표시 |
| OrderWithItems | 주문 내역 화면의 기본 표시 단위 |

## Client Entity

### TableContext

고객 태블릿이 현재 어떤 매장/테이블/session에 연결되어 있는지 나타내는 client-side context이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| storeId | string | 서버 store ID |
| storeCode | string | setup 입력과 재검증에 사용하는 store code |
| tableId | string | 서버 table ID |
| tableNumber | string | 고객 표시용 table number |
| sessionId | string | active table session ID |
| savedAt | string | localStorage 저장 시각 |

### CartItem

주문 전 장바구니에 담긴 메뉴 snapshot이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| menuItemId | string | menu item ID |
| menuName | string | 주문 시점 표시명 snapshot |
| categoryId | string | category grouping 보조값 |
| quantity | number | 1 이상의 정수 |
| unitPrice | number | 주문 시점 단가 snapshot |
| lineTotal | number | quantity와 unitPrice의 곱 |

### CartState

localStorage에 저장되는 cart 전체 상태이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| storeId | string | cart가 속한 store ID |
| tableId | string | cart가 속한 table ID |
| sessionId | string | cart가 속한 session ID |
| items | CartItem[] | cart item 목록 |
| totalAmount | number | line total 합 |
| updatedAt | string | 마지막 변경 시각 |

### OrderDraft

주문 제출 직전에 cart에서 만든 서버 제출용 초안이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| storeId | string | 주문 store ID |
| tableId | string | 주문 table ID |
| sessionId | string | 주문 session ID |
| items | OrderDraftItem[] | 제출 item 목록 |
| totalAmount | number | 검증용 총액 |

### OrderDraftItem

| 필드 | 타입 | 설명 |
|---|---|---|
| menuItemId | string | menu item ID |
| menuName | string | 주문 시점 메뉴명 |
| quantity | number | 주문 수량 |
| unitPrice | number | 주문 시점 단가 |
| lineTotal | number | quantity와 unitPrice의 곱 |

### SubmitResult

주문 제출 후 고객 화면 전환에 필요한 결과이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| orderId | string | 생성된 주문 ID |
| orderNumber | string | 고객에게 표시할 주문 번호 |
| totalAmount | number | 주문 총액 |
| createdAt | string | 주문 생성 시각 |

## State Enum

### SubmitState

| 값 | 의미 |
|---|---|
| idle | 제출 전 |
| submitting | 제출 API 호출 중 |
| succeeded | 주문 성공 화면 표시 중 |
| failed | 주문 실패 메시지 표시 중 |

### LoadState

| 값 | 의미 |
|---|---|
| idle | 아직 조회 전 |
| loading | API 조회 중 |
| loaded | 조회 성공 |
| failed | 조회 실패 |

## Entity 관계

| 관계 | 설명 |
|---|---|
| TableContext to CartState | storeId, tableId, sessionId가 모두 일치해야 같은 고객 흐름으로 간주한다. |
| CartState to OrderDraft | cart items를 서버 제출 가능한 item shape로 변환한다. |
| OrderDraft to OrderWithItems | 성공한 주문은 서버에서 OrderWithItems로 영속화된다. |
| TableSession to OrderHistory | 현재 active session의 주문만 고객 이력에 표시된다. |

## localStorage Key

| Key | 값 |
|---|---|
| `table-order:customer:table-context` | TableContext JSON |
| `table-order:customer:cart` | CartState JSON |

## PBT Testable Properties

| Entity | 속성 |
|---|---|
| CartItem | lineTotal은 항상 quantity와 unitPrice의 곱이다. |
| CartState | totalAmount는 items의 lineTotal 합과 같다. |
| CartState | 동일 session scope에서 serialize/deserialize 후 items와 totalAmount가 보존된다. |
| OrderDraft | 빈 cart에서는 생성할 수 없다. |
| OrderDraft | 모든 item의 quantity와 unitPrice는 양수이다. |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. client entity별 invariant와 round-trip property를 정의했다.
- **Resiliency**: 준수. localStorage parse 실패와 session scope 불일치에 대응 가능한 entity boundary를 분리했다.
