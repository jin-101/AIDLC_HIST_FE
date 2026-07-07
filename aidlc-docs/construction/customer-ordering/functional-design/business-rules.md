# 비즈니스 규칙 - Customer Ordering

## 테이블 Context 규칙

| ID | 규칙 |
|---|---|
| CO-BR-001 | 고객 메뉴, 장바구니, 주문 내역 화면은 유효한 table context 없이는 사용할 수 없다. |
| CO-BR-002 | table context는 store ID, table ID, table number, session ID를 포함해야 한다. |
| CO-BR-003 | localStorage의 table context는 서버 검증에 실패하면 폐기 가능한 임시 상태로 취급한다. |
| CO-BR-004 | table context와 cart는 별도 localStorage key로 저장한다. |
| CO-BR-005 | session ID가 변경되면 기존 cart는 새 session 주문에 섞이지 않도록 비우거나 새 session 범위로 재생성한다. |

## 메뉴 규칙

| ID | 규칙 |
|---|---|
| CO-BR-010 | 고객 화면은 주문 가능한 메뉴만 기본 추가 대상으로 제공한다. |
| CO-BR-011 | menu item 표시 정보는 이름, 설명, 가격, 카테고리를 포함한다. |
| CO-BR-012 | 가격은 0보다 큰 정수여야 주문 항목으로 사용할 수 있다. |
| CO-BR-013 | 카테고리 표시 순서는 서버가 제공한 display order를 따른다. |

## 장바구니 규칙

| ID | 규칙 |
|---|---|
| CO-BR-020 | cart item의 식별 기준은 menu item ID이다. |
| CO-BR-021 | 같은 menu item을 다시 추가하면 새 row를 만들지 않고 quantity를 증가시킨다. |
| CO-BR-022 | quantity는 1 이상의 정수여야 한다. |
| CO-BR-023 | quantity 감소 결과가 0이 되면 해당 cart item을 제거한다. |
| CO-BR-024 | line total은 `quantity * unitPrice`이다. |
| CO-BR-025 | cart total은 모든 line total의 합이다. |
| CO-BR-026 | cart 변경은 즉시 localStorage에 저장한다. |
| CO-BR-027 | cart clear는 cart key를 삭제하거나 빈 items 상태로 저장하는 것으로 처리한다. |
| CO-BR-028 | cart가 비어 있으면 주문 제출을 할 수 없다. |

## 주문 제출 규칙

| ID | 규칙 |
|---|---|
| CO-BR-030 | 주문 payload는 store ID, table ID, session ID, items를 포함해야 한다. |
| CO-BR-031 | 각 주문 item은 menu item ID, menu name snapshot, quantity, unit price를 포함해야 한다. |
| CO-BR-032 | 주문 제출 직전에 cart total을 재계산해 payload와 화면 금액 불일치를 방지한다. |
| CO-BR-033 | 주문 성공 시 cart를 비운다. |
| CO-BR-034 | 주문 성공 시 주문 번호를 고객에게 표시한다. |
| CO-BR-035 | 주문 성공 화면은 5초 후 `/customer/menu`로 이동한다. |
| CO-BR-036 | 주문 실패 시 cart를 유지한다. |
| CO-BR-037 | 주문 실패 메시지는 고객이 다시 시도할 수 있음을 명확히 알려야 한다. |
| CO-BR-038 | 제출 중에는 중복 제출을 막기 위해 제출 동작을 비활성화한다. |

## 주문 내역 규칙

| ID | 규칙 |
|---|---|
| CO-BR-040 | 고객 주문 내역은 현재 session ID 기준으로만 조회한다. |
| CO-BR-041 | completed session의 주문은 현재 세션 주문 내역에서 제외한다. |
| CO-BR-042 | 주문 내역은 주문 시각 오름차순으로 표시한다. |
| CO-BR-043 | 각 주문은 주문 번호, 주문 시각, item, quantity, 금액, 상태를 표시한다. |
| CO-BR-044 | 주문 내역 조회 실패는 빈 상태와 구분해서 표시한다. |

## Validation 규칙

| 대상 | 필수 검증 |
|---|---|
| Table setup 입력 | store code, table number, table password가 비어 있지 않아야 한다. |
| Table context | store ID, table ID, session ID가 있어야 한다. |
| Cart item | menuItemId, menuName, quantity, unitPrice가 유효해야 한다. |
| Order payload | items가 1개 이상이고 모든 quantity와 unitPrice가 양수여야 한다. |
| localStorage parse | JSON parse 실패 또는 schema mismatch 시 기본 empty state로 복구해야 한다. |

## 오류 처리 규칙

| 오류 | 처리 |
|---|---|
| table setup 실패 | setup 화면에 오류를 표시하고 저장 상태를 만들지 않는다. |
| table context 만료 또는 불일치 | context를 제거하고 setup 화면으로 이동한다. |
| menu API 실패 | 재시도 가능한 오류 화면을 표시한다. |
| localStorage read 실패 | cart는 empty state로 복구하되 사용자 흐름을 막지 않는다. |
| order API 실패 | cart 보존, 제출 상태 failed, 오류 메시지 표시. |
| history API 실패 | 오류 상태 표시, 재시도 제공, 빈 주문으로 표시하지 않음. |

## PBT Testable Properties

| 속성 | 관련 규칙 |
|---|---|
| cart total equals sum of line totals | CO-BR-024, CO-BR-025 |
| quantity never becomes negative | CO-BR-022, CO-BR-023 |
| add same item merges quantity | CO-BR-020, CO-BR-021 |
| empty cart cannot produce valid order payload | CO-BR-028, CO-BR-030 |
| failed order submission preserves cart | CO-BR-036 |
| localStorage round-trip preserves cart meaning | CO-BR-026, localStorage parse validation |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. business rule 단위로 PBT 후보 속성을 추적했다.
- **Resiliency**: 준수. 고객 주문 실패, 조회 실패, storage parse 실패의 복구 방식을 정의했다.
- **Security Baseline**: 비활성화 상태이므로 이 단계에서 적용하지 않는다.
