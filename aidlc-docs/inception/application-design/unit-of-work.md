# 작업 단위

## 개요

테이블오더 MVP는 단일 Next.js 애플리케이션 안의 5개 논리 module로 구현한다. 이 단위들은 독립 배포 서비스가 아니라 계획과 construction을 위한 작업 단위이다.

## 코드 조직 전략

애플리케이션 코드는 `aidlc-docs/`가 아니라 workspace root에 둔다.

권장 greenfield 구조:

```text
src/
  app/
    customer/
    admin/
    api/
  components/
    ui/
    customer/
    admin/
  features/
    customer/
    admin/
    cart/
    menu/
    orders/
    tables/
    realtime/
  server/
    db/
    repositories/
    services/
    events/
  lib/
    api/
    storage/
    validation/
    types/
  test/
    generators/
    fixtures/
```

## Unit 1: Foundation and Data Module

### 목적

Next.js 프로젝트 기반, 공통 type, SQLite database, seed data, repository layer, API response 규칙을 만든다.

### 책임

- 프로젝트 구조 생성.
- stores, tables, table_sessions, menus, orders, order_items, history 조회 기반 schema 정의.
- 로컬 prototype test용 seed data 제공.
- 직접 SQL repository 함수 구현.
- 공유 TypeScript domain type 정의.
- 구조화된 API response helper 정의.

### 주요 산출물

- database initialization 및 seed script.
- repository module.
- 공유 type과 validation helper.
- 기본 app layout과 navigation shell.

## Unit 2: Customer Ordering Module

### 목적

고객용 table tablet flow를 구현한다.

### 책임

- localStorage 기반 table setup과 자동 로그인.
- 카테고리별 메뉴 탐색.
- cart 추가/삭제/수량/비우기.
- localStorage 기반 cart persistence.
- API를 통한 주문 제출.
- 현재 session 주문 내역 조회.
- 주문 실패 시 cart 보존.

## Unit 3: Admin Operations Module

### 목적

관리자가 주문과 테이블을 모니터링하고 관리하는 흐름을 구현한다.

### 책임

- 단순 관리자 로그인.
- 관리자 dashboard snapshot.
- table card와 order detail.
- 주문 상태 변경.
- 확인 후 주문 삭제.
- table setup과 table usage completion.
- 날짜 필터가 있는 과거 주문 조회.
- menu CRUD와 표시 순서 관리.

## Unit 4: Realtime Event Module

### 목적

SSE 기반 관리자 실시간 주문 업데이트를 구현한다.

### 책임

- in-memory event bus.
- admin SSE endpoint.
- dashboard client subscription.
- 성공한 order/table mutation 후 event publication.
- `order-created`, `order-updated`, `order-deleted`, `table-completed` 처리.

## Unit 5: Testing and Quality Module

### 목적

prototype의 build, example-based test, property-based test, 검증 coverage를 제공한다.

### 책임

- test runner 설정.
- 핵심 customer/admin flow example-based test.
- `fast-check` 기반 PBT.
- cart, menu item, order, session용 domain generator.
- PBT seed/reproducibility 문서화.
- Build and Test 단계의 검증 지침 제공.

## 구현 순서

1. Foundation and Data Module
2. Customer Ordering Module
3. Admin Operations Module
4. Realtime Event Module
5. Testing and Quality Module

## 경계 검증

- 모든 user story는 하나 이상의 unit에 매핑된다.
- Foundation은 upstream application-unit dependency가 없다.
- Customer와 Admin은 Foundation에 의존한다.
- Realtime은 Foundation에 의존하며 Customer/Admin mutation과 통합된다.
- Testing은 모든 구현 unit에 의존한다.
