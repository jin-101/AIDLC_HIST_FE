# NFR 요구사항 - Foundation and Data

## 범위

이 문서는 Foundation and Data Module의 비기능 요구사항을 정의한다.

## 성능

- prototype scale data 기준 일반적인 local CRUD/API database operation은 200ms 이내 완료를 목표로 한다.
- seed data initialization은 local development startup에 충분히 빠르고 deterministic해야 한다.
- repository 함수는 correctness를 유지하면서 불필요한 반복 query를 피해야 한다.

## 신뢰성

- SQLite는 MVP persisted data의 authoritative data store이다.
- multi-step state change에는 transaction을 사용해야 한다.
  - order와 order item 생성.
  - table session completion.
  - order deletion과 관련 state 재계산.
- SQL error는 UI client에 도달하기 전에 구조화된 application error로 mapping해야 한다.
- repository 함수는 SQL 접근을 UI와 route handler에서 격리해야 한다.

## 가용성 및 복구

- MVP recovery target은 요구사항 결정에 따라 시간 단위 RTO/RPO와 Backup and Restore 전략을 따른다.
- local prototype에서는 backup/restore를 문서화만 한다.
- Build and Test 산출물은 다음을 문서화해야 한다.
  - SQLite database file 위치.
  - 수동 backup 절차.
  - 수동 restore 절차.
  - restore 후 검증 절차.

## 유지보수성

- 직접 SQL은 repository module 안에서만 허용한다.
- repository 함수는 database row를 typed domain object로 mapping해야 한다.
- 공유 domain type과 API response helper는 route handler와 service 전반에서 재사용해야 한다.
- seed data는 반복 가능한 개발과 테스트를 위해 deterministic해야 한다.

## 테스트

- test runner는 Vitest를 사용한다.
- property-based testing framework는 `fast-check`를 사용한다.
- example-based test는 핵심 repository와 API helper scenario를 다뤄야 한다.
- property-based test는 Functional Design에서 식별한 속성을 다뤄야 한다.
  - API response wrapper는 payload를 보존한다.
  - order total은 line total 합과 같다.
  - session status는 허용값 안에 머문다.
  - completed session은 active 조회에 나타나지 않는다.
  - menu display order는 reorder 후 안정적으로 유지된다.
  - row-to-domain mapping은 deterministic하다.

## 보안

- Security Baseline 확장은 사용자 결정에 따라 비활성화되어 있다.
- 복잡한 인증과 credential hardening은 이 unit의 MVP 범위 밖이다.
- SQL error는 raw internal detail을 client에 노출하면 안 된다.
- direct SQL 함수는 사용자 입력값에 대해 string interpolation 대신 parameterized statement를 사용해야 한다.

## 관측성

- 구조화된 API failure code가 필요하다. 후속 UI와 log가 not-found, validation, persistence failure를 구분할 수 있어야 한다.
- production monitoring dashboard는 local prototype에서 N/A이다.
- SQLite health verification은 후속 NFR Design 또는 Build and Test 지침에서 다룬다.

## Resiliency 준수

- **RESILIENCY-01**: 준수. 이 unit은 핵심 주문 생성과 관리자 모니터링의 기반을 지원한다.
- **RESILIENCY-02**: 준수. 요구사항에서 시간 단위 RTO/RPO와 Backup and Restore 전략을 정의했다.
- **RESILIENCY-03**: N/A. MVP에서는 formal change management를 제외했다.
- **RESILIENCY-04**: 부분 적용. CI/CD와 rollback은 project-level 결정이며 후속 단계에서 다룬다.
- **RESILIENCY-05**: 부분 적용. 구조화된 error는 필요하지만 production metrics/log routing은 local prototype에서 N/A이다.
- **RESILIENCY-06**: 계획됨. SQLite health verification은 후속 문서에서 다룬다.
- **RESILIENCY-07**: local prototype에서는 N/A.
- **RESILIENCY-08**: cloud deployment가 없는 local prototype에서는 N/A.
- **RESILIENCY-09**: local prototype에서는 N/A.
- **RESILIENCY-10**: 부분 적용. repository boundary와 transaction은 failure 확산을 줄인다. local SQLite에는 circuit breaker가 N/A이다.
- **RESILIENCY-11**: MVP 수준에서 준수. Backup and Restore를 선택했다.
- **RESILIENCY-12**: 문서화 수준의 backup/restore 절차로 계획됨.
- **RESILIENCY-13**: 수동 restore 검증 절차로 계획됨.
- **RESILIENCY-14**: local prototype에서는 N/A.
- **RESILIENCY-15**: MVP 운영 연동은 N/A이며 incident response는 문서화만 한다.

## PBT 준수

- **PBT-09**: 준수. `fast-check`를 선택했고 project dependency에 포함해야 한다.
- **PBT-08**: 계획됨. Vitest/PBT 실행은 Build and Test에서 seed reproducibility를 문서화해야 한다.
- **PBT-10**: 계획됨. critical path에는 example-based test와 PBT를 함께 사용한다.
