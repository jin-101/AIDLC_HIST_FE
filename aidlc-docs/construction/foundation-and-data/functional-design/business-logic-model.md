# 비즈니스 로직 모델 - Foundation and Data

## 범위

Foundation and Data Module은 테이블오더 MVP의 공통 데이터 모델, SQLite 저장소, repository 경계, seed data, API 응답 규칙을 제공한다.

## 핵심 Workflow

### Database 초기화

1. SQLite database file이 없으면 생성한다.
2. schema migration 또는 initialization으로 필요한 table을 만든다.
3. seed store가 없을 때만 seed data를 삽입한다.
4. repository 함수는 초기화된 database를 대상으로 동작한다.

### Seed Data 생성

Seed data는 다음을 포함한다.

- store 1개.
- table 4개.
- menu category 3개.
- menu item 8개.
- 단순 admin password record 1개.

테스트와 prototype 사용이 안정적이도록 seed data는 deterministic해야 한다.

### Repository 접근

1. API 또는 service layer가 repository 함수를 호출한다.
2. repository는 required ID 같은 persistence-level 가정을 검증한다.
3. repository는 직접 SQL을 실행한다.
4. repository는 row를 typed domain object로 mapping한다.
5. repository는 domain object 또는 empty/null result를 반환한다.

### Transaction 작업

여러 단계의 상태 변경에는 transaction이 필요하다.

- 주문 생성.
- table completion.
- 주문 삭제.

다른 write 작업은 이후 설계에서 consistency 요구가 추가되지 않는 한 single SQL statement를 사용할 수 있다.

### API Response Wrapping

모든 route handler는 공유 response helper를 사용한다.

- 성공: `{ ok: true, data }`
- 실패: `{ ok: false, error: { code, message } }`

Service와 repository는 HTTP response를 직접 만들지 않는다.

## 데이터 소유권

- SQLite는 persisted data의 authoritative source이다.
- localStorage는 이 module의 소유가 아니며 authoritative하지 않다.
- SQL을 직접 실행할 수 있는 코드는 repository뿐이다.

## 테스트 가능한 속성

PBT-01 속성 식별:

| 속성 | 범주 | 대상 | 기대 규칙 |
|---|---|---|---|
| API response wrapper는 payload를 보존한다 | Round-trip / Invariant | API helper | success data를 감쌌다가 확인해도 동등한 payload가 유지된다. |
| 주문 총액은 line total 합과 같다 | Invariant | Order repository/service input model | 총액은 음수가 아니며 `quantity * unitPrice` 합과 같다. |
| Session status는 허용값 중 하나다 | Invariant | Table session records | status는 `active` 또는 `completed`이다. |
| 완료된 session은 active 조회에 나타나지 않는다 | Invariant | Session repository query | active query는 active session만 반환한다. |
| 메뉴 표시 순서는 reorder 후 안정적이다 | Invariant | Menu repository reorder | 반환 순서는 persisted ordered IDs와 일치한다. |
| Row-to-domain mapping은 deterministic하다 | Invariant | Repository mapping functions | 동일 row input은 항상 동일 domain object로 mapping된다. |

## PBT 준수

- **PBT-01**: 준수. 이 unit의 테스트 가능한 속성을 식별했다.
- **PBT-02**: API response helper와 row/domain serialization에 적용 계획.
- **PBT-03**: order total, session status, menu ordering에 적용 계획.
- **PBT-04**: 이 단계에서는 N/A. idempotent operation을 주장하지 않는다.
- **PBT-05**: 이 단계에서는 N/A. 별도 oracle implementation이 없다.
- **PBT-06**: session/order state transition은 후속 unit functional design에서 다룬다.
- **PBT-07~PBT-10**: Code Generation 및 Build and Test에서 적용한다.
