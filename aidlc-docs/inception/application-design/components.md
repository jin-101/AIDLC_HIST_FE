# 컴포넌트

## 개요

MVP는 단일 Next.js 애플리케이션 안에 고객 UI, 관리자 UI, API route handler, service module, repository module, in-memory SSE event bus를 둔다.

## UI 컴포넌트

### Customer Shell

- **목적**: `/customer` 아래 고객용 태블릿 경험을 감싼다.
- **책임**:
  - localStorage에서 table setup을 복원한다.
  - setup, menu, cart, order success, order history 화면으로 고객을 이동시킨다.
  - 고객 UI를 터치 친화적으로 유지한다.
- **인터페이스**:
  - table setup과 cart를 localStorage에서 읽고 쓴다.
  - menu, order creation, order history API를 호출한다.

### Table Setup View

- **목적**: 매장 식별자, 테이블 번호, 테이블 비밀번호를 입력받는다.
- **책임**:
  - setup credential 제출.
  - 성공한 setup 정보를 로컬 저장.
  - 이후 고객 action에 필요한 table context 구성.

### Menu Browser View

- **목적**: 카테고리별 메뉴를 표시한다.
- **책임**:
  - 메뉴 카테고리와 항목을 조회한다.
  - 카테고리 navigation을 렌더링한다.
  - 선택한 메뉴를 cart에 추가한다.

### Cart View

- **목적**: 고객이 선택한 메뉴를 검토하고 수정한다.
- **책임**:
  - cart item 추가, 삭제, 수량 증가/감소, 비우기.
  - cart total 계산.
  - localStorage에 cart 변경 저장.
  - 주문 확정 시 order API 호출.

### Customer Order History View

- **목적**: 현재 table session 주문만 표시한다.
- **책임**:
  - 현재 session order history 조회.
  - 주문 상태와 line item 표시.

### Admin Shell

- **목적**: `/admin` 아래 관리자 경험을 감싼다.
- **책임**:
  - 단순 login state 관리.
  - dashboard, history, menu management, table setup 화면으로 이동.

### Admin Dashboard View

- **목적**: 테이블별 실시간 주문 모니터링을 제공한다.
- **책임**:
  - SSE 연결을 연다.
  - 테이블 카드와 최신 주문 preview를 렌더링한다.
  - 신규 주문을 강조한다.
  - 테이블 필터링을 제공한다.

### Admin Order Detail View

- **목적**: 주문/테이블 상세와 주문 조작을 제공한다.
- **책임**:
  - line item과 total 표시.
  - 주문 상태 변경.
  - 확인 후 잘못된 주문 삭제.

### Admin Table Management View

- **목적**: 테이블 설정과 table session completion을 관리한다.
- **책임**:
  - 테이블 번호/비밀번호 설정.
  - 테이블 이용 완료 처리.
  - 완료 후 active table total 초기화.

### Admin History View

- **목적**: 완료된 table session history를 표시한다.
- **책임**:
  - table/date 기준 history 조회.
  - dashboard로 복귀.

### Admin Menu Management View

- **목적**: 고객용 메뉴 데이터를 관리한다.
- **책임**:
  - 메뉴 생성, 조회, 수정, 삭제, 순서 조정.
  - 필수 필드와 가격 범위를 API 호출 전 검증.

## Backend 컴포넌트

### API Route Handlers

- **목적**: 고객/관리자 UI의 HTTP 경계.
- **책임**: 요청 parsing, 입력 검증, service 호출, JSON/SSE 응답 반환.

### Services

- **목적**: route handler와 repository 사이의 얇은 orchestration layer.
- **책임**: repository 호출 조합, 상위 workflow 처리, 주문 변경 후 SSE event 발행.

### Repositories

- **목적**: SQLite persistence 경계.
- **책임**: 직접 SQL 실행, row를 domain object로 mapping, SQL 세부사항 캡슐화.

### SQLite Database

- **목적**: MVP authoritative data store.
- **책임**: stores, tables, table_sessions, menus, orders, order_items 및 history 조회 기반 데이터 저장.

### Admin Event Bus

- **목적**: SSE용 in-memory event broker.
- **책임**: 연결된 admin SSE client 추적, order/table event broadcast.

### Client Storage Utilities

- **목적**: localStorage 사용 캡슐화.
- **책임**: table setup과 cart state 저장/복원.
