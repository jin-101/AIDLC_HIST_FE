# 비즈니스 로직 모델 - Admin Operations

## 범위

Admin Operations Module은 매장 관리자가 주문과 테이블을 모니터링하고 관리하는 흐름을 담당한다. 포함 범위는 관리자 로그인, dashboard snapshot, table card/order detail, 주문 상태 변경, 주문 삭제, table usage completion, 과거 주문 조회, menu CRUD와 표시 순서 관리이다.

## 확정된 설계 결정

| 항목 | 결정 |
|---|---|
| 관리자 route 구조 | `/admin/login`, `/admin/dashboard`, `/admin/tables`, `/admin/history`, `/admin/menus`로 명시적으로 분리한다. |
| 로그인 상태 | storeId와 admin login flag를 sessionStorage에 저장하고 브라우저 세션 동안 유지한다. |
| 주문 상태 변경 | `waiting -> preparing -> completed` 순방향 변경을 기본으로 하되 관리자는 이전 상태로도 수동 정정할 수 있다. |
| destructive action 확인 | 주문 삭제와 table completion은 브라우저 confirm 또는 간단 확인 dialog로 확인 후 실행한다. |
| 메뉴 category 처리 | 기존 category 목록에서 선택하고 MVP에서는 category 생성/삭제를 제외한다. |

## 핵심 Workflow

### 관리자 로그인

1. 관리자가 `/admin/login`에서 store code와 admin password를 입력한다.
2. 시스템은 store를 조회하고 admin credential을 검증한다.
3. 성공 시 sessionStorage에 storeId, storeCode, storeName, login flag를 저장한다.
4. 관리자를 `/admin/dashboard`로 이동시킨다.
5. 실패 시 입력값을 유지하고 오류 메시지를 표시한다.

### Dashboard Snapshot 조회

1. `/admin/dashboard` 진입 시 admin session을 요구한다.
2. storeId 기준으로 table dashboard snapshot을 조회한다.
3. 각 table card는 table number, active session, 현재 session 주문 목록, 총액, 최신 주문 preview를 표시한다.
4. table filter는 table number 또는 상태 기준으로 client-side 적용한다.
5. Realtime Event Module이 통합되기 전에는 수동 새로고침으로 최신 snapshot을 다시 조회한다.

### 주문 상세 및 상태 변경

1. 관리자가 table card 또는 order row를 선택한다.
2. 상세 영역은 order number, status, createdAt, line items, totalAmount를 표시한다.
3. 상태 변경은 `waiting`, `preparing`, `completed` 중 하나로 요청한다.
4. 기본 UI는 다음 상태로 진행하는 action을 우선 제공한다.
5. 정정이 필요하면 관리자는 이전 상태를 포함해 수동 선택할 수 있다.
6. 실패 시 기존 화면 state를 유지하고 오류 메시지를 표시한다.

### 주문 삭제

1. 관리자가 특정 주문 삭제를 요청한다.
2. 시스템은 confirm 또는 간단 확인 dialog를 표시한다.
3. 확인된 삭제만 API로 전송한다.
4. 삭제 성공 후 dashboard snapshot 또는 table detail을 다시 조회한다.
5. 삭제 실패 시 기존 주문 목록을 유지하고 실패 메시지를 표시한다.

### Table Usage Completion

1. 관리자가 active session이 있는 table에서 이용 완료를 요청한다.
2. 시스템은 confirm 또는 간단 확인 dialog를 표시한다.
3. 확인 후 active table session을 completed로 변경한다.
4. 완료 성공 후 dashboard에서 해당 table의 현재 주문 목록과 총액은 0으로 표시된다.
5. 완료된 session의 주문은 history 조회 대상이 된다.
6. 완료 실패 시 active dashboard 상태를 유지하고 오류 메시지를 표시한다.

### 과거 주문 조회

1. 관리자가 `/admin/history`에서 table과 날짜 범위를 선택한다.
2. 시스템은 completed session에 속한 주문만 조회한다.
3. 주문은 최신순으로 표시한다.
4. 각 항목은 주문 번호, 주문 시각, menu item, totalAmount, table completion context를 표시한다.
5. 조회 실패 시 빈 이력과 구분되는 실패 상태와 재시도 동작을 제공한다.

### 메뉴 관리

1. 관리자가 `/admin/menus`에서 기존 category 목록과 menu item 목록을 조회한다.
2. 메뉴 생성/수정은 name, price, description, category, displayOrder를 입력한다.
3. category는 기존 목록에서 선택한다.
4. price는 양의 정수여야 한다.
5. 메뉴 삭제는 confirm 후 실행한다.
6. 표시 순서 변경은 ordered menu IDs를 API로 전송한다.
7. 성공 후 menu 목록을 다시 조회한다.

## API 통합

| 기능 | API 방향 | 기대 응답 |
|---|---|---|
| 관리자 로그인 | store code/password 검증 | AdminSession |
| dashboard snapshot | storeId 기준 table dashboard 조회 | TableDashboard[] |
| 주문 상태 변경 | orderId/status 변경 | updated Order |
| 주문 삭제 | orderId 삭제 | success result |
| table 설정 | table number/password upsert | Table |
| table completion | tableId active session 완료 | completed TableSession |
| history 조회 | tableId/date range 조회 | OrderWithItems[] |
| menu 관리 | category/menu item CRUD/reorder | MenuCategory[], MenuItem[] |

## PBT Testable Properties

| 속성 | 범주 | 기대 규칙 |
|---|---|---|
| dashboard total은 active session order total 합과 같다 | Invariant | table card totalAmount는 orders totalAmount 합과 일치한다. |
| order status는 허용값 안에 머문다 | Invariant | 상태 변경 결과는 waiting, preparing, completed 중 하나다. |
| 주문 삭제 후 table total은 남은 주문 합과 같다 | State transition | 삭제된 order를 제외한 합계가 dashboard total이 된다. |
| completed session은 active dashboard에 나타나지 않는다 | Invariant | table completion 후 active orders는 비어야 한다. |
| history date filter는 범위 밖 주문을 제외한다 | Invariant | dateFrom/dateTo 밖 createdAt을 가진 주문은 반환되지 않는다. |
| menu reorder는 입력 ordered IDs 순서를 보존한다 | Round-trip / Ordering | reorder 결과 display order는 요청 순서와 일치한다. |

## Resiliency 반영

| 실패 상황 | 설계 대응 |
|---|---|
| 관리자 로그인 실패 | login 화면 유지, 오류 표시, sessionStorage 저장 없음 |
| dashboard 조회 실패 | 이전 snapshot을 덮어쓰지 않고 실패 상태와 재시도 표시 |
| 주문 상태 변경 실패 | 기존 order status 유지, 오류 표시 |
| 주문 삭제 실패 | 주문 목록 유지, 오류 표시 |
| table completion 실패 | active session 상태 유지, 오류 표시 |
| history 조회 실패 | 빈 이력과 구분되는 실패 상태 표시 |
| menu mutation 실패 | form 입력 유지, 오류 표시 |

## 확장 규칙 준수

### Property-Based Testing

- **PBT-01**: 준수. dashboard aggregation, status transition, deletion recalculation, history filter, menu reorder 속성을 식별했다.
- **PBT-02**: menu reorder와 history filter transformation에 적용 계획.
- **PBT-03**: dashboard total, status allowed value, menu validation invariant에 적용 계획.
- **PBT-06**: order status/delete/table completion state transition에 적용 계획.
- **PBT-07~PBT-10**: Code Generation 및 Build and Test에서 구체화한다.

### Resiliency

- **활성화 상태**: `aidlc-state.md` 기준 Resiliency Baseline은 enabled이다.
- **적용 결과**: 관리자 mutation 실패 시 기존 화면 상태 보존, destructive action 확인, 조회 실패 상태 분리를 반영했다.
- **N/A 판단**: production monitoring, multi-region failover, automated DR은 local MVP 기능 설계 범위를 벗어난다.
