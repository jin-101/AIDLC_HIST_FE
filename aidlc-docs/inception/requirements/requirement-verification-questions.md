# Requirements Verification Questions

요구사항 문서를 구현 가능한 계획으로 확정하기 위한 질문입니다.
각 질문의 `[Answer]:` 뒤에 선택지 문자를 입력해 주세요. 선택지가 맞지 않으면 마지막 `Other`를 선택하고 설명을 적어 주세요.

## Question 1
이번 MVP의 기술 스택은 어떻게 진행할까요?

A) Angular 프론트엔드 + Node.js/Express 백엔드 + SQLite 데이터베이스

B) Angular 프론트엔드 + NestJS 백엔드 + SQLite 데이터베이스

C) Angular 프론트엔드만 구현하고 백엔드/API는 mock으로 대체

X) Other (please describe after [Answer]: tag below)

[Answer]: X (Nextjs로 프론트엔드, 백엔드 구현해주고 DB는 SQLite 데이터베이스로 구현해줘.)

## Question 2
주문/메뉴/테이블 데이터는 어디까지 실제로 저장해야 하나요?

A) MVP에서도 실제 로컬 데이터베이스에 영구 저장

B) 서버 메모리 저장소로 구현하고 앱 재시작 시 초기화 허용

C) 브라우저 localStorage 중심의 프론트엔드 프로토타입으로 구현

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 3
관리자 실시간 주문 모니터링의 SSE는 MVP에서 실제 구현해야 하나요?

A) 실제 SSE 엔드포인트와 프론트엔드 구독을 구현

B) 폴링으로 대체하고 SSE는 후속 작업으로 남김

C) 정적/수동 새로고침으로 대체

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 4
관리자 인증은 어느 수준으로 구현할까요?

A) JWT + bcrypt + 16시간 세션 + 기본 로그인 시도 제한까지 구현

B) JWT + bcrypt + 16시간 세션만 구현하고 로그인 시도 제한은 제외

C) 단순 관리자 비밀번호 검증만 구현

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 5
메뉴 이미지는 MVP에서 어떻게 처리할까요?

A) 이미지 URL 문자열만 저장하고 그대로 표시

B) 기본 placeholder 이미지와 이미지 URL 표시를 함께 구현

C) 이미지 표시 없이 메뉴명/가격/설명만 구현

X) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 6
Security Extensions를 이 프로젝트에 적용할까요?

A) Yes - SECURITY 규칙을 blocking constraint로 적용

B) No - SECURITY 규칙을 건너뜀

X) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 7
Property-Based Testing Extension을 이 프로젝트에 적용할까요?

A) Yes - PBT 규칙을 blocking constraint로 적용

B) Partial - 순수 함수와 serialization round-trip에만 적용

C) No - PBT 규칙을 건너뜀

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 8
Resiliency Baseline을 이 프로젝트에 적용할까요?

A) Yes - 설계 시점의 복원력 baseline을 적용

B) No - 복원력 baseline을 건너뜀

X) Other (please describe after [Answer]: tag below)

[Answer]: A

