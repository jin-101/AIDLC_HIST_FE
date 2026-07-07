# 테이블오더 MVP 요구사항

## 의도 분석

- **원 요청**: "AI-DLC를 사용하여 requirements에 있는 요구사항을 개발해줘."
- **요청 유형**: 신규 프로젝트
- **범위 추정**: 단일 Next.js 애플리케이션 안의 복수 컴포넌트
- **복잡도 추정**: 보통
- **요구사항 상세 수준**: 표준
- **프로젝트 유형**: Greenfield

## 입력 산출물

- `requirements/table-order-requirements.md`
- `requirements/constraints.md`
- `aidlc-docs/inception/requirements/requirement-verification-questions.md`
- `aidlc-docs/inception/requirements/requirements-clarification-questions.md`
- `aidlc-docs/inception/requirements/requirements-final-clarification-questions.md`

## 확정된 기술 결정

- **애플리케이션 프레임워크**: Next.js. 프론트엔드 화면과 백엔드 API Route를 함께 구현한다.
- **데이터베이스**: SQLite.
- **영속성 모델**: 매장, 테이블, 세션, 메뉴, 주문, 주문 이력의 authoritative storage는 Next.js API와 SQLite이다.
- **클라이언트 저장소**: localStorage는 장바구니와 테이블 태블릿 자동 로그인 정보 같은 임시 클라이언트 상태에만 사용한다.
- **실시간 업데이트**: 관리자 주문 모니터링은 실제 SSE 엔드포인트와 프론트엔드 구독으로 구현한다.
- **관리자 인증**: MVP에서는 단순 관리자 비밀번호 검증을 사용한다.
- **메뉴 이미지**: MVP에서는 메뉴 이미지 표시를 제외한다. 메뉴명, 가격, 설명, 카테고리만 표시한다.
- **Property-Based Testing**: 전체 적용한다.
- **Security Baseline 확장**: 사용자 결정에 따라 비활성화한다.
- **Resiliency Baseline 확장**: 전체 적용한다.

## 기능 요구사항

### 고객 인터페이스

#### FR-CUST-001 테이블 태블릿 설정 및 자동 로그인

- 시스템은 매장 식별자, 테이블 번호, 테이블 비밀번호를 입력받아 초기 테이블 태블릿 설정을 수행해야 한다.
- 시스템은 성공한 테이블 로그인 정보를 브라우저에 로컬 저장해야 한다.
- 시스템은 저장된 테이블 정보로 자동 로그인해야 한다.
- 테이블 세션은 세션 ID로 추적해야 한다.

#### FR-CUST-002 메뉴 탐색

- 고객 인터페이스는 테이블 context가 준비되면 메뉴 화면을 기본 화면으로 표시해야 한다.
- 시스템은 메뉴를 카테고리별로 표시해야 한다.
- 각 메뉴는 메뉴명, 가격, 설명, 카테고리를 표시해야 한다.
- 고객은 카테고리 간 빠르게 이동할 수 있어야 한다.
- 메뉴 이미지는 MVP에서 제외한다.

#### FR-CUST-003 장바구니 관리

- 고객은 메뉴를 장바구니에 추가할 수 있어야 한다.
- 고객은 장바구니에서 메뉴를 삭제할 수 있어야 한다.
- 고객은 수량을 증가/감소할 수 있어야 한다.
- 시스템은 총 금액을 실시간 계산해야 한다.
- 고객은 장바구니를 비울 수 있어야 한다.
- 장바구니는 새로고침 후에도 localStorage로 유지되어야 한다.
- 장바구니는 주문 확정 시에만 서버로 전송된다.

#### FR-CUST-004 주문 생성

- 고객은 주문 전 최종 주문 내역을 확인할 수 있어야 한다.
- 고객은 주문을 확정할 수 있어야 한다.
- 주문 payload에는 매장, 테이블, 세션, 주문 항목, 수량, 단가, 총액이 포함되어야 한다.
- 주문 성공 시 주문 번호를 표시해야 한다.
- 주문 성공 시 장바구니를 비워야 한다.
- 주문 성공 시 5초 후 메뉴 화면으로 이동해야 한다.
- 주문 실패 시 에러 메시지를 표시하고 장바구니를 유지해야 한다.

#### FR-CUST-005 현재 세션 주문 내역 조회

- 고객은 현재 테이블 세션의 주문 내역만 조회할 수 있어야 한다.
- 주문은 주문 시각 순으로 표시해야 한다.
- 각 주문은 주문 번호, 주문 시각, 메뉴/수량, 금액, 상태를 표시해야 한다.
- 이전 손님의 주문은 제외해야 한다.
- 테이블 이용 완료 처리된 주문은 현재 세션 화면에서 제외해야 한다.
- 주문이 많아질 경우 페이지네이션 또는 무한 스크롤을 제공해야 한다.

### 관리자 인터페이스

#### FR-ADMIN-001 관리자 로그인

- 시스템은 관리자 로그인 화면을 제공해야 한다.
- 관리자는 매장 식별자와 비밀번호를 입력한다.
- MVP에서는 단순 비밀번호 검증을 사용한다.
- OAuth, SNS 로그인, 2FA, 복잡한 사용자 관리는 제외한다.

#### FR-ADMIN-002 실시간 주문 모니터링

- 관리자 대시보드는 테이블별 주문 카드를 그리드로 표시해야 한다.
- 대시보드는 SSE로 주문 데이터를 갱신해야 한다.
- 정상적인 로컬 실행 환경에서 신규 주문은 2초 이내 표시되어야 한다.
- 각 테이블 카드는 테이블 번호, 현재 세션 총액, 최신 주문 미리보기를 표시해야 한다.
- 관리자는 카드에서 테이블/주문 상세를 열 수 있어야 한다.
- 상세 화면은 주문 메뉴, 수량, 주문 번호, 주문 시각, 총액을 표시해야 한다.
- 관리자는 주문 상태를 대기중/준비중/완료로 변경할 수 있어야 한다.
- 신규 주문은 시각적으로 강조해야 한다.
- 대시보드는 테이블 필터링을 지원해야 한다.

#### FR-ADMIN-003 테이블 관리

- 관리자는 테이블 번호와 테이블 비밀번호를 설정할 수 있어야 한다.
- 시스템은 해당 테이블의 첫 주문 시 active table session을 생성하거나 활성화해야 한다.
- 관리자는 확인 후 특정 주문을 삭제할 수 있어야 한다.
- 주문 삭제 후 테이블 총액을 재계산해야 한다.
- 주문 삭제 결과는 성공/실패 피드백으로 표시해야 한다.
- 관리자는 확인 후 테이블 이용 완료를 처리할 수 있어야 한다.
- 테이블 이용 완료 시 현재 세션 주문은 이력으로 조회 가능해야 한다.
- 테이블 이용 완료 시 현재 주문 목록과 총액은 0으로 초기화되어야 한다.
- 새 손님은 이전 세션 주문을 볼 수 없어야 한다.
- 관리자는 테이블별 과거 주문을 최신순으로 조회할 수 있어야 한다.
- 과거 주문 항목은 주문 번호, 주문 시각, 메뉴, 총액, 이용 완료 시각을 포함해야 한다.
- 과거 주문 조회는 날짜 필터를 지원해야 한다.

#### FR-ADMIN-004 메뉴 관리

- 관리자는 카테고리별 메뉴를 조회할 수 있어야 한다.
- 관리자는 메뉴명, 가격, 설명, 카테고리를 가진 메뉴를 생성할 수 있어야 한다.
- 관리자는 메뉴를 수정할 수 있어야 한다.
- 관리자는 메뉴를 삭제할 수 있어야 한다.
- 관리자는 메뉴 노출 순서를 조정할 수 있어야 한다.
- 시스템은 필수 필드와 가격 범위를 검증해야 한다.

## 데이터 요구사항

- SQLite는 stores, tables, table_sessions, menus, orders, order_items, order history 조회에 필요한 데이터를 저장해야 한다.
- 주문은 table session ID로 그룹화해야 한다.
- completed session의 주문은 과거 이력으로 조회 가능해야 한다.
- 테이블 이용 완료 시각을 기록해야 한다.
- 로컬 MVP 테스트에 적합한 초기 store/admin/table/menu seed data를 제공해야 한다.

## 비기능 요구사항

### UX 및 접근성

- 고객용 조작 요소는 터치 친화적이어야 한다.
- 주요 터치 타깃은 가능한 44x44px 이상이어야 한다.
- 메뉴와 주문 화면은 명확한 시각 계층을 가져야 한다.
- 고객/관리자 화면은 브라우저 기반 태블릿 또는 데스크톱에서 사용할 수 있어야 한다.

### 성능

- 관리자 SSE 갱신은 로컬 MVP 환경에서 신규 주문을 2초 이내 표시해야 한다.
- 장바구니 총액은 수량/항목 변경 직후 갱신되어야 한다.
- 일반적인 소규모~중규모 매장 메뉴 규모에서 메뉴 탐색이 반응성 있게 동작해야 한다.

### 신뢰성 및 복원력

- 주문 제출 실패 시 장바구니를 유지해야 한다.
- SSE 연결은 브라우저 `EventSource`가 지원하는 재연결 동작을 활용해야 한다.
- 핵심 API는 구조화된 성공/실패 응답을 반환해야 한다.
- MVP는 복원력 결정을 문서화하고, 로컬 구현이 부적합한 cloud production hardening은 후속 단계로 둔다.

### 테스트

- 핵심 business scenario는 example-based test로 검증해야 한다.
- business logic, data transformation, cart/order 상태 처리, serialization/persistence transformation에는 적용 가능한 범위에서 property-based test를 사용해야 한다.
- TypeScript PBT 프레임워크는 별도 변경이 없는 한 `fast-check`를 사용한다.

## 명시적 제외 범위

- 결제 처리, PG 연동, 영수증, 환불, 포인트, 쿠폰.
- OAuth, SNS 로그인, 2FA, OTP, 복잡한 직원 권한 관리.
- 이미지 리사이징/최적화, CMS, 광고.
- push, SMS, email, 소리/진동 알림.
- 주방 디스플레이, 주방 재고 관리.
- 고급 분석, 매출 리포트, 재고 관리, 직원 관리, 예약, 리뷰, 다국어.
- 배달 플랫폼, POS, 소셜 공유, 지도 API, 번역 API 같은 외부 연동.

## Resiliency 결정

- **워크로드 중요도**: MVP는 중간 중요도이며, 주문 생성과 관리자 주문 모니터링이 가장 중요한 흐름이다.
- **비즈니스 영향**: 주문 생성 장애는 신규 주문을 막고, 관리자 대시보드 장애는 운영 가시성을 떨어뜨린다.
- **RTO/RPO 및 DR 전략**: 시간 단위 RPO/RTO, Backup & Restore 전략.
- **변경 관리**: MVP에서는 공식 변경 관리 대상이 아니다.
- **CI/CD**: 기존 pipeline이 없으므로 AI-DLC가 Next.js와 SQLite에 맞는 pipeline을 제안한다.
- **Rollback**: blue/green swap back.
- **배포 전략**: blue/green.
- **Incident response**: MVP 단계에서는 문서화만 하며 실제 운영 연동은 제외한다.
- **Regional topology**: 후속 설계에서 변경하지 않는 한 single-region 또는 local MVP 배포로 충분하다.

## 확장 규칙 준수

### Property-Based Testing

- **PBT-01**: Requirements Analysis 단계에서는 N/A. Functional Design에서 적용한다.
- **PBT-02~PBT-08**: Requirements Analysis 단계에서는 N/A. Code Generation 및 Build and Test에서 적용한다.
- **PBT-09**: 준수. `fast-check`를 TypeScript PBT 프레임워크로 선택했다.
- **PBT-10**: 준수. PBT는 example-based test를 대체하지 않고 보완한다.

### Resiliency

- **RESILIENCY-01**: 준수. 핵심 workload와 비즈니스 영향이 식별되었다.
- **RESILIENCY-02**: 준수. RTO/RPO와 Backup & Restore 전략을 선택했다.
- **RESILIENCY-03**: 준수. MVP에서는 change management를 N/A로 결정했다.
- **RESILIENCY-04**: 준수. CI/CD 제안, rollback 방식, 배포 전략이 결정되었다.
- **RESILIENCY-05~RESILIENCY-15**: Requirements Analysis에서는 부분 적용. 상세 모니터링, health check, topology, backup 절차, failover 절차, resiliency test, runbook은 후속 설계/테스트 산출물에서 다룬다.
