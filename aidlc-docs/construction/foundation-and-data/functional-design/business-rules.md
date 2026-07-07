# 비즈니스 규칙 - Foundation and Data

## 식별자 규칙

- 모든 주요 table은 text UUID identifier를 사용한다.
- UUID는 insert 전에 application code에서 생성한다.
- seed lookup은 `store.code`, `table.number` 같은 사람이 읽기 쉬운 field를 사용할 수 있지만 primary key는 UUID이다.

## Store 규칙

- store는 unique `code`를 가진다.
- store는 table, menu category, menu item, table session, order를 소유한다.
- seed data는 default store 1개를 생성한다.

## Table 규칙

- table은 하나의 store에 속한다.
- table은 unique `(storeId, tableNumber)` pair를 가진다.
- table은 prototype용 단순 password를 가진다.
- advanced security는 제외되어 있으므로 table password storage는 prototype 수준으로 둔다.

## Table Session 규칙

- table은 최대 하나의 active session만 가질 수 있다.
- session status는 `active` 또는 `completed`이다.
- completed session은 `completedAt`을 가져야 한다.
- 현재 고객 주문 내역 query는 active session order만 포함한다.
- 과거 이력 query는 completed session을 사용한다.

## Menu 규칙

- menu item 필수 field는 name, price, category이다.
- menu price는 양의 정수 금액이어야 한다.
- display order는 숫자이며 store/category context 안에서 적용된다.
- menu image는 MVP에서 제외한다.

## Order 규칙

- order는 하나의 store, table, table session에 속한다.
- order는 하나 이상의 order item을 가진다.
- quantity는 양의 정수여야 한다.
- unit price는 양의 정수여야 한다.
- order total은 모든 item line total의 합과 같아야 한다.
- order status는 `waiting`, `preparing`, `completed` 중 하나이다.
- 기본 order status는 `waiting`이다.

## History 규칙

- 모든 order는 `orders`에 유지한다.
- session status로 현재/과거를 구분한다.
- historical order lookup은 completed table session의 order를 반환한다.
- 이 prototype에서는 table completion 시 order를 별도 history table로 복사하지 않는다.

## Transaction 규칙

Transaction 적용 대상:

- order와 order item 생성.
- table session completion.
- order deletion과 관련 state 재계산.

단일 row menu/table update는 single statement write를 사용할 수 있다.

## Error 규칙

- 필수 input 누락은 구조화된 failure response를 반환한다.
- not found case는 stable error code를 가진 구조화된 failure response를 반환한다.
- repository 함수는 domain-level result를 반환하거나 service가 API failure로 mapping할 수 있는 typed error를 던진다.
- SQL error를 client에 직접 노출하지 않는다.

## Resiliency 준수

- **RESILIENCY-01**: Foundation은 핵심 주문 생성과 관리자 모니터링 flow를 지원한다.
- **RESILIENCY-05**: 구조화된 error는 후속 logging/monitoring 설계를 지원한다.
- **RESILIENCY-06**: health check는 후속 NFR Design에서 SQLite 연결 확인으로 다룬다.
- **RESILIENCY-10**: SQLite 접근은 repository로 제한된다. local SQLite prototype에서 circuit breaker는 N/A이다.
- **RESILIENCY-12**: MVP에서는 backup strategy를 문서화 수준으로 다룬다.
