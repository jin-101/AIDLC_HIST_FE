# NFR 설계 패턴 - Foundation and Data

## 범위

이 문서는 Foundation and Data Module의 성능, 신뢰성, 유지보수성, 테스트, 복원력 요구사항을 구현 설계 패턴으로 구체화한다.

## 데이터 접근 패턴

### Repository Boundary Pattern

- 모든 SQL은 `src/server/repositories/*` 안에 둔다.
- UI, route handler, service는 SQL을 직접 실행하지 않는다.
- repository는 database row를 domain object로 mapping한다.
- repository는 persistence detail을 숨기고 service에 typed result를 반환한다.

적용 이유:

- 직접 SQL을 사용하면서도 결합도를 낮춘다.
- 추후 ORM 또는 다른 database 접근 방식으로 변경할 여지를 남긴다.

### Parameterized Query Pattern

- 사용자 입력이 포함되는 모든 SQL은 parameterized statement를 사용한다.
- string interpolation으로 SQL을 구성하지 않는다.

적용 이유:

- Security Baseline은 비활성화되어 있지만, 기본적인 SQL injection 방지는 유지한다.

## Transaction 패턴

### Transaction Boundary Pattern

다음 workflow는 transaction으로 묶는다.

- order와 order item 생성.
- table session completion.
- order deletion과 관련 state 재계산.

설계 규칙:

- transaction 내부에서 모든 관련 write가 성공하면 commit한다.
- 하나라도 실패하면 rollback한다.
- transaction failure는 구조화된 persistence error로 mapping한다.

적용 이유:

- 주문과 session 상태의 부분 저장을 방지한다.
- SQLite를 source of truth로 안정적으로 유지한다.

## Error Handling 패턴

### Structured Error Mapping Pattern

repository/service error는 API 경계에서 다음 형태로 변환한다.

```ts
type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};
```

권장 error code:

- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `PERSISTENCE_ERROR`
- `UNKNOWN_ERROR`

적용 이유:

- UI가 실패 유형을 구분할 수 있다.
- 후속 logging/monitoring 설계에 사용할 수 있다.
- SQL 내부 error detail을 client에 노출하지 않는다.

## 성능 패턴

### Prototype Query Budget Pattern

- typical local CRUD/API DB query 목표는 200ms 이내이다.
- repository 함수는 불필요한 반복 query를 피한다.
- dashboard snapshot처럼 여러 정보를 모으는 query는 필요한 범위에서 join 또는 집계 query를 사용한다.

적용 이유:

- local prototype의 사용성을 유지한다.
- 과도한 optimization 없이 기본 반응성을 확보한다.

## Seed Data 패턴

### Deterministic Seed Pattern

- seed data는 반복 실행 시 중복 생성되지 않아야 한다.
- seed 여부는 stable store code 존재 여부로 판단한다.
- 테스트와 demo에서 예측 가능한 store/table/menu 구성을 제공한다.

적용 이유:

- 로컬 실행과 테스트 재현성을 높인다.
- 초기 사용자가 관리자 화면에서 데이터를 직접 넣지 않아도 된다.

## Backup and Restore 패턴

### Manual Backup Documentation Pattern

MVP에서는 backup script를 구현하지 않고 Build and Test 산출물에 다음을 문서화한다.

- SQLite DB 파일 위치.
- DB 파일 복사 기반 수동 backup 절차.
- 기존 DB 파일 교체 기반 restore 절차.
- restore 후 seed/store/menu/order 조회 검증 절차.

적용 이유:

- RTO/RPO 목표가 시간 단위인 prototype에 적합하다.
- 자동화보다 단순성과 명확성이 중요하다.

## PBT 패턴

### Fast-Check Property Pattern

- Vitest test 안에서 `fast-check`를 사용한다.
- domain-specific generator를 `src/test/generators`에 둔다.
- 실패 시 seed와 shrink 결과를 확인할 수 있도록 test output을 유지한다.

적용 대상:

- API response helper payload 보존.
- order total invariant.
- session status allowed value invariant.
- active/completed session query invariant.
- menu reorder invariant.
- row-to-domain mapping determinism.

## Resiliency 적용 요약

- transaction boundary로 부분 실패를 줄인다.
- structured error로 실패를 식별 가능하게 한다.
- SQLite source of truth 원칙을 유지한다.
- backup/restore는 MVP에서 문서화로 처리한다.
- multi-zone, auto-scaling, chaos testing은 local prototype에서 N/A이다.

