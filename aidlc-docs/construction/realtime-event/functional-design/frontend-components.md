# 프론트엔드 컴포넌트 설계 - Realtime Event

## 범위

Realtime Event Module은 기존 관리자 dashboard에 SSE 구독과 신규 주문 강조 상태를 추가한다. 새로운 화면을 만들기보다 `/admin/dashboard`의 상태 관리와 카드 표시를 확장한다.

## Component Hierarchy

| 컴포넌트/훅 | 책임 |
|---|---|
| `AdminDashboardPage` | 기존 dashboard snapshot 조회와 SSE subscription을 조합한다. |
| `useAdminRealtimeEvents` | EventSource 생성, 연결 상태, event parse, reload callback 호출을 담당한다. |
| `realtime-event-helpers` | event validation, store filter, reload decision, highlight state 계산을 담당한다. |
| `TableCardGrid` | highlighted tableId를 받아 table card 시각 강조 class를 적용한다. |
| `AdminStatusPanel` | SSE 연결 상태 또는 snapshot 오류를 보조 메시지로 표시한다. |

## Hook 설계

### `useAdminRealtimeEvents`

입력:

| 이름 | 타입 | 설명 |
|---|---|---|
| `storeId` | `string | null` | 관리자 session store scope |
| `onReload` | `() => Promise<void> | void` | dashboard snapshot 재조회 callback |
| `highlightMs` | `number` | 신규 주문 강조 유지 시간 |

출력:

| 이름 | 타입 | 설명 |
|---|---|---|
| `connectionState` | `EventConnectionState` | connecting, open, closed, failed |
| `highlightedTableIds` | `string[]` | 현재 강조할 tableId 목록 |
| `lastEventAt` | `string | null` | 마지막 유효 event 수신 시각 |
| `disconnect` | `() => void` | EventSource 명시 종료 |

동작:

1. `storeId`가 없으면 EventSource를 만들지 않는다.
2. `storeId`가 있으면 `/api/admin/events?storeId=...`로 연결한다.
3. `open` event에서 `connectionState=open`으로 바꾸고 `onReload`를 호출한다.
4. `message` event에서 payload를 parse하고 validate한다.
5. event storeId가 session storeId와 다르면 무시한다.
6. 유효 event이면 `onReload`를 호출한다.
7. `order-created`이면 해당 tableId를 highlight set에 추가한다.
8. highlight 만료 timer가 지나면 tableId를 제거한다.
9. `error` event에서는 `connectionState=failed`를 표시하되 기존 dashboard data는 유지한다.
10. unmount 또는 logout 시 EventSource를 닫는다.

## UI 상태

| 상태 | 표시 |
|---|---|
| connecting | 대시보드 상단에 실시간 연결 중 보조 상태를 표시할 수 있다. |
| open | 별도 방해 UI 없이 최신 event 수신 시각을 표시할 수 있다. |
| failed | 기존 dashboard는 유지하고 수동 새로고침 버튼을 계속 제공한다. |
| highlighted table | table card 배경 또는 border를 짧게 강조한다. |

## API Integration Points

| Frontend | API |
|---|---|
| `useAdminRealtimeEvents` | `GET /api/admin/events?storeId=...` |
| `useAdminDashboard.reload` | `GET /api/admin/dashboard?storeId=...` |

## Form Validation

이 모듈은 새로운 사용자 입력 form을 추가하지 않는다. store scope는 기존 관리자 session에서 파생한다.

## Automation-Friendly UI 규칙

- SSE 상태 표시는 `data-testid="admin-realtime-status"`를 사용한다.
- highlighted table card는 기존 `data-testid="admin-table-{tableNumber}-card"`를 유지한다.
- 수동 새로고침 버튼은 기존 `data-testid="admin-dashboard-reload-button"`을 유지한다.
- SSE 연결은 테스트에서 EventSource mock으로 대체 가능해야 한다.

## Error Handling

| 오류 | UI 대응 |
|---|---|
| EventSource 생성 실패 | connectionState를 failed로 표시하고 기존 snapshot 유지 |
| malformed message | message를 무시하고 dashboard data 유지 |
| snapshot reload 실패 | 기존 `useAdminDashboard` 실패 메시지와 수동 재시도 사용 |
| logout | EventSource close 후 login 화면으로 이동 |

## PBT Testable Properties

| 대상 | 속성 |
|---|---|
| `shouldReloadForRealtimeEvent` | 유효 event와 open event만 reload를 요구한다. |
| `shouldApplyEventForStore` | session storeId와 event storeId가 같을 때만 true이다. |
| `nextHighlightedTables` | order-created는 tableId를 추가하고 만료된 tableId는 제거한다. |
| `parseRealtimeEvent` | malformed JSON 또는 invalid type은 null로 변환한다. |

## 확장 규칙 준수

- **Property-Based Testing**: 준수. UI 밖 helper로 분리할 속성을 식별했다.
- **Resiliency**: 준수. 연결 실패 시 기존 snapshot 유지, open 시 snapshot 복구, malformed event 무시를 반영했다.
- **Security Baseline**: 비활성화 상태이므로 적용하지 않는다.
