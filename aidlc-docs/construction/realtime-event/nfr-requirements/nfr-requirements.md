# NFR 요구사항 - Realtime Event

## 범위

이 문서는 Realtime Event Module의 SSE 기반 관리자 실시간 주문 업데이트에 필요한 비기능 요구사항을 정의한다. 대상은 in-memory event bus, `/api/admin/events` SSE endpoint, dashboard EventSource subscription, mutation 성공 후 event publication, reconnect 및 snapshot fallback이다.

## 확정된 NFR 결정

| 항목 | 결정 |
|---|---|
| 갱신 성능 목표 | 로컬 MVP 정상 실행 조건에서 mutation 성공 후 2초 이내 dashboard에 반영한다. |
| 동시 연결 규모 | 단일 매장 기준 관리자 브라우저 1~5개 연결을 기준으로 한다. |
| Event 유실 복구 | replay buffer 없이 reconnect/open 또는 event 수신 시 dashboard snapshot 재조회로 복구한다. |
| 연결 상태 UI | 연결 중/연결됨/연결 실패와 마지막 event 시각을 보조 상태로 표시한다. |
| 테스트 전략 | event helper PBT, event bus unit test, EventSource mock 기반 hook test를 작성한다. |
| 기술 스택 | 추가 runtime dependency 없이 Next.js route handler, Web Streams, browser EventSource, Vitest, fast-check를 사용한다. |

## 성능

- 주문 생성, 주문 상태 변경, 주문 삭제, 테이블 완료 mutation 성공 후 관리자 dashboard 반영은 로컬 MVP 정상 실행 조건에서 2초 이내를 목표로 한다.
- SSE event payload는 event metadata만 포함해 전송 크기를 작게 유지한다.
- dashboard는 event 수신 시 partial patch 대신 snapshot API를 재조회한다.
- snapshot 재조회는 기존 Admin Operations dashboard API를 사용한다.
- 단일 매장 기준 관리자 브라우저 1~5개 연결에서 event broadcast가 눈에 띄는 지연 없이 동작해야 한다.
- `order-created` highlight 계산은 client memory의 작은 set/list 연산으로 처리한다.
- polling은 도입하지 않는다.

## 확장성

- in-memory event bus는 local prototype과 단일 Node.js process를 기준으로 한다.
- 다중 process, serverless scale-out, multi-instance production에서는 event가 instance 사이에 공유되지 않으므로 shared broker로 재설계해야 한다.
- 동시 연결은 프로토타입 기준 1~5개이며, 20개 이상 연결과 장시간 connection pressure는 production hardening 범위로 둔다.
- storeId 기준 client registry를 사용해 매장별 event fan-out을 제한한다.
- event payload는 작게 유지해 client 수 증가 시 broadcast 비용을 낮춘다.

## 가용성 및 복원력

- SSE는 best-effort notification이며 source of truth가 아니다.
- SQLite와 `/api/admin/dashboard` snapshot API가 authoritative recovery path이다.
- EventSource 연결이 끊기면 브라우저 기본 재연결 동작을 활용한다.
- EventSource `open` 발생 시 dashboard snapshot을 재조회한다.
- event 수신 시 dashboard snapshot을 재조회해 event 유실 가능성을 흡수한다.
- replay buffer와 Last-Event-ID 기반 재전송은 MVP에서 제외한다.
- server restart로 in-memory bus가 초기화되어도 reconnect 후 snapshot 재조회로 현재 상태를 복구한다.
- malformed event는 무시하고 기존 dashboard snapshot을 유지한다.
- storeId mismatch event는 무시한다.
- client 전송 실패가 발생하면 해당 client를 제거하고 나머지 client 전송은 계속한다.
- publish 실패는 이미 성공한 persistence를 rollback하지 않는다.

## 사용성 및 접근성

- dashboard는 실시간 연결 상태를 보조 정보로 표시한다.
- 연결 상태는 주문 data와 분리하여 표시하며, 연결 실패가 기존 dashboard snapshot을 가리지 않아야 한다.
- 마지막 event 수신 시각을 표시해 관리자가 최신성 힌트를 볼 수 있게 한다.
- 연결 실패 상태에서도 수동 새로고침 버튼은 계속 사용할 수 있어야 한다.
- 신규 주문은 해당 table card를 짧게 강조한다.
- highlight는 persistent unread count가 아니며 시간이 지나면 자동 제거된다.

## 보안 및 데이터 격리

- Security Baseline 확장은 사용자 결정에 따라 비활성화되어 있다.
- SSE endpoint는 `storeId` query parameter가 없으면 연결을 거부한다.
- event bus는 client를 storeId 기준으로 등록한다.
- event는 같은 storeId client에게만 전달한다.
- client도 event payload의 storeId가 admin session storeId와 다르면 무시한다.
- event payload에는 password, credential, stack trace, SQL detail을 포함하지 않는다.

## 관측성

- client는 `connecting`, `open`, `failed`, `closed` 연결 상태를 추적한다.
- 마지막 유효 event 수신 시각을 기록한다.
- local prototype에서는 production monitoring dashboard가 N/A이다.
- Build and Test 단계에서는 SSE 수동 검증 절차와 실패 재현 절차를 문서화한다.
- production hardening 시에는 connection count, event publish failure count, dashboard reload failure count가 metric 후보이다.

## 데이터 무결성

- event는 persistence 성공 후에만 publish한다.
- event payload만으로 dashboard를 authoritative하게 갱신하지 않는다.
- dashboard total과 주문 목록은 snapshot API 응답을 기준으로 유지한다.
- `order-created`, `order-updated`, `order-deleted`, `table-completed` 외 event type은 무시한다.
- `occurredAt`은 ISO 8601 문자열이어야 한다.

## 유지보수성

- event type guard, store filtering, reload decision, highlight expiry 계산은 UI 밖 pure helper로 분리한다.
- event bus는 server events module에 격리한다.
- API route는 repository mutation 성공 직후 publish를 호출한다.
- repository는 event bus를 직접 import하지 않는다.
- client subscription은 `useAdminRealtimeEvents` hook으로 분리한다.
- dashboard의 manual refresh와 SSE-triggered reload는 같은 reload callback을 재사용한다.

## 테스트

- example-based test는 event type guard, invalid payload 무시, same-store delivery, other-store filtering, failed client removal을 검증해야 한다.
- property-based test는 다음 속성을 다뤄야 한다.
  - storeId filter는 다른 매장 event를 제외한다.
  - event payload validation은 허용된 type과 필수 field만 통과시킨다.
  - reload decision은 EventSource open 또는 유효 event에서 true이다.
  - highlight expiry는 만료된 tableId를 제거한다.
  - malformed event는 dashboard snapshot을 변경하지 않는다.
- event bus unit test는 subscribe, unsubscribe, publish fan-out, failed client isolation을 검증해야 한다.
- EventSource mock 기반 hook test는 open/message/error/cleanup 흐름을 검증해야 한다.
- PBT는 `fast-check`를 사용하고 Vitest에서 실행 가능해야 한다.
- Build and Test 단계에서는 PBT seed 재현 방법을 문서화해야 한다.

## Resiliency 준수

- **RESILIENCY-01**: 준수. 관리자 실시간 주문 모니터링을 운영 가시성 핵심 workload로 식별했다.
- **RESILIENCY-02**: 부분 적용. project-level RTO/RPO는 시간 단위이며, 이 unit은 연결 실패 시 snapshot fallback으로 단기 복구를 제공한다.
- **RESILIENCY-03**: N/A. MVP에서는 formal change management를 제외했다.
- **RESILIENCY-04**: 부분 적용. CI/CD와 rollback은 project-level Build and Test에서 다룬다.
- **RESILIENCY-05**: 부분 적용. client 연결 상태와 마지막 event 시각을 제공한다. production metrics routing은 local prototype에서 N/A이다.
- **RESILIENCY-06**: 부분 적용. SSE 연결 상태와 dashboard snapshot fallback을 health signal로 사용한다. 별도 health endpoint는 Build and Test 또는 Foundation 범위이다.
- **RESILIENCY-07**: N/A. local prototype에는 resiliency posture monitoring 도구를 붙이지 않는다.
- **RESILIENCY-08~RESILIENCY-09**: N/A. local single-process MVP 범위이다.
- **RESILIENCY-10**: 준수. malformed event 무시, store filter, failed client isolation, snapshot fallback으로 cascading failure를 줄인다.
- **RESILIENCY-11~RESILIENCY-13**: N/A. 이 unit은 persistent data store를 소유하지 않는다.
- **RESILIENCY-14**: 부분 적용. EventSource mock test와 server restart 후 snapshot recovery 수동 검증을 Build and Test 단계에서 다룬다.
- **RESILIENCY-15**: N/A. MVP 운영 incident process 연동은 제외한다.

## PBT 준수

- **PBT-01**: 준수. Functional Design에서 테스트 가능한 속성을 식별했다.
- **PBT-02**: N/A. event payload는 lossy notification이며 round-trip 변환이 아니다.
- **PBT-03**: 준수 계획. store filter, payload validation, reload decision invariant를 PBT로 검증한다.
- **PBT-04**: N/A. SSE publish는 idempotent operation으로 정의하지 않는다.
- **PBT-05**: N/A. 별도 oracle implementation은 MVP 범위 밖이다.
- **PBT-06**: 준수 계획. highlight expiry와 connection state transition을 테스트한다.
- **PBT-07**: Code Generation 단계에서 domain-specific event generator를 구현한다.
- **PBT-08**: Build and Test 단계에서 seed reproducibility를 문서화한다.
- **PBT-09**: 준수. TypeScript PBT framework는 `fast-check`이다.
- **PBT-10**: 준수 계획. example-based test와 PBT를 함께 사용한다.
