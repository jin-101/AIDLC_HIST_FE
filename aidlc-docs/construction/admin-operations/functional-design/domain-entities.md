# 도메인 엔티티 - Admin Operations

## 개요

Admin Operations Module은 Foundation and Data Module의 persisted entity를 재사용하고, 관리자 화면에 필요한 view model과 client session state를 추가한다.

## Foundation Entity 재사용

| Entity | 사용 목적 |
|---|---|
| Store | 관리자 로그인과 admin session의 store 범위 |
| Table | dashboard card, table 설정, history filter |
| TableSession | active/completed session 구분, table completion |
| MenuCategory | menu form category 선택 |
| MenuItem | menu CRUD와 reorder |
| Order | dashboard, order detail, status update, deletion |
| OrderItem | order detail과 history line item 표시 |
| OrderWithItems | dashboard/history 화면 기본 주문 표시 단위 |
| TableDashboard | table card snapshot |
| AdminCredential | prototype 관리자 로그인 검증 |

## Admin Client Entity

### AdminSession

관리자 브라우저 세션 동안 유지되는 client-side 로그인 상태이다.

| 필드 | 타입 | 설명 |
|---|---|---|
| storeId | string | 로그인한 store ID |
| storeCode | string | 로그인한 store code |
| storeName | string | 관리자 화면 표시용 store name |
| loggedIn | boolean | 로그인 여부 |
| savedAt | string | sessionStorage 저장 시각 |

### AdminDashboardSnapshot

dashboard 화면에 표시할 table card 목록과 조회 상태를 담는다.

| 필드 | 타입 | 설명 |
|---|---|---|
| storeId | string | 조회 store ID |
| tables | AdminTableCard[] | table card 목록 |
| loadedAt | string | snapshot 조회 시각 |

### AdminTableCard

| 필드 | 타입 | 설명 |
|---|---|---|
| tableId | string | table ID |
| tableNumber | string | table number |
| activeSessionId | string 또는 null | active session ID |
| orders | OrderWithItems[] | active session 주문 목록 |
| totalAmount | number | active orders total 합 |
| latestOrder | OrderWithItems 또는 null | 최신 주문 preview |

### AdminOrderDetail

| 필드 | 타입 | 설명 |
|---|---|---|
| order | OrderWithItems | 상세 주문 |
| tableNumber | string | 표시용 table number |
| allowedStatuses | OrderStatus[] | 선택 가능한 상태 목록 |
| nextRecommendedStatus | OrderStatus 또는 null | 기본 진행 action |

### TableCompletionResult

| 필드 | 타입 | 설명 |
|---|---|---|
| tableId | string | 완료된 table ID |
| sessionId | string | 완료된 session ID |
| completedAt | string | 완료 시각 |

### AdminHistoryFilter

| 필드 | 타입 | 설명 |
|---|---|---|
| tableId | string | 필수 table filter |
| dateFrom | string 또는 undefined | 선택 시작일 |
| dateTo | string 또는 undefined | 선택 종료일 |

### MenuFormDraft

| 필드 | 타입 | 설명 |
|---|---|---|
| id | string 또는 undefined | 수정 시 menu item ID |
| name | string | 메뉴명 |
| description | string | 설명 |
| price | number | 양의 정수 가격 |
| categoryId | string | 기존 category ID |
| displayOrder | number | 표시 순서 |

## State Enum

### AdminLoadState

| 값 | 의미 |
|---|---|
| idle | 조회 전 |
| loading | 요청 중 |
| loaded | 요청 성공 |
| failed | 요청 실패 |

### AdminMutationState

| 값 | 의미 |
|---|---|
| idle | mutation 전 |
| submitting | mutation 요청 중 |
| succeeded | mutation 성공 |
| failed | mutation 실패 |

## Entity 관계

| 관계 | 설명 |
|---|---|
| AdminSession to Dashboard | AdminSession.storeId가 dashboard snapshot 범위를 결정한다. |
| Table to AdminTableCard | 각 table은 하나의 card로 표시된다. |
| TableSession to AdminTableCard | active session만 card의 current orders를 제공한다. |
| OrderWithItems to AdminOrderDetail | order detail은 line item과 status 변경 action을 포함한다. |
| Completed TableSession to History | completed session에 속한 order만 history 조회 대상이다. |
| MenuCategory to MenuFormDraft | menu form은 기존 category를 선택한다. |

## Storage Key

| Key | 값 |
|---|---|
| `table-order:admin:session` | AdminSession JSON in sessionStorage |

## PBT Testable Properties

| Entity | 속성 |
|---|---|
| AdminTableCard | totalAmount는 orders totalAmount 합과 같다. |
| AdminOrderDetail | allowedStatuses는 허용 status 집합 안에 있다. |
| AdminHistoryFilter | date range 밖 order는 포함하지 않는다. |
| MenuFormDraft | price는 양의 정수여야 valid하다. |
| Menu reorder input | orderedIds는 중복 없이 순서를 보존해야 한다. |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. 관리자 view model별 invariant와 filter/order 속성을 정의했다.
- **Resiliency**: 준수. client session, snapshot, mutation state를 분리해 실패 시 기존 상태 보존이 가능하도록 했다.
