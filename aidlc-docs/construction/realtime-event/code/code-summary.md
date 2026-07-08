# Realtime Event 코드 생성 요약

## 생성/수정한 애플리케이션 코드

### 신규 생성

- `src/features/realtime/types.ts`: Realtime event, connection state, highlighted table type
- `src/features/realtime/realtime-event-helpers.ts`: event type guard, parser, store filter, reload decision, highlight helper
- `src/features/realtime/use-admin-realtime-events.ts`: EventSource 기반 관리자 dashboard realtime hook
- `src/server/events/sse-format.ts`: SSE data frame과 ping frame formatter
- `src/server/events/event-bus.ts`: store-scoped in-memory event bus
- `src/server/events/event-publisher.ts`: mutation 성공 후 event publish helper
- `src/app/api/admin/events/route.ts`: 관리자 SSE endpoint
- `src/features/realtime/realtime-event-helpers.test.ts`: helper example test와 PBT
- `src/features/realtime/use-admin-realtime-events.test.ts`: EventSource mock hook test
- `src/server/events/event-bus.test.ts`: event bus unit test

### 수정

- `src/app/api/customer/orders/route.ts`: 주문 생성 성공 후 `order-created` publish
- `src/app/api/admin/orders/status/route.ts`: 상태 변경 성공 후 `order-updated` publish
- `src/app/api/admin/orders/route.ts`: 주문 삭제 전 order 조회 후 `order-deleted` publish
- `src/app/api/admin/tables/complete/route.ts`: 테이블 완료 성공 후 `table-completed` publish
- `src/server/repositories/order-repository.ts`: 삭제 event payload 확보용 `findById` 추가
- `src/app/admin/dashboard/page.tsx`: realtime hook 연결, 상태 표시, highlight 전달
- `src/components/admin/table-card-grid.tsx`: highlighted table card 표시
- `src/app/globals.css`: realtime status와 highlighted card style 추가
- `package.json`, `package-lock.json`: hook test 실행용 dev dependency `@testing-library/react`, `jsdom@24.1.3` 추가

## Event Flow

1. 고객 주문 생성, 주문 상태 변경, 주문 삭제, 테이블 완료 API route가 persistence 성공 후 event publisher를 호출한다.
2. event publisher는 lightweight `RealtimeEvent` payload를 구성한다.
3. in-memory event bus는 event의 `storeId` bucket에 연결된 SSE client에게만 fan-out한다.
4. dashboard hook은 EventSource message를 parse하고 storeId를 검증한다.
5. 유효 event 또는 EventSource open 시 dashboard snapshot을 재조회한다.
6. `order-created` event는 해당 table card를 짧게 highlight한다.

## Story Coverage

| Story | 구현 상태 | 주요 구현 |
|---|---|---|
| US-CUST-004 | 완료 | 주문 생성 후 `order-created` publish |
| US-ADMIN-002 | 완료 | SSE endpoint, EventSource hook, dashboard reload, table highlight |
| US-ADMIN-003 | 완료 | 주문 상태 변경 후 `order-updated` publish |
| US-ADMIN-004 | 완료 | 테이블 완료 후 `table-completed` publish |
| US-ADMIN-005 | 완료 | 주문 삭제 후 `order-deleted` publish |

## PBT Coverage

- store delivery predicate: 같은 storeId일 때만 event 전달 대상으로 판단
- reload decision: `open`, `valid-event`만 snapshot reload trigger
- highlight expiry: 만료된 highlight 제거 및 신규 table highlight 추가
- event helper example test: type guard, malformed payload, valid payload parse

## Resiliency 구현 요약

- SSE event는 source of truth가 아니며 dashboard snapshot API가 authoritative recovery path이다.
- EventSource open과 유효 event 수신 시 snapshot reload로 유실 event를 흡수한다.
- malformed event와 store mismatch event는 무시한다.
- event bus send 실패 client는 즉시 제거하고 나머지 client 전송은 계속한다.
- SSE route는 keepalive ping과 abort cleanup을 수행한다.
- publish 실패는 persistence 성공 response를 rollback하지 않는다.

## 검증 결과

- `npm test`: 통과. 17개 test file, 59개 test 통과.
- `npx tsc --noEmit`: 통과.
- `npm run build`: 미완료. 현재 Node.js `18.17.1`에서는 설치된 Next.js가 요구하는 `^18.18.0 || ^19.8.0 || >=20.0.0` 조건을 만족하지 않아 빌드가 시작 전 중단되었다.

## Build and Test 단계 검증 후보

- `npm test`
- `npx tsc --noEmit`
- Node.js를 `18.18.0` 이상 또는 `20.x` 이상으로 올린 뒤 `npm run build`
- 브라우저 수동 확인:
  - `/admin/dashboard`에서 `admin-realtime-status` 표시
  - 고객 주문 생성 후 2초 이내 dashboard snapshot 갱신
  - 신규 주문 table card highlight
  - SSE 연결 실패 시 수동 새로고침 유지
