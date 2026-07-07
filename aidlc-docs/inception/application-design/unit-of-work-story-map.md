# 작업 단위 스토리 매핑

## 스토리 coverage 요약

모든 user story 12개는 하나 이상의 unit에 할당되어 있다.

| Story | Primary Unit | Supporting Units |
|---|---|---|
| US-CUST-001 테이블 자동 로그인 | Customer Ordering Module | Foundation and Data Module |
| US-CUST-002 카테고리별 메뉴 탐색 | Customer Ordering Module | Foundation and Data Module |
| US-CUST-003 장바구니 관리 | Customer Ordering Module | Testing and Quality Module |
| US-CUST-004 주문 제출 | Customer Ordering Module | Foundation and Data Module, Realtime Event Module, Testing and Quality Module |
| US-CUST-005 현재 세션 주문 내역 조회 | Customer Ordering Module | Foundation and Data Module |
| US-ADMIN-001 관리자 로그인 | Admin Operations Module | Foundation and Data Module |
| US-ADMIN-002 실시간 주문 모니터링 | Admin Operations Module | Realtime Event Module, Foundation and Data Module, Testing and Quality Module |
| US-ADMIN-003 주문 상세 확인 및 상태 변경 | Admin Operations Module | Foundation and Data Module, Realtime Event Module |
| US-ADMIN-004 테이블 세션 관리 | Admin Operations Module | Foundation and Data Module, Realtime Event Module, Testing and Quality Module |
| US-ADMIN-005 주문 정정 | Admin Operations Module | Foundation and Data Module, Realtime Event Module, Testing and Quality Module |
| US-ADMIN-006 과거 주문 조회 | Admin Operations Module | Foundation and Data Module |
| US-ADMIN-007 메뉴 관리 | Admin Operations Module | Foundation and Data Module, Testing and Quality Module |

## Unit별 상세

### Foundation and Data Module

지원 스토리:

- US-CUST-001
- US-CUST-002
- US-CUST-004
- US-CUST-005
- US-ADMIN-001
- US-ADMIN-002
- US-ADMIN-003
- US-ADMIN-004
- US-ADMIN-005
- US-ADMIN-006
- US-ADMIN-007

SQLite, repository, type, seed data가 MVP 기반이므로 대부분의 스토리를 지원한다.

### Customer Ordering Module

소유 스토리:

- US-CUST-001
- US-CUST-002
- US-CUST-003
- US-CUST-004
- US-CUST-005

table setup부터 현재 session order history까지 고객 여정을 담당한다.

### Admin Operations Module

소유 스토리:

- US-ADMIN-001
- US-ADMIN-002
- US-ADMIN-003
- US-ADMIN-004
- US-ADMIN-005
- US-ADMIN-006
- US-ADMIN-007

login, dashboard, table completion, history, menu management를 담당한다.

### Realtime Event Module

지원 스토리:

- US-CUST-004
- US-ADMIN-002
- US-ADMIN-003
- US-ADMIN-004
- US-ADMIN-005

admin dashboard update용 SSE infrastructure와 event delivery를 담당한다.

### Testing and Quality Module

지원 스토리:

- US-CUST-003
- US-CUST-004
- US-ADMIN-002
- US-ADMIN-004
- US-ADMIN-005
- US-ADMIN-007

계산, state transition, realtime behavior, validation이 포함된 스토리를 테스트한다.

## Coverage 검증

- Customer story: 5/5 할당.
- Admin story: 7/7 할당.
- 전체 story: 12/12 할당.
- 미할당 user story 없음.
