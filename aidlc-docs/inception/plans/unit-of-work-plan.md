# Unit of Work Plan

## Purpose

Table Order MVP를 구현 가능한 작업 단위로 나누고, 각 단위의 책임과 의존 관계를 정의합니다.
프로토타입 목표에 맞춰 단일 Next.js 애플리케이션 안의 논리적 module 단위로 분해합니다.

## Proposed Decomposition

추천 단위는 다음 5개입니다.

1. **Foundation and Data Module**
   - Next.js 프로젝트 구조, SQLite schema, seed data, repository 기반.
2. **Customer Ordering Module**
   - table setup, menu browsing, cart, order submission, current session order history.
3. **Admin Operations Module**
   - admin login, dashboard, order detail, status update, deletion, table completion, history, menu management.
4. **Realtime Event Module**
   - in-memory event bus and SSE endpoint/client integration.
5. **Testing and Quality Module**
   - example-based tests, property-based tests, build/test verification.

## Planning Questions

## Question 1
단위 분해 방식은 어떻게 할까요?

A) 추천 방식 사용: Foundation, Customer, Admin, Realtime, Testing의 5개 module로 분리

B) 더 단순하게 Foundation, Customer/Admin UI, API/Data, Testing의 4개 module로 분리

C) 하나의 단일 MVP module로 유지하고 내부 task만 구분

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
코드 조직은 어떻게 구성할까요?

A) 단일 Next.js 앱 안에서 `src/app`, `src/components`, `src/features`, `src/server`, `src/lib`, `src/test`로 구성

B) feature-first 구조로 `src/features/customer`, `src/features/admin`, `src/features/shared` 중심 구성

C) app/api 중심의 단순 구조로 시작하고 필요 시 분리

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
단위 간 개발 순서는 어떻게 할까요?

A) Foundation -> Customer -> Admin -> Realtime -> Testing

B) Foundation -> Admin -> Customer -> Realtime -> Testing

C) Foundation -> Realtime -> Customer/Admin 병렬 -> Testing

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
프로토타입에서 Realtime Event Module은 독립 단위로 둘까요?

A) 예, SSE와 event bus를 별도 단위로 둠

B) 아니오, Admin Operations Module 안에 포함

C) Code Generation에서 구현 상황에 따라 결정

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Recommended Prototype Answers

간단한 프로토타입 기준 추천값은 다음과 같습니다.

- Question 1: A
- Question 2: A
- Question 3: A
- Question 4: A

## Execution Checklist

- [x] Validate all planning question answers are complete.
- [x] Analyze answers for ambiguity or contradiction.
- [x] Confirm unit boundaries and code organization strategy.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work.md`.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-dependency.md`.
- [x] Generate `aidlc-docs/inception/application-design/unit-of-work-story-map.md`.
- [x] Document greenfield code organization strategy in `unit-of-work.md`.
- [x] Validate unit boundaries and dependencies.
- [x] Ensure all stories are assigned to units.
- [x] Update this plan's checkboxes immediately after each completed step.

## Mandatory Artifacts

- [x] `aidlc-docs/inception/application-design/unit-of-work.md`
- [x] `aidlc-docs/inception/application-design/unit-of-work-dependency.md`
- [x] `aidlc-docs/inception/application-design/unit-of-work-story-map.md`

## Approved Planning Choices

- **Unit decomposition**: 5 modules: Foundation, Customer, Admin, Realtime, Testing.
- **Code organization**: Single Next.js app with `src/app`, `src/components`, `src/features`, `src/server`, `src/lib`, and `src/test`.
- **Development sequence**: Foundation -> Customer -> Admin -> Realtime -> Testing.
- **Realtime module**: Separate unit for SSE and event bus.

## Compliance Notes

### Property-Based Testing

- Testing and Quality Module carries PBT dependencies into Construction.
- Functional Design will identify testable properties per unit.

### Resiliency

- Foundation and Realtime units carry resiliency-sensitive concerns such as structured responses, SSE reconnect support, and local recovery behavior.
