# 작업 단위 의존성

## 의존성 매트릭스

| Unit | 의존 대상 | 이 Unit에 의존하는 대상 | 이유 |
|---|---|---|---|
| Foundation and Data Module | 없음 | Customer, Admin, Realtime, Testing | 프로젝트 구조, DB, repository, type, API response helper 제공. |
| Customer Ordering Module | Foundation | Realtime, Testing | menu, session, order, cart utility, customer API 사용. |
| Admin Operations Module | Foundation | Realtime, Testing | dashboard data, order/table/menu API, admin 화면 사용. |
| Realtime Event Module | Foundation, Customer, Admin | Testing | order/table workflow에서 발생한 mutation event broadcast. |
| Testing and Quality Module | Foundation, Customer, Admin, Realtime | 없음 | 모든 구현 unit 검증. |

## 권장 구현 순서

1. **Foundation and Data Module**
   - UI/API 흐름 전에 schema와 repository 경계를 만든다.
2. **Customer Ordering Module**
   - 핵심 business flow인 주문 생성을 가능하게 한다.
3. **Admin Operations Module**
   - 기존 order/session data를 이용해 dashboard와 admin action을 구현한다.
4. **Realtime Event Module**
   - mutation 흐름이 존재한 뒤 SSE를 연결한다.
5. **Testing and Quality Module**
   - 완료된 module 전반에 example-based/PBT coverage를 추가한다.

## 통합 지점

### Foundation -> Customer

- Customer는 customer API를 통해 SQLite menu data를 읽는다.
- Customer는 service/repository layer를 통해 order와 session을 생성한다.
- Cart는 shared type과 utility를 사용한다.

### Foundation -> Admin

- Admin dashboard는 active table/order state를 읽는다.
- Admin menu management는 menu data를 쓴다.
- Admin table management는 table/session state를 갱신한다.

### Customer/Admin -> Realtime

- Customer order creation은 `order-created`를 publish한다.
- Admin status update는 `order-updated`를 publish한다.
- Admin order deletion은 `order-deleted`를 publish한다.
- Admin table completion은 `table-completed`를 publish한다.

### 모든 Module -> Testing

- example-based test는 중요한 흐름을 고정한다.
- PBT는 total, quantity handling, serialization/persistence transformation, state invariant를 검증한다.

## 위험 메모

- Realtime은 source of truth가 아니며 SQLite가 authoritative source이다.
- reconnect 중 in-memory SSE event는 유실될 수 있으므로 admin dashboard에는 initial snapshot API가 필요하다.
- Testing은 API snapshot과 event-driven UI update를 모두 검증해야 한다.
