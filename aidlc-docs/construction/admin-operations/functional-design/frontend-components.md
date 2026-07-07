# 프론트엔드 컴포넌트 - Admin Operations

## Route 구조

| Route | 목적 |
|---|---|
| `/admin/login` | 관리자 로그인 |
| `/admin/dashboard` | table dashboard snapshot, order detail, status/delete action |
| `/admin/tables` | table 설정과 table usage completion |
| `/admin/history` | completed session order history 조회 |
| `/admin/menus` | menu CRUD와 reorder |

## 공통 Layout

### AdminShell

| 항목 | 내용 |
|---|---|
| Props | `adminSession`, `children`, `activeRoute` |
| State | sessionStorage에서 복원한 AdminSession |
| 동작 | dashboard, tables, history, menus, logout navigation 제공 |
| 오류 처리 | adminSession이 없으면 login route로 이동 |

### AdminRouteGuard

| 항목 | 내용 |
|---|---|
| 입력 | sessionStorage AdminSession |
| 성공 | child route render |
| 실패 | `/admin/login` 이동 |
| Resiliency | parse 실패 또는 schema mismatch 시 session clear 후 login 이동 |

## Login 화면

### AdminLoginPage

| 항목 | 내용 |
|---|---|
| Route | `/admin/login` |
| State | `storeCode`, `password`, `loadState`, `errorMessage` |
| API | admin login |
| 성공 | AdminSession 저장 후 `/admin/dashboard` 이동 |
| 실패 | 입력값 유지, 오류 표시 |

## Dashboard 화면

### AdminDashboardPage

| 항목 | 내용 |
|---|---|
| Route | `/admin/dashboard` |
| State | `dashboardState`, `selectedTableId`, `selectedOrderId`, `filterText`, `mutationState`, `errorMessage` |
| API | dashboard snapshot, order status update, order delete |
| 실패 | 기존 snapshot 유지, 오류와 재시도 표시 |

### TableCardGrid

| 항목 | 내용 |
|---|---|
| Props | `tables`, `selectedTableId`, `onSelectTable` |
| 표시 | table number, active session 여부, total amount, latest order preview |

### TableCard

| 항목 | 내용 |
|---|---|
| Props | `tableCard`, `isSelected`, `onSelect` |
| 동작 | table detail 선택 |
| 표시 | 신규 주문 강조는 Realtime Event Module 통합 시 추가 |

### OrderDetailPanel

| 항목 | 내용 |
|---|---|
| Props | `order`, `allowedStatuses`, `onStatusChange`, `onDelete` |
| 동작 | 상태 변경, 확인 후 삭제 |
| Validation | status는 허용값 중 하나 |

## Tables 화면

### AdminTablesPage

| 항목 | 내용 |
|---|---|
| Route | `/admin/tables` |
| State | `tables`, `selectedTable`, `tableForm`, `completionState`, `errorMessage` |
| API | table list/upsert, table completion |
| 실패 | 기존 table list 유지, 오류 표시 |

### TableSetupForm

| 항목 | 내용 |
|---|---|
| Props | `value`, `isSubmitting`, `onChange`, `onSubmit` |
| Validation | table number와 password 필수 |

### TableCompletionButton

| 항목 | 내용 |
|---|---|
| Props | `table`, `activeSession`, `onComplete` |
| 동작 | confirm 후 table completion 요청 |
| 표시 | active session이 없으면 disabled |

## History 화면

### AdminHistoryPage

| 항목 | 내용 |
|---|---|
| Route | `/admin/history` |
| State | `filter`, `orders`, `loadState`, `errorMessage` |
| API | history query |
| 실패 | 빈 이력과 구분되는 오류 상태 표시 |

### HistoryFilterForm

| 항목 | 내용 |
|---|---|
| Props | `tables`, `value`, `onChange`, `onSubmit` |
| Validation | tableId 필수, date range 형식 검증 |

### HistoryOrderList

| 항목 | 내용 |
|---|---|
| Props | `orders` |
| 표시 | 주문 번호, 주문 시각, 메뉴, 총액, 상태 |

## Menus 화면

### AdminMenusPage

| 항목 | 내용 |
|---|---|
| Route | `/admin/menus` |
| State | `categories`, `items`, `selectedItem`, `formDraft`, `mutationState`, `errorMessage` |
| API | menu list/create/update/delete/reorder |
| 실패 | form 입력 또는 기존 목록 유지, 오류 표시 |

### MenuItemForm

| 항목 | 내용 |
|---|---|
| Props | `categories`, `value`, `isSubmitting`, `onChange`, `onSubmit` |
| Validation | name, categoryId, positive integer price 필수 |
| Category 처리 | 기존 category 목록에서 선택 |

### MenuItemTable

| 항목 | 내용 |
|---|---|
| Props | `items`, `onEdit`, `onDelete`, `onMove` |
| 동작 | 수정 선택, confirm 후 삭제, 순서 이동 |

## Client Hook 및 Utility

| 이름 | 책임 |
|---|---|
| `useAdminSession` | sessionStorage AdminSession read/write/clear |
| `useAdminDashboard` | dashboard snapshot 조회와 retry |
| `useAdminOrderActions` | status update, delete, mutation state |
| `useAdminTables` | table list/upsert/completion |
| `useAdminHistory` | filter 기반 history 조회 |
| `useAdminMenus` | category/menu list, CRUD, reorder |
| `adminApi` | admin API client wrapper |
| `adminErrorMessages` | API error를 관리자용 메시지로 변환 |

## PBT Testable Properties

| 대상 | 속성 |
|---|---|
| dashboard mapper | table total은 active orders total 합과 같다. |
| order status helper | next recommended status는 허용 status 안에 있다. |
| history filter helper | date range 밖 주문을 제외한다. |
| menu form validator | invalid price/name/category를 거부한다. |
| menu reorder helper | ordered IDs 중복 없이 순서를 보존한다. |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. hook 외부 helper와 mapper를 PBT 가능한 경계로 정의했다.
- **Resiliency**: 준수. 조회 실패와 mutation 실패 시 기존 state 보존 및 retry/확인 흐름을 정의했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
