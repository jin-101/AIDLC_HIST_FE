# 수동 검증 Checklist - Testing and Quality

## 목적

이 checklist는 자동 테스트가 직접 다루기 어려운 realtime browser 동작을 local MVP 기준으로 확인하기 위한 절차다.

## 사전 조건

- Node.js는 Next.js build prerequisite를 충족한다.
  - 권장: Node.js `18.18.0` 이상 또는 `20.x` 이상
- dependency 설치가 완료되어 있다.
- DB 초기화가 완료되어 있다.

```bash
npm install
npm run db:init
npm run dev
```

## Scenario 1. 관리자 Dashboard Realtime Status

절차:

1. 관리자 로그인 화면에서 demo 관리자 정보로 로그인한다.
2. 관리자 dashboard에 진입한다.
3. realtime status indicator가 연결 상태를 표시하는지 확인한다.

기대 결과:

- dashboard가 로드된다.
- realtime 상태가 화면에서 확인 가능하다.
- 연결 실패 시 실패 또는 재연결 상태가 표시된다.

관련 규칙:

- TQ-RULE-040
- RESILIENCY-14

## Scenario 2. 고객 주문 생성 후 Dashboard 갱신

절차:

1. 고객 화면에서 테이블 인증을 완료한다.
2. 메뉴를 장바구니에 담고 주문을 제출한다.
3. 관리자 dashboard를 확인한다.

기대 결과:

- 주문 제출 후 약 2초 이내 dashboard snapshot 또는 realtime event로 주문이 표시된다.
- 주문 금액은 장바구니 line total 합과 일치한다.

관련 규칙:

- TQ-RULE-041
- US-CUST-004
- US-ADMIN-002

## Scenario 3. 신규 주문 Highlight

절차:

1. 관리자 dashboard를 열어 둔다.
2. 고객 화면에서 새 주문을 생성한다.
3. 새 주문이 들어온 table card를 확인한다.

기대 결과:

- 신규 주문 table card가 일시적으로 강조된다.
- highlight가 지정된 시간 이후 사라진다.

관련 규칙:

- TQ-RULE-042
- US-ADMIN-002

## Scenario 4. SSE 실패 또는 재연결 상황

절차:

1. 관리자 dashboard를 연다.
2. 개발 서버를 일시 중단하거나 network 연결을 끊어 SSE 실패 상태를 만든다.
3. dashboard의 상태 표시와 수동 새로고침 동작을 확인한다.

기대 결과:

- SSE 실패가 화면 상태로 드러난다.
- 수동 새로고침 또는 snapshot fallback으로 현재 주문 상태를 다시 볼 수 있다.
- 하나의 실패 client가 다른 client delivery를 막지 않는다.

관련 규칙:

- TQ-RULE-043
- RESILIENCY-10
- RESILIENCY-14

## Scenario 5. Table Completion 후 Current Orders 제외

절차:

1. 특정 테이블에서 주문을 생성한다.
2. 관리자 table 관리 화면에서 해당 table session을 완료한다.
3. 관리자 dashboard current orders를 확인한다.

기대 결과:

- 완료된 session의 주문은 current orders에서 제외된다.
- 해당 주문은 history 조회 대상으로 남는다.

관련 규칙:

- TQ-RULE-044
- US-ADMIN-004

## 결과 기록

수동 검증 결과는 Build and Test 단계의 summary에 다음 형식으로 기록한다.

| Scenario | Result | Notes |
|---|---|---|
| 관리자 Dashboard Realtime Status | Pass/Fail |  |
| 고객 주문 생성 후 Dashboard 갱신 | Pass/Fail |  |
| 신규 주문 Highlight | Pass/Fail |  |
| SSE 실패 또는 재연결 상황 | Pass/Fail |  |
| Table Completion 후 Current Orders 제외 | Pass/Fail |  |
