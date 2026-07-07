# 비즈니스 규칙 - Admin Operations

## 관리자 인증 규칙

| ID | 규칙 |
|---|---|
| AO-BR-001 | 관리자는 store code와 admin password로 로그인한다. |
| AO-BR-002 | 로그인 성공 시 storeId와 login flag를 sessionStorage에 저장한다. |
| AO-BR-003 | 관리자 sessionStorage는 authoritative security boundary가 아니라 MVP용 client state이다. |
| AO-BR-004 | admin route는 유효한 admin session이 없으면 `/admin/login`으로 이동한다. |
| AO-BR-005 | 로그인 실패 시 sessionStorage를 생성하거나 갱신하지 않는다. |

## Dashboard 규칙

| ID | 규칙 |
|---|---|
| AO-BR-010 | dashboard는 storeId 기준 table 목록을 표시한다. |
| AO-BR-011 | table card는 active session만 current state로 표시한다. |
| AO-BR-012 | completed session order는 dashboard current total에 포함하지 않는다. |
| AO-BR-013 | table total은 active session order total 합이다. |
| AO-BR-014 | 최신 주문 preview는 createdAt 기준 최신 주문을 우선 표시한다. |
| AO-BR-015 | dashboard 조회 실패는 빈 dashboard와 구분해야 한다. |

## 주문 상태 규칙

| ID | 규칙 |
|---|---|
| AO-BR-020 | 주문 status는 `waiting`, `preparing`, `completed` 중 하나이다. |
| AO-BR-021 | 기본 상태 진행은 `waiting -> preparing -> completed` 순서이다. |
| AO-BR-022 | 관리자는 정정 목적으로 이전 상태로도 수동 변경할 수 있다. |
| AO-BR-023 | 유효하지 않은 status 값은 API 요청 전에 차단하고 API에서도 거부한다. |
| AO-BR-024 | 상태 변경 실패 시 기존 order status를 유지한다. |

## 주문 삭제 규칙

| ID | 규칙 |
|---|---|
| AO-BR-030 | 주문 삭제는 확인 절차 후 실행한다. |
| AO-BR-031 | 삭제 성공 후 order item도 함께 제거된다. |
| AO-BR-032 | 삭제 후 table total은 남은 active session order 합으로 재계산된다. |
| AO-BR-033 | 삭제 실패 시 기존 주문 목록을 유지한다. |

## Table 관리 규칙

| ID | 규칙 |
|---|---|
| AO-BR-040 | 관리자는 table number와 table password를 생성 또는 수정할 수 있다. |
| AO-BR-041 | table number는 store 안에서 unique해야 한다. |
| AO-BR-042 | table usage completion은 active session이 있는 table에만 적용된다. |
| AO-BR-043 | table completion은 확인 절차 후 실행한다. |
| AO-BR-044 | completion 성공 시 session status는 completed가 되고 completedAt이 기록된다. |
| AO-BR-045 | completion 후 새 고객은 이전 session 주문을 현재 주문으로 볼 수 없다. |

## History 규칙

| ID | 규칙 |
|---|---|
| AO-BR-050 | history 조회는 completed session의 order만 반환한다. |
| AO-BR-051 | tableId filter는 필수이다. |
| AO-BR-052 | dateFrom/dateTo가 있으면 order createdAt 기준으로 필터링한다. |
| AO-BR-053 | history는 최신순으로 표시한다. |
| AO-BR-054 | history 조회 실패는 빈 결과와 구분한다. |

## Menu 관리 규칙

| ID | 규칙 |
|---|---|
| AO-BR-060 | 메뉴 생성/수정에는 name, price, categoryId가 필수이다. |
| AO-BR-061 | price는 0보다 큰 정수여야 한다. |
| AO-BR-062 | category는 기존 category 목록에서 선택한다. |
| AO-BR-063 | MVP에서는 category 생성/삭제를 제외한다. |
| AO-BR-064 | 메뉴 삭제는 확인 절차 후 실행한다. |
| AO-BR-065 | reorder 요청은 같은 store의 menu IDs에 대해서만 적용한다. |

## Validation 규칙

| 대상 | 필수 검증 |
|---|---|
| Admin login | storeCode와 password가 비어 있지 않아야 한다. |
| Order status update | orderId와 허용 status가 필요하다. |
| Order delete | orderId가 필요하고 확인 절차가 선행되어야 한다. |
| Table upsert | table number와 password가 비어 있지 않아야 한다. |
| Table completion | tableId와 active session 존재가 필요하다. |
| History query | tableId가 필요하고 date range는 올바른 날짜 형식이어야 한다. |
| Menu mutation | name, positive integer price, categoryId가 필요하다. |
| Menu reorder | orderedIds는 빈 배열이 아니고 중복 ID를 포함하지 않아야 한다. |

## PBT Testable Properties

| 속성 | 관련 규칙 |
|---|---|
| dashboard total equals active order total sum | AO-BR-012, AO-BR-013 |
| status update result is allowed status | AO-BR-020, AO-BR-023 |
| deletion recalculates total from remaining orders | AO-BR-031, AO-BR-032 |
| completed session excluded from dashboard | AO-BR-011, AO-BR-012, AO-BR-044 |
| history date filter excludes out-of-range orders | AO-BR-052 |
| menu reorder has no duplicate IDs and preserves order | AO-BR-065 |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. 관리자 business rule 단위의 PBT 후보 속성을 정의했다.
- **Resiliency**: 준수. 실패 시 기존 상태 보존, destructive action 확인, 조회 실패 구분 규칙을 정의했다.
- **Security Baseline**: 비활성화 상태이므로 이 단계에서 적용하지 않는다.
