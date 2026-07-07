# Application Design Plan

## Purpose

Table Order MVP의 Next.js 애플리케이션 구조를 컴포넌트, 서비스, 메서드, 의존성 수준에서 정의합니다.
상세 비즈니스 규칙은 이후 Functional Design에서 다룹니다.

## Design Scope

- Next.js App Router 기반 customer/admin 화면 구조.
- Next.js Route Handlers 기반 API.
- SQLite 데이터 접근 계층.
- SSE 기반 관리자 주문 이벤트 스트림.
- localStorage 기반 cart/table setup client state.
- 프로토타입에 적합한 단순 구조.

## Planning Questions

## Question 1
Next.js 라우팅 구조는 어떻게 구성할까요?

A) App Router 사용: `/customer`, `/admin`, `/api/*` 중심으로 구성

B) App Router 사용: 루트 `/`에서 customer, `/admin`만 분리하고 API는 `/api/*`

C) Pages Router 사용

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
SQLite 접근 방식은 어떻게 할까요?

A) Prisma ORM 사용

B) 직접 SQL 쿼리와 작은 repository 함수 사용

C) Drizzle ORM 사용

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 3
프로토타입의 service layer 깊이는 어느 정도가 적합할까요?

A) 얇은 service layer: API route -> service -> repository

B) 더 단순하게 API route -> repository 중심으로 구성

C) 도메인 service를 세분화해서 cart/order/table/menu service를 모두 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
관리자 SSE 이벤트 전달은 어떤 구조로 설계할까요?

A) 단일 in-memory event bus로 새 주문/상태 변경 이벤트를 admin SSE endpoint에 broadcast

B) 데이터베이스 polling 기반으로 SSE endpoint가 변경을 감지

C) 프로토타입에서는 SSE endpoint는 만들되 수동 refresh API도 함께 주요 경로로 둠

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Recommended Prototype Answers

간단한 프로토타입 기준 추천값은 다음과 같습니다.

- Question 1: A
- Question 2: B
- Question 3: A
- Question 4: A

## Execution Checklist

- [x] Validate all planning question answers are complete.
- [x] Analyze answers for ambiguity or contradiction.
- [x] Confirm component grouping and design approach.
- [x] Generate `aidlc-docs/inception/application-design/components.md`.
- [x] Generate `aidlc-docs/inception/application-design/component-methods.md`.
- [x] Generate `aidlc-docs/inception/application-design/services.md`.
- [x] Generate `aidlc-docs/inception/application-design/component-dependency.md`.
- [x] Generate `aidlc-docs/inception/application-design/application-design.md`.
- [x] Validate design completeness and consistency.
- [x] Update this plan's checkboxes immediately after each completed step.

## Mandatory Artifacts

- [x] `aidlc-docs/inception/application-design/components.md`
- [x] `aidlc-docs/inception/application-design/component-methods.md`
- [x] `aidlc-docs/inception/application-design/services.md`
- [x] `aidlc-docs/inception/application-design/component-dependency.md`
- [x] `aidlc-docs/inception/application-design/application-design.md`

## Approved Planning Choices

- **Routing**: Next.js App Router with `/customer`, `/admin`, and `/api/*`.
- **SQLite access**: Direct SQL queries behind small repository functions.
- **Service layer**: Thin API route -> service -> repository structure.
- **SSE**: Single in-memory event bus broadcasting order and status events to admin SSE clients.

## Compliance Notes

### Property-Based Testing

- Application Design identifies components and service boundaries only.
- PBT property identification is enforced later in Functional Design.

### Resiliency

- Application Design will include high-level reliability boundaries: structured API responses, SSE reconnect support, order failure cart preservation, and health-oriented API boundaries where relevant.
