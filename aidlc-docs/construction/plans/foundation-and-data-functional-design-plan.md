# Foundation and Data Functional Design Plan

## Purpose

Foundation and Data Module의 도메인 모델, SQLite schema, repository 경계, seed data, API response 규칙을 설계합니다.

## Unit Context

- **Unit**: Foundation and Data Module
- **Role**: 모든 customer/admin/realtime/testing module의 기반
- **Primary outputs**: project structure, SQLite schema, seed data, repositories, shared types, API response helpers

## Planning Questions

## Question 1
SQLite schema의 ID 전략은 어떻게 할까요?

A) 모든 주요 table에 text UUID 사용

B) 모든 주요 table에 integer auto-increment 사용

C) store/table/menu는 integer, order/session은 text UUID 혼합 사용

X) Other (please describe after [Answer]: tag below)

[Answer]:  A

## Question 2
주문 이력은 어떻게 저장할까요?

A) active order는 `orders`, 완료된 세션 요약은 `order_history`에 복사 저장

B) 모든 order를 `orders`에 유지하고 session status로 현재/과거를 구분

C) `orders`와 `order_history`를 모두 두되 history는 view처럼 조회 시 계산

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
프로토타입 seed data는 어느 정도로 만들까요?

A) 1개 store, 4개 table, 3개 category, 8개 menu item, admin password 포함

B) 최소 seed: 1개 store, 1개 table, 1개 category, 3개 menu item

C) seed 없이 관리자 메뉴 관리 화면에서 직접 입력

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
repository 함수의 transaction 처리는 어떻게 설계할까요?

A) order 생성, table completion, order deletion만 transaction으로 묶음

B) 모든 write 작업을 transaction으로 묶음

C) 프로토타입에서는 transaction 없이 단순 SQL 순차 실행

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Recommended Prototype Answers

- Question 1: A
- Question 2: B
- Question 3: A
- Question 4: A

## Execution Checklist

- [x] Validate all planning question answers are complete.
- [x] Analyze answers for ambiguity or contradiction.
- [x] Confirm data model and repository approach.
- [x] Generate `business-logic-model.md`.
- [x] Generate `business-rules.md`.
- [x] Generate `domain-entities.md`.
- [x] Mark frontend components as N/A for this unit.
- [x] Include PBT Testable Properties section.
- [x] Validate Functional Design completeness.
- [x] Update this plan's checkboxes immediately after each completed step.

## Approved Planning Choices

- **ID strategy**: text UUID for all major tables.
- **Order history model**: keep all orders in `orders`; use session status to distinguish current and historical orders.
- **Seed data**: 1 store, 4 tables, 3 categories, 8 menu items, and admin password.
- **Transactions**: order creation, table completion, and order deletion.

## Compliance Notes

### PBT

PBT-01 applies in this Functional Design stage. The generated artifacts must identify testable properties for repository transformations, API response wrapping, order totals, and session status rules where applicable.

### Resiliency

Foundation design must preserve local prototype reliability basics: structured errors, transaction boundaries for multi-step state changes, and SQLite as source of truth.
