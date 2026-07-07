# NFR 요구사항 - Customer Ordering

## 범위

이 문서는 Customer Ordering Module의 고객 태블릿 화면에 필요한 비기능 요구사항을 정의한다. 대상 흐름은 table setup, menu 탐색, cart 관리, order submit, current session order history 조회이다.

## 확정된 NFR 결정

| 항목 | 결정 |
|---|---|
| 성능 목표 | 화면 전환은 100ms 이내 체감을 목표로 하고, 일반 local prototype 조건에서 고객 API 응답은 300ms 이내를 목표로 한다. |
| 주문 실패 UX | cart를 유지하고 같은 cart 화면에서 오류 메시지와 다시 주문 버튼을 제공한다. |
| localStorage 손상 대응 | 안전하게 empty cart/context로 fallback하고, context 불일치 시 setup으로 이동한다. |
| 접근성/사용성 | 터치 타깃 44px 이상, 명확한 focus/disabled/loading/error 상태, 태블릿 우선 responsive layout을 적용한다. |

## 성능

- menu, cart, orders route 간 client-side 화면 전환은 사용자가 100ms 이내로 반응한다고 느끼도록 설계한다.
- table setup, menu 조회, order submit, order history 조회 API는 일반 local prototype 조건에서 300ms 이내 응답을 목표로 한다.
- cart total 계산은 항목 추가, 삭제, 수량 변경 직후 동기적으로 갱신되어야 한다.
- cart reducer와 payload mapper는 cart item 수가 증가해도 불필요한 API 호출 없이 client memory 안에서 계산해야 한다.
- menu list는 prototype 규모의 메뉴 데이터에서 부드럽게 스크롤되어야 하며, 이미지 없는 텍스트 중심 UI를 유지한다.
- 주문 제출 중에는 중복 클릭에 의한 중복 API 요청을 막아야 한다.

## 가용성 및 복원력

- 주문 제출 실패 시 cart localStorage를 유지해야 한다.
- 주문 실패 후 고객은 같은 cart 화면에서 오류를 확인하고 다시 주문할 수 있어야 한다.
- menu API 실패 시 cart는 유지하고 메뉴 영역에 오류 메시지와 재시도 동작을 제공해야 한다.
- current session order history 조회 실패는 빈 주문 상태와 구분해야 한다.
- localStorage JSON parse 실패, schema mismatch, session scope mismatch는 화면 crash로 이어지면 안 된다.
- table context가 유효하지 않거나 서버 검증에 실패하면 고객을 setup 화면으로 이동시켜야 한다.
- 성공한 주문 후 cart clear가 완료된 뒤 성공 화면을 표시해야 한다.
- 주문 성공 화면에서 5초 redirect timer가 동작하더라도 고객이 직접 menu로 돌아갈 수 있는 navigation state를 막지 않는다.

## 데이터 무결성

- cart item의 line total은 항상 quantity와 unitPrice로 재계산해야 한다.
- cart total은 저장된 totalAmount를 맹신하지 않고 items의 line total 합으로 검증 또는 재계산해야 한다.
- order payload는 제출 직전 cart snapshot에서 생성해야 한다.
- order payload의 store ID, table ID, session ID는 TableContext와 일치해야 한다.
- session ID가 바뀌면 이전 cart를 새 session 주문에 사용하지 않아야 한다.
- localStorage의 table context와 cart는 authoritative storage가 아니며, 서버 API와 SQLite가 주문의 authoritative source이다.

## 사용성 및 접근성

- 주요 터치 타깃은 가능한 44px 이상이어야 한다.
- 주문 제출, 수량 증가/감소, 장바구니 비우기 같은 주요 동작은 disabled, loading, error 상태를 명확히 표시해야 한다.
- setup form은 필수 입력 누락을 inline 오류로 알려야 한다.
- cart 화면은 item 목록, 총액, 주문 제출 동작을 한눈에 확인할 수 있어야 한다.
- 주문 성공 화면은 주문 번호와 총액을 명확히 표시해야 한다.
- 주문 실패 메시지는 고객이 다시 주문을 시도할 수 있음을 알려야 한다.
- 태블릿 우선 responsive layout을 적용하되 desktop browser에서도 흐름을 검증할 수 있어야 한다.

## 보안 및 개인정보

- Security Baseline 확장은 사용자 결정에 따라 비활성화되어 있다.
- 고객 화면은 결제, 개인정보, 민감한 사용자 계정을 다루지 않는다.
- table password는 setup 검증 요청에만 사용하고 localStorage에는 저장하지 않는다.
- API 오류 메시지는 내부 SQL 오류나 stack trace를 노출하지 않아야 한다.
- table context는 편의용 localStorage 상태이며, 서버는 요청의 session/table 범위를 검증해야 한다.

## 유지보수성

- cart 계산, localStorage serialization, order payload mapping은 UI component 내부에 흩어지지 않고 hook 또는 utility로 분리해야 한다.
- 고객 화면 route는 `/customer/setup`, `/customer/menu`, `/customer/cart`, `/customer/orders`로 유지한다.
- API response 처리는 Foundation and Data Module의 구조화된 `{ ok, data/error }` 형태를 따른다.
- loading, failed, loaded 같은 상태 enum은 중복 문자열 대신 공통 type 또는 local union type으로 관리한다.
- NFR 결정은 Code Generation plan에서 구현 항목으로 추적되어야 한다.

## 테스트

- example-based test는 table setup 성공/실패, menu 조회 실패, cart 조작, 주문 성공, 주문 실패, history 조회 실패를 다뤄야 한다.
- property-based test는 Customer Ordering Functional Design에서 식별한 속성을 다뤄야 한다.
  - cart total은 line total 합과 같다.
  - quantity update는 음수 수량을 만들지 않는다.
  - 동일 menu item add는 항목 중복 대신 quantity 증가로 귀결된다.
  - order payload total은 cart snapshot과 일치한다.
  - localStorage serialization은 round-trip 후 cart 의미를 보존한다.
  - failed order submit은 cart state를 보존한다.
- PBT는 `fast-check`를 사용하고 Vitest에서 실행 가능해야 한다.
- Build and Test 단계에서는 PBT seed 재현 방법을 문서화해야 한다.

## 관측성

- 고객 API 실패는 구조화된 error code로 구분 가능해야 한다.
- client UI는 setup failure, menu load failure, order submit failure, history load failure를 서로 다른 사용자 메시지로 표현해야 한다.
- local prototype에서는 production monitoring dashboard가 N/A이다.
- console logging은 debugging 보조로만 사용하고 고객 화면의 오류 상태를 대체하지 않는다.

## Resiliency 준수

- **RESILIENCY-01**: 준수. 주문 제출과 고객 주문 가능성을 핵심 workload로 식별했다.
- **RESILIENCY-02**: 부분 적용. project-level RTO/RPO는 요구사항에서 시간 단위로 정의되어 있으며, 이 unit은 client-side cart 보존으로 주문 재시도를 지원한다.
- **RESILIENCY-03**: N/A. MVP에서는 formal change management를 제외했다.
- **RESILIENCY-04**: 부분 적용. CI/CD와 rollback은 project-level Build and Test에서 다룬다.
- **RESILIENCY-05**: 부분 적용. 구조화된 error code와 UI failure state를 요구한다. production metrics routing은 local prototype에서 N/A이다.
- **RESILIENCY-06**: 부분 적용. health check 자체는 backend/foundation 범위이며, 고객 화면은 API 실패 상태를 표시한다.
- **RESILIENCY-07~RESILIENCY-09**: local prototype에서는 N/A.
- **RESILIENCY-10**: 준수. 실패 격리는 cart 보존, retry UX, localStorage fallback으로 반영한다.
- **RESILIENCY-11~RESILIENCY-13**: server data backup/restore는 Foundation and Data 및 Build and Test 범위이다.
- **RESILIENCY-14**: N/A. local prototype에는 automated failover가 없다.
- **RESILIENCY-15**: N/A. MVP 운영 연동은 제외하고 incident response는 문서화만 한다.

## PBT 준수

- **PBT-01**: 준수. Customer Ordering의 테스트 가능한 속성을 기능 설계와 NFR 요구사항에서 추적했다.
- **PBT-02**: 준수 계획. cartStorage round-trip과 order payload mapping에 적용한다.
- **PBT-03**: 준수 계획. cart total, quantity, empty cart invariant에 적용한다.
- **PBT-04**: N/A. 주문 제출은 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 MVP 범위 밖이다.
- **PBT-06**: 준수 계획. cart reducer의 stateful sequence test에 적용한다.
- **PBT-07**: Code Generation 단계에서 generator를 구현한다.
- **PBT-08**: Build and Test 단계에서 seed reproducibility를 문서화한다.
- **PBT-09**: 준수. TypeScript PBT framework는 `fast-check`이다.
- **PBT-10**: 준수 계획. example-based test와 PBT를 함께 사용한다.
