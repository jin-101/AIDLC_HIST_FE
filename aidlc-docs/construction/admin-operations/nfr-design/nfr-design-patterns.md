# NFR 설계 패턴 - Admin Operations

## 범위

이 문서는 Admin Operations Module의 NFR 요구사항을 구현 패턴으로 구체화한다. 대상은 관리자 로그인, dashboard snapshot, 주문 상태 변경, 주문 삭제, table 설정과 completion, history 조회, menu CRUD와 reorder이다.

## 확정된 설계 패턴 결정

| 관심사 | 결정 |
|---|---|
| Mutation 실패 resilience | optimistic update 없이 서버 성공 후 재조회하고, 실패 시 기존 snapshot/form state를 보존한다. |
| Dashboard refresh | 수동 새로고침 버튼과 mutation 성공 후 필요한 snapshot만 재조회한다. |
| PBT helper 경계 | dashboard mapper, status helper, history filter, menu validator, reorder helper를 UI 밖 pure function으로 분리한다. |
| Admin session fallback | safe parse와 schema guard 실패 시 session clear 후 `/admin/login`으로 이동한다. |
| Realtime 경계 | 현재 unit은 snapshot reload boundary만 정의하고, SSE subscribe/apply는 Realtime Event Module에서 추가한다. |

## Resilience 패턴

### Server-Confirmed Mutation Pattern

관리자 mutation은 optimistic update를 사용하지 않는다.

설계 규칙:

- status update, order delete, table completion, menu mutation은 서버 성공 후에만 화면 data를 갱신한다.
- mutation 중에는 대상 action을 disabled 또는 submitting 상태로 표시한다.
- mutation 성공 후 필요한 범위만 재조회한다.
- mutation 실패 시 기존 snapshot, selected item, form draft를 유지한다.
- 실패 메시지와 같은 action 재시도 경로를 제공한다.

적용 이유:

- 관리자 조작은 운영 상태를 바꾸므로 잘못된 optimistic 화면을 피한다.
- local prototype에서 구현 복잡도를 낮추면서 데이터 일관성을 유지한다.

### Failure State Isolation Pattern

조회 상태와 mutation 상태를 분리한다.

| 상태 종류 | 적용 대상 | 실패 시 처리 |
|---|---|---|
| Load state | dashboard/history/menu/table list 조회 | 기존 성공 data가 있으면 유지하고 failed message 표시 |
| Mutation state | status/delete/completion/menu mutation | 대상 action만 failed로 표시하고 기존 data 유지 |
| Session state | admin session parse/login | invalid session은 clear 후 login 이동 |

적용 이유:

- 한 mutation 실패가 전체 dashboard를 failed로 만들지 않는다.
- 관리자가 실패 후 맥락을 잃지 않고 다시 시도할 수 있다.

### Confirmed Destructive Action Pattern

삭제와 완료 처리는 확인 후 실행한다.

설계 규칙:

- order delete, table completion, menu delete는 confirm을 요구한다.
- confirm 취소 시 API 요청을 보내지 않는다.
- confirm 이후 실패하면 기존 화면 상태를 유지한다.
- 성공 후 scoped reload를 수행한다.

## Refresh 패턴

### Manual Refresh With Scoped Reload Pattern

Realtime Event Module 전에는 polling 없이 명시적 refresh를 사용한다.

설계 규칙:

- dashboard에는 수동 새로고침 버튼을 제공한다.
- status update, order delete, table completion 성공 후 dashboard snapshot을 재조회한다.
- menu create/update/delete/reorder 성공 후 menu list를 재조회한다.
- table upsert 성공 후 table list 또는 dashboard snapshot 중 필요한 범위를 재조회한다.
- 실패 시 기존 data를 덮어쓰지 않는다.

### Snapshot Boundary Pattern

dashboard state는 snapshot 단위로 관리한다.

설계 규칙:

- snapshot은 storeId, table cards, loadedAt을 포함한다.
- table card total은 snapshot 생성 또는 mapper 단계에서 active orders 합으로 계산한다.
- Realtime Event Module은 이후 snapshot에 event patch를 적용하거나 snapshot reload를 트리거하는 방식으로 통합한다.

## Session 패턴

### Safe Admin Session Adapter Pattern

sessionStorage 접근은 adapter로 캡슐화한다.

설계 규칙:

- browser 환경인지 확인한 뒤 sessionStorage에 접근한다.
- JSON parse 실패는 exception을 밖으로 던지지 않고 null로 변환한다.
- schema guard 실패는 null로 처리한다.
- null session이면 route guard가 `/admin/login`으로 이동한다.
- admin password는 저장하지 않는다.

## Performance 패턴

### Compact Dashboard Pattern

dashboard는 scan-friendly compact layout을 사용한다.

설계 규칙:

- table card는 table number, active 여부, total amount, latest order preview를 우선 표시한다.
- 상세 정보는 selected table/order 영역에서 표시한다.
- table filter는 client-side pure function으로 처리한다.
- 불필요한 polling을 피하고 수동 refresh와 성공 후 scoped reload를 사용한다.

### Pure Helper Pattern

반복 계산과 validation을 pure function으로 분리한다.

대상:

- dashboard mapper.
- order status helper.
- history date filter helper.
- menu form validator.
- menu reorder helper.

적용 이유:

- 500ms 목표에 영향을 주는 UI 계산을 예측 가능하게 만든다.
- PBT와 example-based test를 쉽게 작성한다.
- page component의 복잡도를 줄인다.

## API 통합 패턴

### Typed Admin API Client Pattern

관리자 API 호출은 얇은 client wrapper를 통해 수행한다.

설계 규칙:

- Foundation API response shape를 해석한다.
- `ok: false` 응답을 UI가 사용할 수 있는 typed error로 변환한다.
- raw fetch와 response parsing을 page component에 반복하지 않는다.
- login, dashboard, order action, table action, history, menu API 함수를 분리한다.

### Scoped Reload Orchestration Pattern

mutation hook은 성공 후 필요한 reload callback만 호출한다.

| Mutation | 성공 후 reload |
|---|---|
| order status update | dashboard snapshot |
| order delete | dashboard snapshot |
| table completion | dashboard snapshot 또는 table list |
| table upsert | table list |
| menu create/update/delete/reorder | menu list |

## PBT 설계 패턴

### Property-Friendly Admin Helpers Pattern

테스트 가능한 core logic을 UI 밖에 둔다.

PBT 대상:

| 대상 | 속성 |
|---|---|
| dashboard mapper | totalAmount는 active orders total 합과 같다. |
| status helper | 반환 status는 허용 status 집합 안에 있다. |
| history filter | date range 밖 order를 제외한다. |
| menu validator | invalid name/category/price를 거부한다. |
| reorder helper | ordered IDs 중복 없이 순서를 보존한다. |

설계 규칙:

- helper는 DOM, fetch, storage에 의존하지 않는다.
- generator는 order, table dashboard, menu draft, date range를 만들 수 있어야 한다.
- UI rendering test와 domain property test를 분리한다.

## Realtime Boundary 패턴

### Snapshot First Realtime Extension Pattern

Admin Operations는 snapshot 기반 dashboard를 먼저 제공한다.

설계 규칙:

- 현재 unit은 SSE subscribe/apply를 구현하지 않는다.
- dashboard hook은 snapshot reload API와 selected state를 소유한다.
- Realtime Event Module은 이후 event bus, SSE route, client subscription, event apply helper를 추가한다.
- event apply helper가 실패하거나 연결이 끊겨도 snapshot reload로 복구할 수 있어야 한다.

## Resiliency 적용 요약

- mutation 실패는 data state와 mutation state를 분리해 격리한다.
- optimistic update를 제외해 rollback 복잡도와 화면 불일치를 줄인다.
- 조회 실패는 빈 상태와 구분한다.
- sessionStorage 손상은 safe adapter에서 login redirect로 흡수한다.
- Realtime 전에는 manual refresh와 scoped reload로 운영 가시성을 제공한다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. pure helper 경계를 PBT 가능하게 설계했다.
- **Resiliency**: 준수. mutation 실패 state 보존, scoped reload, safe session fallback, realtime boundary를 설계 패턴으로 반영했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
