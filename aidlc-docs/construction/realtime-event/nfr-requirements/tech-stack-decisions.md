# 기술 스택 결정 - Realtime Event

## 선택 기술

| 관심사 | 결정 | 근거 |
|---|---|---|
| SSE endpoint | Next.js App Router route handler | 기존 API route 구조를 유지하고 추가 서버 runtime dependency가 없다. |
| Streaming primitive | Web Streams `ReadableStream` | SSE response를 표준 Web API로 구성할 수 있다. |
| Client subscription | browser `EventSource` | 요구사항의 SSE 재연결 동작을 브라우저 기본 기능으로 활용한다. |
| Event bus | in-memory TypeScript module | local MVP와 단일 process에 가장 단순하다. |
| Event payload | lightweight JSON metadata | event 전송량을 줄이고 snapshot API를 source of truth로 유지한다. |
| Recovery model | snapshot reload fallback | replay buffer 없이 event 유실과 reconnect를 단순하게 흡수한다. |
| UI state | React hook | 연결 상태, 마지막 event 시각, highlighted table state를 dashboard에 연결하기 적합하다. |
| Test runner | Vitest | 기존 프로젝트 test runner를 재사용한다. |
| Property-based testing | `fast-check` | 활성화된 PBT 확장 요구사항이며 event validation/filter/highlight 검증에 적합하다. |

## Runtime Dependency 결정

새 runtime dependency는 추가하지 않는다.

재사용 dependency:

- `next`
- `react`
- `react-dom`

개발/테스트 dependency:

- `vitest`
- `fast-check`

제외한 선택지:

| 선택지 | 제외 이유 |
|---|---|
| SSE 전용 library | MVP 범위에서 Web Streams와 EventSource만으로 충분하다. |
| WebSocket | 양방향 통신이 필요하지 않고, 요구사항은 SSE를 명시한다. |
| Redis/pub-sub broker | local single-process prototype에는 과하다. production multi-instance hardening에서 재검토한다. |
| Last-Event-ID replay buffer | snapshot fallback으로 요구사항을 충족하며 구현 복잡도를 낮춘다. |

## API Route 결정

| Route | Method | Rendering/Runtime 성격 | 결정 |
|---|---|---|---|
| `/api/admin/events` | GET | SSE stream | `storeId` query를 요구하고 `text/event-stream` 응답을 반환한다. |
| `/api/customer/orders` | POST | JSON mutation | 주문 저장 성공 후 `order-created` publish를 추가한다. |
| `/api/admin/orders/status` | PATCH | JSON mutation | 상태 변경 성공 후 `order-updated` publish를 추가한다. |
| `/api/admin/orders` | DELETE | JSON mutation | 삭제 성공 후 `order-deleted` publish를 추가한다. |
| `/api/admin/tables/complete` | POST | JSON mutation | 완료 성공 후 `table-completed` publish를 추가한다. |

## Event Bus 결정

Event bus는 `src/server/events/` 아래에 둔다.

필요 기능:

- `subscribe(storeId, client)`로 client 등록.
- `unsubscribe(clientId)`로 client 제거.
- `publish(event)`로 같은 storeId client에게 fan-out.
- 전송 실패 client 제거.
- 구독 수와 publish 결과를 test에서 관찰 가능한 return value로 제공.

## Client Hook 결정

`useAdminRealtimeEvents` hook을 `src/features/realtime/` 또는 `src/features/admin/` 경계에 둔다.

입력:

- `storeId`
- `onReload`
- `highlightMs`

출력:

- `connectionState`
- `highlightedTableIds`
- `lastEventAt`
- `disconnect`

설계 이유:

- dashboard page에서 EventSource 세부사항을 숨긴다.
- EventSource mock 기반 test가 가능하다.
- 연결 실패가 dashboard data state를 직접 덮어쓰지 않도록 분리한다.

## Helper 결정

순수 helper는 UI 밖에 둔다.

| Helper | 책임 | PBT 대상 |
|---|---|---|
| `isRealtimeEventType` | 허용 event type 판정 | 예 |
| `parseRealtimeEvent` | unknown payload를 event/null로 변환 | 예 |
| `shouldDeliverToStore` | storeId 기반 delivery 판정 | 예 |
| `shouldReloadForRealtimeSignal` | open/message에 따른 reload decision | 예 |
| `nextHighlightedTables` | highlight 추가/만료 계산 | 예 |

## UX 기술 결정

- dashboard 상단 또는 toolbar에 `admin-realtime-status` 보조 표시를 둔다.
- 연결 실패 상태는 기존 dashboard card grid를 가리지 않는다.
- `order-created` 수신 시 table card에 `highlighted` class 또는 data state를 짧게 적용한다.
- 수동 새로고침 버튼은 유지한다.

## Testing 기술 결정

| 테스트 대상 | 방식 |
|---|---|
| event type/payload helper | Vitest example test + `fast-check` invariant |
| store delivery predicate | `fast-check` generated storeId/event storeId |
| highlight expiry | generated timestamp/tableId list property |
| event bus | Vitest unit test with fake send function |
| EventSource hook | EventSource mock 기반 open/message/error/cleanup test |

## Prototype 제약

- in-memory event bus는 server restart와 multi-instance 배포에서 event를 보존하지 않는다.
- SSE event는 best-effort notification이다.
- Dashboard snapshot API가 source of truth이다.
- 연결 수와 event rate는 local MVP 수준으로 제한한다.
- production monitoring, shared broker, replay buffer, auth hardening은 후속 hardening 범위이다.

## 확장 규칙 준수

- **Property-Based Testing**: 준수. `fast-check`를 유지하고 event helper와 highlight transition을 pure function 중심으로 설계한다.
- **Resiliency**: 준수. reconnect fallback, snapshot recovery, failed client isolation, malformed event ignore를 기술 결정에 반영했다.
- **Security Baseline**: 사용자 결정에 따라 비활성화되어 적용하지 않는다.
