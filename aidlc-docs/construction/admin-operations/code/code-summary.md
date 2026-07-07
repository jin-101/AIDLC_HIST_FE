# Admin Operations 코드 생성 요약

## 생성/수정한 애플리케이션 코드

### API Route

- `src/app/api/admin/login/route.ts`: 관리자 로그인 및 password 제외 세션 응답
- `src/app/api/admin/dashboard/route.ts`: 테이블별 활성 세션/주문 대시보드 조회
- `src/app/api/admin/orders/status/route.ts`: 주문 상태 변경
- `src/app/api/admin/orders/route.ts`: 주문 삭제
- `src/app/api/admin/tables/route.ts`: 테이블 조회 및 등록/수정
- `src/app/api/admin/tables/complete/route.ts`: 테이블 활성 세션 완료
- `src/app/api/admin/history/route.ts`: 완료 주문 이력 조회
- `src/app/api/admin/menus/route.ts`: 메뉴 조회/생성/수정/삭제
- `src/app/api/admin/menus/reorder/route.ts`: 메뉴 표시 순서 변경

### 관리자 클라이언트/상태

- `src/features/admin/admin-api.ts`: 관리자 API client와 `AdminApiError`
- `src/features/admin/admin-error-messages.ts`: 오류 메시지 fallback
- `src/features/admin/admin-session-storage.ts`: 관리자 sessionStorage read/write/clear 및 schema guard
- `src/features/admin/use-admin-session.ts`: 로그인/로그아웃 세션 훅
- `src/features/admin/use-admin-dashboard.ts`: 대시보드 로드/재조회 훅
- `src/features/admin/use-admin-order-actions.ts`: 주문 상태 변경/삭제 mutation 훅
- `src/features/admin/use-admin-tables.ts`: 테이블 목록/저장/완료 훅
- `src/features/admin/use-admin-history.ts`: 이력 조회 훅
- `src/features/admin/use-admin-menus.ts`: 메뉴 CRUD/reorder 훅

### 순수 Helper

- `src/features/admin/dashboard-mapper.ts`: 대시보드 카드 합계, 최신 주문, 필터 계산
- `src/features/admin/order-status-helper.ts`: 주문 상태 검증, 라벨, 권장 다음 상태
- `src/features/admin/history-filter.ts`: 이력 검색 조건 검증
- `src/features/admin/menu-admin-helpers.ts`: 메뉴 draft 검증 및 순서 이동
- `src/features/admin/types.ts`: 관리자 화면/요청/응답 type

### UI

- `src/components/admin/admin-shell.tsx`: 관리자 공통 shell과 navigation
- `src/components/admin/admin-status-panel.tsx`: 관리자 loading/error/empty 상태 패널
- `src/components/admin/table-card-grid.tsx`: 테이블 카드형 대시보드
- `src/components/admin/order-detail-panel.tsx`: 이력 주문 상세 패널
- `src/components/admin/menu-item-form.tsx`: 메뉴 생성/수정 폼
- `src/app/admin/login/page.tsx`: 관리자 로그인
- `src/app/admin/dashboard/page.tsx`: 주문 운영 대시보드
- `src/app/admin/tables/page.tsx`: 테이블 관리
- `src/app/admin/history/page.tsx`: 주문 이력 조회
- `src/app/admin/menus/page.tsx`: 메뉴 관리
- `src/app/page.tsx`: 관리자 진입 링크 추가
- `src/app/globals.css`: 관리자 layout, dashboard card, form/list style 추가

### 테스트

- `src/features/admin/admin-session-storage.test.ts`
- `src/features/admin/dashboard-mapper.test.ts`
- `src/features/admin/order-status-helper.test.ts`
- `src/features/admin/history-filter.test.ts`
- `src/features/admin/menu-admin-helpers.test.ts`
- `src/features/admin/admin-api.test.ts`
- `src/features/admin/admin-actions.test.ts`

## Story Coverage

| Story | 구현 상태 | 주요 구현 |
|---|---|---|
| US-ADMIN-001 | 완료 | `/admin/login`, `use-admin-session`, `admin-session-storage` |
| US-ADMIN-002 | 완료 | `/admin/dashboard`, `table-card-grid`, dashboard mapper |
| US-ADMIN-003 | 완료 | 주문 상태 변경 API/client/hook |
| US-ADMIN-004 | 완료 | 주문 삭제 confirm 및 API/client/hook |
| US-ADMIN-005 | 완료 | 테이블 완료 API와 dashboard action |
| US-ADMIN-006 | 완료 | `/admin/history`, 이력 필터, 주문 상세 패널 |
| US-ADMIN-007 | 완료 | `/admin/menus`, 메뉴 CRUD/reorder |

## PBT Coverage

- 관리자 세션 파싱: 필수 문자열 필드와 `loggedIn=true` 조건 보존
- 대시보드 합계: 주문 금액 배열의 합과 카드 총액 일치
- 이력 필터: 동일 테이블과 동일 날짜 경계 매칭
- 메뉴 순서 변경: 항목 집합 보존

## Resiliency 구현 요약

- API 실패는 `AdminApiError`로 구조화하고 UI에서는 한국어 fallback 메시지를 사용한다.
- Dashboard, menu, table mutation 실패 시 기존 목록/snapshot을 덮어쓰지 않는다.
- 관리자 sessionStorage 파싱 실패는 `null`로 fallback한다.
- 삭제와 테이블 완료 같은 destructive action은 confirm 후 실행한다.
- Realtime Event Module과 충돌하지 않도록 현재 단계는 명시적 reload boundary를 유지한다.

## Build and Test 단계 검증 후보

- `npm test`
- `npm run build`
- 브라우저 수동 확인:
  - `/admin/login`
  - `/admin/dashboard`
  - `/admin/tables`
  - `/admin/history`
  - `/admin/menus`

## 이번 단계에서 수행한 검증 결과

- `npm install`: 완료. `node_modules/`와 `package-lock.json`이 생성되었다.
- `npm test`: 통과. 14개 test file, 46개 test가 모두 통과했다.
- `npx tsc --noEmit`: 통과.
- `npm run build`: 미완료. 현재 Node.js `18.17.1`에서는 설치된 Next.js가 요구하는 `^18.18.0 || ^19.8.0 || >=20.0.0` 조건을 만족하지 않아 빌드가 시작 전에 중단되었다.
