# NFR 요구사항 - Admin Operations

## 범위

이 문서는 Admin Operations Module의 관리자 업무 화면에 필요한 비기능 요구사항을 정의한다. 대상 흐름은 관리자 로그인, dashboard snapshot, 주문 상태 변경, 주문 삭제, table 설정과 completion, history 조회, menu CRUD와 reorder이다.

## 확정된 NFR 결정

| 항목 | 결정 |
|---|---|
| 성능 목표 | dashboard snapshot API는 일반 local prototype 조건에서 500ms 이내, status/delete/table/menu mutation은 500ms 이내를 목표로 한다. |
| Realtime 전 갱신 방식 | Realtime Event Module 통합 전에는 수동 새로고침 버튼과 mutation 성공 후 snapshot 재조회를 사용한다. |
| Mutation 실패 처리 | 기존 snapshot/form 값을 유지하고 오류 메시지와 재시도 동작을 제공한다. |
| 접근성/사용성 | 44px 이상 주요 조작 타깃, 명확한 loading/error/disabled/focus 상태, dashboard scan이 쉬운 compact layout을 적용한다. |

## 성능

- dashboard snapshot API는 일반 local prototype 조건에서 500ms 이내 응답을 목표로 한다.
- order status update, order delete, table upsert, table completion, menu CRUD/reorder mutation은 500ms 이내 응답을 목표로 한다.
- dashboard table card filtering은 client-side로 처리하고 즉시 반응해야 한다.
- mutation 성공 후 재조회는 필요한 화면 범위로 제한한다.
  - dashboard mutation은 dashboard snapshot 재조회.
  - menu mutation은 menu list 재조회.
  - table mutation은 table list 또는 dashboard snapshot 재조회.
- Realtime Event Module 통합 전에는 polling을 도입하지 않아 불필요한 API 부하를 피한다.
- dashboard는 compact layout을 사용해 소규모~중규모 매장의 table card와 주문 preview를 빠르게 훑을 수 있어야 한다.

## 가용성 및 복원력

- dashboard 조회 실패 시 기존 snapshot을 덮어쓰지 않는다.
- mutation 실패 시 기존 snapshot, selected order, form draft를 유지한다.
- mutation 실패 시 사용자가 같은 동작을 다시 시도할 수 있어야 한다.
- destructive action은 confirm 또는 간단 확인 dialog를 통과한 경우에만 API 요청을 보낸다.
- history 조회 실패는 빈 history와 구분해야 한다.
- menu list 조회 실패는 menu가 없는 상태와 구분해야 한다.
- sessionStorage parse 실패 또는 schema mismatch는 admin session을 clear하고 login 화면으로 이동한다.
- 관리자 로그인 실패 시 sessionStorage를 갱신하지 않는다.

## 데이터 무결성

- dashboard total은 active session orders total의 합과 일치해야 한다.
- completed session의 order는 dashboard current total에 포함하지 않는다.
- order status는 `waiting`, `preparing`, `completed` 중 하나만 허용한다.
- order delete 성공 후 table total은 남은 active orders 합으로 재계산되어야 한다.
- table completion 성공 후 active dashboard에는 해당 session order가 표시되지 않아야 한다.
- history 조회는 completed session order만 반환해야 한다.
- menu price는 양의 정수여야 한다.
- menu reorder input은 중복 ID를 포함하면 안 된다.

## 사용성 및 접근성

- 주요 버튼, form input, table card action은 가능한 44px 이상 target을 가져야 한다.
- dashboard는 scan-friendly compact layout을 사용한다.
- destructive action은 삭제/완료 의미를 명확히 표시해야 한다.
- loading, submitting, failed, disabled 상태는 시각적으로 구분되어야 한다.
- dashboard, history, menu 화면은 빈 상태와 실패 상태를 구분해서 표시해야 한다.
- order detail은 order number, status, createdAt, line items, totalAmount를 한 화면에서 비교 가능하게 표시해야 한다.
- menu form은 name, category, price validation 오류를 form 근처에 표시해야 한다.

## 보안 및 개인정보

- Security Baseline 확장은 사용자 결정에 따라 비활성화되어 있다.
- 관리자 인증은 MVP용 단순 password 검증이며 production-grade auth가 아니다.
- admin password는 sessionStorage에 저장하지 않는다.
- sessionStorage에는 storeId, storeCode, storeName, login flag 정도만 저장한다.
- API 오류 메시지는 SQL 오류나 stack trace 같은 내부 detail을 노출하지 않아야 한다.
- 서버 API는 client의 sessionStorage만 신뢰하지 않고 storeId/orderId/tableId/menuId 유효성을 검증해야 한다.

## 유지보수성

- dashboard aggregation, order status helper, history filter, menu validation, menu reorder helper는 UI component에서 분리해야 한다.
- admin API client는 Foundation API response shape를 일관되게 처리해야 한다.
- admin route는 `/admin/login`, `/admin/dashboard`, `/admin/tables`, `/admin/history`, `/admin/menus` 구조를 유지한다.
- Realtime Event Module이 추가될 때 dashboard snapshot API와 SSE event apply logic이 충돌하지 않도록 snapshot reload boundary를 명확히 둔다.
- mutation state와 load state는 서로 분리해 한 mutation 실패가 전체 화면을 failed로 만들지 않도록 한다.

## 테스트

- example-based test는 admin login 성공/실패, dashboard 조회 실패, status update 실패, delete 실패, table completion 실패, history 조회 실패, menu validation 실패를 다뤄야 한다.
- property-based test는 Admin Operations Functional Design에서 식별한 속성을 다뤄야 한다.
  - dashboard total은 active order total 합과 같다.
  - order status helper는 허용 status만 반환한다.
  - deletion 후 total은 남은 order 합과 같다.
  - completed session은 active dashboard에서 제외된다.
  - history date filter는 범위 밖 order를 제외한다.
  - menu reorder는 중복 없이 요청 순서를 보존한다.
- PBT는 `fast-check`를 사용하고 Vitest에서 실행 가능해야 한다.
- Build and Test 단계에서는 PBT seed 재현 방법을 문서화해야 한다.

## 관측성

- admin API 실패는 구조화된 error code로 구분 가능해야 한다.
- client UI는 login, dashboard, status update, delete, completion, history, menu 실패를 서로 다른 사용자 메시지로 표현해야 한다.
- local prototype에서는 production monitoring dashboard가 N/A이다.
- Realtime Event Module 전에는 수동 새로고침과 mutation 성공 후 재조회가 운영 가시성의 기준이다.

## Resiliency 준수

- **RESILIENCY-01**: 준수. 관리자 dashboard와 mutation 흐름을 운영 가시성 핵심 workload로 식별했다.
- **RESILIENCY-02**: 부분 적용. project-level RTO/RPO는 요구사항에서 시간 단위로 정의되어 있으며, 이 unit은 state 보존과 재시도 UX로 단기 실패를 완화한다.
- **RESILIENCY-03**: N/A. MVP에서는 formal change management를 제외했다.
- **RESILIENCY-04**: 부분 적용. CI/CD와 rollback은 project-level Build and Test에서 다룬다.
- **RESILIENCY-05**: 부분 적용. 구조화된 error code와 UI failure state를 요구한다. production metrics routing은 local prototype에서 N/A이다.
- **RESILIENCY-06**: 부분 적용. backend health check는 Foundation/Build and Test 범위이며, admin UI는 API 실패 상태를 표시한다.
- **RESILIENCY-07~RESILIENCY-09**: local prototype에서는 N/A.
- **RESILIENCY-10**: 준수. 실패 격리는 기존 snapshot/form state 보존과 mutation state 분리로 반영한다.
- **RESILIENCY-11~RESILIENCY-13**: server data backup/restore는 Foundation and Data 및 Build and Test 범위이다.
- **RESILIENCY-14**: N/A. local prototype에는 automated failover가 없다.
- **RESILIENCY-15**: N/A. MVP 운영 연동은 제외하고 incident response는 문서화만 한다.

## PBT 준수

- **PBT-01**: 준수. Admin Operations의 테스트 가능한 속성을 기능 설계와 NFR 요구사항에서 추적했다.
- **PBT-02**: 준수 계획. history filter와 menu reorder transformation에 적용한다.
- **PBT-03**: 준수 계획. dashboard total, status allowed value, menu validation invariant에 적용한다.
- **PBT-04**: N/A. 관리자 mutation은 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 MVP 범위 밖이다.
- **PBT-06**: 준수 계획. order status/delete/table completion state transition에 적용한다.
- **PBT-07**: Code Generation 단계에서 generator를 구현한다.
- **PBT-08**: Build and Test 단계에서 seed reproducibility를 문서화한다.
- **PBT-09**: 준수. TypeScript PBT framework는 `fast-check`이다.
- **PBT-10**: 준수 계획. example-based test와 PBT를 함께 사용한다.
