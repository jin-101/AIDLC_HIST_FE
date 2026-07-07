# Requirements Clarification Questions

답변 검토 중 구현 범위에 영향을 주는 충돌과, 활성화된 Resiliency Baseline에서 요구하는 필수 의사결정 항목이 확인되었습니다.
각 질문의 `[Answer]:` 뒤에 선택지 문자를 입력해 주세요. 선택지가 맞지 않으면 마지막 `Other`를 선택하고 설명을 적어 주세요.

## Question 1
데이터 저장 방식은 어떻게 확정할까요?

배경: 기존 답변에서 1번은 `Next.js + SQLite 데이터베이스`, 2번은 `브라우저 localStorage 중심의 프론트엔드 프로토타입`을 선택했습니다. 두 선택은 저장 책임과 구현 범위가 다릅니다.

A) Next.js API + SQLite를 실제 저장소로 사용하고, localStorage는 장바구니/태블릿 자동 로그인 정보 같은 클라이언트 임시 상태에만 사용

B) 브라우저 localStorage 중심으로 구현하고, SQLite는 이번 MVP에서 사용하지 않음

C) Next.js API + SQLite와 localStorage 양쪽에 주문/메뉴 데이터를 저장하는 하이브리드 프로토타입으로 구현

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
RTO/RPO 목표와 재해 복구 전략은 어떻게 설정할까요?

A) RPO/RTO: 수 시간 - Backup & Restore 전략. 가장 낮은 비용. 비중요 또는 초기 MVP에 적합

B) RPO/RTO: 수십 분 - Pilot Light 전략. 데이터는 유지하고 서비스는 장애 시 확장

C) RPO/RTO: 수 분 - Warm Standby 전략. 축소된 용량으로 상시 운영 후 장애 시 확장

D) RPO/RTO: 거의 실시간 - Multi-site Active/Active 전략. 가장 높은 비용, 미션 크리티컬 서비스에 적합

E) N/A - 단일 리전 또는 로컬 MVP 배포로 충분하며 cross-region DR은 필요 없음

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
프로덕션 변경 관리는 어떻게 다룰까요?

A) 기존 조직 변경 관리 프로세스를 사용함 - 도구/프로세스 이름을 답변에 함께 적어 주세요

B) 공식 프로세스가 없음 - AI-DLC가 lightweight 변경 관리 프로세스를 제안

C) N/A - 이 워크로드는 공식 변경 관리 대상이 아님

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 4
CI/CD 도구와 배포 프로세스는 어떻게 설정할까요?

A) 기존 CI/CD 파이프라인 사용 - 도구 이름을 답변에 함께 적어 주세요

B) 파이프라인이 없음 - AI-DLC가 선택된 런타임에 맞는 CI/CD 정의를 제안

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
배포 실패 시 rollback 방식은 어떻게 할까요?

A) 이전 artifact/version을 재배포

B) Blue/green 환경 전환으로 이전 환경으로 복귀

C) Canary 배포 중 health/metric 이상 시 자동 rollback

D) 데이터베이스 migration rollback까지 포함하는 database-aware rollback 필요

E) 조직의 기존 rollback 절차 사용 - 참조를 답변에 함께 적어 주세요

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 6
배포 전략은 어떤 방식이 적합할까요?

A) Direct / in-place 배포 - 가장 단순하고 비용이 낮지만 blast radius가 큼

B) Rolling 배포 - 점진적으로 인스턴스 교체

C) Blue/green 배포 - 무중단 전환, 비용 증가

D) Canary 배포 - 일부 트래픽부터 점진 배포 및 자동 rollback

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 7
프로덕션 incident response는 어떻게 처리할까요?

A) 기존 incident response 프로세스 사용 - 예: PagerDuty, 내부 온콜/runbook 등 참조를 답변에 함께 적어 주세요

B) 공식 프로세스가 없음 - AI-DLC가 lightweight incident response 및 COE 프로세스를 제안

X) Other (please describe after [Answer]: tag below)

[Answer]: A

