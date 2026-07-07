# 컴포넌트 메서드

## UI 수준 메서드

### Customer Shell

| 메서드 | 입력 | 출력 | 목적 |
|---|---|---|---|
| `loadStoredTableContext` | 없음 | `TableContext | null` | localStorage에서 table setup 복원. |
| `requireTableContext` | `TableContext | null` | `boolean` | setup 화면 필요 여부 판단. |

### Table Setup View

| 메서드 | 입력 | 출력 | 목적 |
|---|---|---|---|
| `submitTableSetup` | `{ storeCode, tableNumber, tablePassword }` | `Promise<TableContext>` | 테이블 credential 검증 및 context 생성/복원. |
| `saveTableContext` | `TableContext` | `void` | table context 로컬 저장. |

### Menu Browser View

| 메서드 | 입력 | 출력 | 목적 |
|---|---|---|---|
| `loadMenu` | `{ storeId }` | `Promise<MenuCategory[]>` | 카테고리와 메뉴 항목 조회. |
| `addMenuItemToCart` | `MenuItem` | `Cart` | 선택한 항목을 cart에 추가. |

### Cart View

| 메서드 | 입력 | 출력 | 목적 |
|---|---|---|---|
| `loadCart` | 없음 | `Cart` | localStorage에서 cart 복원. |
| `setItemQuantity` | `{ menuItemId, quantity }` | `Cart` | 수량 변경. |
| `removeCartItem` | `menuItemId` | `Cart` | cart item 삭제. |
| `calculateCartTotal` | `CartItem[]` | `number` | cart total 계산. |
| `submitOrder` | `{ tableContext, cart }` | `Promise<OrderResult>` | 확정된 cart를 API로 전송. |

### Admin Dashboard View

| 메서드 | 입력 | 출력 | 목적 |
|---|---|---|---|
| `connectOrderEvents` | 없음 | `EventSource` | admin SSE endpoint 구독. |
| `loadDashboardState` | `{ storeId }` | `Promise<TableDashboard[]>` | 현재 table/order snapshot 조회. |
| `applyOrderEvent` | `{ state, event }` | `TableDashboard[]` | SSE event를 dashboard state에 적용. |

## API Route Handlers

| Route | Method | Service Call | 목적 |
|---|---|---|---|
| `/api/customer/table-session` | POST | `tableService.setupCustomerTable` | table setup 검증 및 context 반환. |
| `/api/customer/menus` | GET | `menuService.listVisibleMenus` | 카테고리별 메뉴 반환. |
| `/api/customer/orders` | POST | `orderService.createOrder` | cart payload로 주문 생성. |
| `/api/customer/orders` | GET | `orderService.listCurrentSessionOrders` | 현재 session 주문 반환. |
| `/api/admin/login` | POST | `adminService.login` | 단순 관리자 로그인. |
| `/api/admin/dashboard` | GET | `orderService.getDashboard` | table dashboard snapshot 반환. |
| `/api/admin/events` | GET | `eventService.createSseStream` | SSE stream 생성. |
| `/api/admin/orders/:id/status` | PATCH | `orderService.updateOrderStatus` | 주문 상태 변경. |
| `/api/admin/orders/:id` | DELETE | `orderService.deleteOrder` | 주문 삭제. |
| `/api/admin/tables` | POST | `tableService.configureTable` | table credential 생성/수정. |
| `/api/admin/tables/:id/complete` | POST | `tableService.completeTableUsage` | table usage 완료. |
| `/api/admin/history` | GET | `historyService.listHistory` | 과거 주문 조회. |
| `/api/admin/menus` | GET | `menuService.listMenusForAdmin` | 관리자 메뉴 목록. |
| `/api/admin/menus` | POST | `menuService.createMenuItem` | 메뉴 생성. |
| `/api/admin/menus/:id` | PATCH | `menuService.updateMenuItem` | 메뉴 수정. |
| `/api/admin/menus/:id` | DELETE | `menuService.deleteMenuItem` | 메뉴 삭제. |
| `/api/admin/menus/reorder` | PATCH | `menuService.reorderMenuItems` | 표시 순서 변경. |

## Service Methods

- `adminService.login`
- `tableService.setupCustomerTable`
- `tableService.configureTable`
- `tableService.getOrCreateActiveSession`
- `tableService.completeTableUsage`
- `menuService.listVisibleMenus`
- `menuService.listMenusForAdmin`
- `menuService.createMenuItem`
- `menuService.updateMenuItem`
- `menuService.deleteMenuItem`
- `menuService.reorderMenuItems`
- `orderService.createOrder`
- `orderService.listCurrentSessionOrders`
- `orderService.getDashboard`
- `orderService.updateOrderStatus`
- `orderService.deleteOrder`
- `historyService.listHistory`
- `eventService.publish`
- `eventService.subscribe`
- `eventService.unsubscribe`

## Repository Methods

- `storeRepository.findByCode`
- `tableRepository.findByStoreAndNumber`
- `tableRepository.upsertTable`
- `sessionRepository.findActiveByTable`
- `sessionRepository.create`
- `sessionRepository.complete`
- `menuRepository.listByStore`
- `menuRepository.create`
- `menuRepository.update`
- `menuRepository.delete`
- `menuRepository.reorder`
- `orderRepository.createWithItems`
- `orderRepository.listBySession`
- `orderRepository.updateStatus`
- `orderRepository.delete`
- `orderRepository.dashboardByStore`
- `historyRepository.listByTableAndDate`
