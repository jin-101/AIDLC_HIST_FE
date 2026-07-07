# 기술 스택 결정 - Admin Operations

## 선택 기술

| 관심사 | 결정 | 근거 |
|---|---|---|
| Application framework | Next.js App Router | 승인된 프로젝트 아키텍처이며 admin route를 명시적으로 구성하기 적합하다. |
| Language | TypeScript | AdminSession, dashboard view model, menu form draft, mutation state를 type-safe하게 다룬다. |
| UI runtime | React client components | sessionStorage, filter, selected order, mutation loading/error state를 client에서 처리해야 한다. |
| Client session persistence | browser sessionStorage | 브라우저 세션 동안만 관리자 login state를 유지하는 MVP 요구에 적합하다. |
| State organization | React hook + pure utility 조합 | dashboard mapper, status helper, menu validation, reorder helper를 테스트 가능하게 만든다. |
| API contract | Foundation API response helper | `{ ok: true, data }`, `{ ok: false, error }` 형태를 관리자 화면에서 일관되게 처리한다. |
| Dashboard refresh | Manual refresh + mutation success reload | Realtime Event Module 전의 단순하고 예측 가능한 갱신 방식이다. |
| Test runner | Vitest | Foundation에서 선택한 test runner를 재사용한다. |
| Property-based testing | `fast-check` | 활성화된 PBT 확장 요구사항이며 aggregation/filter/reorder 검증에 적합하다. |

## Route 및 Rendering 결정

| Route | Rendering 성격 | 이유 |
|---|---|---|
| `/admin/login` | Client component 중심 | form state, sessionStorage 저장, login loading/error가 필요하다. |
| `/admin/dashboard` | API data 조회 + client selection/filter | snapshot 조회, table/order 선택, mutation state가 필요하다. |
| `/admin/tables` | API data 조회 + form interaction | table upsert와 completion 확인 흐름이 필요하다. |
| `/admin/history` | API data 조회 + filter form | table/date filter와 retry가 필요하다. |
| `/admin/menus` | API data 조회 + form/table interaction | menu CRUD, category 선택, reorder가 필요하다. |

## Session Storage 결정

| Key | 결정 |
|---|---|
| `table-order:admin:session` | AdminSession JSON을 sessionStorage에 저장한다. |

Storage adapter 요구사항:

- JSON parse 실패를 throw하지 않고 null로 반환한다.
- schema mismatch는 null로 처리한다.
- admin password는 저장하지 않는다.
- storage 접근은 browser 환경에서만 실행한다.

## State Management 결정

- 별도 전역 state library는 도입하지 않는다.
- `useAdminSession`, `useAdminDashboard`, `useAdminOrderActions`, `useAdminTables`, `useAdminHistory`, `useAdminMenus` 같은 hook을 사용한다.
- dashboard aggregation, status helper, menu validation, reorder helper는 pure function으로 작성해 PBT 대상이 되도록 한다.
- mutation 실패는 기존 data state를 덮어쓰지 않고 mutation state와 error message만 갱신한다.

## API Integration 결정

| 기능 | Client 처리 |
|---|---|
| Admin login | credential 검증 API 호출 후 AdminSession 저장 |
| Dashboard snapshot | storeId 기준 조회, 수동 새로고침, mutation 성공 후 재조회 |
| Order status update | 성공 후 dashboard reload, 실패 시 기존 snapshot 유지 |
| Order delete | confirm 후 요청, 성공 후 dashboard reload, 실패 시 기존 snapshot 유지 |
| Table upsert/completion | 성공 후 table/dashboard reload, 실패 시 form/list 유지 |
| History query | filter 기반 조회, 실패 시 빈 상태와 구분 |
| Menu CRUD/reorder | 성공 후 menu list reload, 실패 시 form/list 유지 |

## UX 기술 결정

- dashboard는 compact layout을 기본으로 한다.
- table card, order row, mutation button은 44px 이상 주요 조작 target을 확보한다.
- loading, submitting, failed, disabled state는 component prop/state로 명시한다.
- destructive action은 `window.confirm` 또는 작은 confirm dialog로 우선 구현 가능하다.
- Realtime Event Module 전에는 polling 없이 refresh button을 제공한다.

## 테스트 기술 결정

| 테스트 대상 | 방식 |
|---|---|
| dashboard mapper | Vitest example test + `fast-check` total invariant |
| order status helper | allowed status invariant property |
| deletion recalculation helper | state transition property |
| history filter helper | date range property |
| menu form validator | example test + generated invalid input property |
| menu reorder helper | no-duplicate/order preservation property |

## Dependency 영향

새 runtime dependency는 기본적으로 추가하지 않는다.

이미 Foundation과 Customer Ordering에서 선택한 dependency를 재사용한다.

- `next`
- `react`
- `react-dom`
- `vitest`
- `fast-check`

후속 Code Generation 단계에서 테스트 유틸이 필요하면 최소 범위로 추가 여부를 판단한다.

## Prototype 제약

- sessionStorage 기반 admin session은 production-grade authentication이 아니다.
- Realtime Event Module 전에는 dashboard 자동 실시간 갱신을 제공하지 않는다.
- offline mutation queue는 구현하지 않는다. 실패 시 기존 상태 보존과 수동 재시도로 처리한다.
- production monitoring, analytics, Sentry 같은 외부 관측성 도구는 MVP 범위 밖이다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. `fast-check`를 유지하고 dashboard mapper, status helper, filter/reorder/validation helper를 pure function 중심으로 설계한다.
- **Resiliency**: 준수. 실패 격리와 재시도 가능성을 client state와 API integration 설계에 반영한다.
- **Security Baseline**: 사용자 결정에 따라 비활성화되어 적용하지 않는다.
