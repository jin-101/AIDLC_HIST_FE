# Table Order MVP

테이블 주문 프로토타입입니다. 고객은 테이블 인증 후 메뉴를 담아 주문할 수 있고, 관리자는 주문 현황, 테이블 세션, 메뉴, 주문 이력, realtime dashboard를 확인할 수 있습니다.

이 프로젝트는 AI-DLC workflow로 요구사항, 설계, 구현, 테스트 산출물을 함께 생성했습니다. 관련 문서는 `aidlc-docs/` 아래에 있습니다.

## 빠른 접속 정보

프로토타입 확인용 seed 계정입니다. 접속이 막히면 먼저 아래 값으로 입력했는지 확인하세요.

### 고객 주문 시작

| 입력 항목 | 값 |
|---|---|
| 매장 코드 | `demo-store` |
| 테이블 번호 | `1` |
| 테이블 비밀번호 | `table-1` |

다른 테이블로 테스트하려면 다음 조합을 사용합니다.

| 테이블 번호 | 테이블 비밀번호 |
|---|---|
| `2` | `table-2` |
| `3` | `table-3` |
| `4` | `table-4` |

### 관리자 로그인

| 입력 항목 | 값 |
|---|---|
| 매장 코드 | `demo-store` |
| 관리자 비밀번호 | `admin` |

## 주요 기능

- 고객 테이블 인증
- 카테고리별 메뉴 조회
- 장바구니 관리
- 주문 제출
- 현재 테이블 세션 주문 내역 조회
- 관리자 로그인
- 관리자 dashboard
- 주문 상태 변경 및 삭제
- 테이블 세션 완료
- 과거 주문 조회
- 메뉴 등록, 수정, 순서 변경
- SSE 기반 관리자 realtime event 반영
- Vitest + fast-check 기반 example/PBT 테스트

## 기술 스택

| 영역 | 기술 |
|---|---|
| Framework | Next.js 15 |
| UI | React 19 |
| Language | TypeScript |
| Database | SQLite, `better-sqlite3` |
| Test Runner | Vitest |
| Property-Based Testing | fast-check |
| DOM Test Environment | jsdom |

## 요구 환경

Next.js 15 build 요구사항 때문에 Node.js 버전이 중요합니다.

- 권장: Node.js `20.x`
- 최소: Node.js `18.18.0` 이상
- 현재 확인된 제한: Node.js `18.17.1`에서는 `npm run build`가 시작 전 중단됩니다.

Node.js 버전 확인:

```bash
node -v
```

## 설치

```bash
npm install
```

## 데이터베이스 초기화

```bash
npm run db:init
```

기본 DB 파일은 다음 위치에 생성됩니다.

```text
data/table-order.sqlite
```

다른 DB 파일을 쓰고 싶으면 `TABLE_ORDER_DB_PATH`를 지정합니다.

```bash
TABLE_ORDER_DB_PATH=/tmp/table-order.sqlite npm run db:init
```

## 데모 데이터

초기화 시 다음 seed data가 생성됩니다.

| 항목 | 값 |
|---|---|
| 매장 코드 | `demo-store` |
| 관리자 비밀번호 | `admin` |
| 테이블 번호 | `1`, `2`, `3`, `4` |
| 테이블 비밀번호 | `table-1`, `table-2`, `table-3`, `table-4` |

메뉴 seed:

- 김치볶음밥
- 불고기덮밥
- 비빔국수
- 콜라
- 사이다
- 아이스티
- 감자튀김
- 치킨너겟

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 접속합니다.

```text
http://localhost:3000
```

## 화면 경로

| 경로 | 설명 |
|---|---|
| `/` | 고객/관리자 진입 화면 |
| `/customer/setup` | 고객 테이블 인증 |
| `/customer/menu` | 고객 메뉴 조회 |
| `/customer/cart` | 고객 장바구니 |
| `/customer/orders` | 현재 세션 주문 내역 |
| `/admin/login` | 관리자 로그인 |
| `/admin/dashboard` | 관리자 realtime 주문 dashboard |
| `/admin/tables` | 테이블 관리 |
| `/admin/menus` | 메뉴 관리 |
| `/admin/history` | 주문 이력 |

## 고객 주문 흐름

1. `http://localhost:3000/customer/setup`으로 이동합니다.
2. 다음 값을 입력합니다.
   - 매장 코드: `demo-store`
   - 테이블 번호: `1`
   - 테이블 비밀번호: `table-1`
3. 메뉴 화면에서 메뉴를 장바구니에 담습니다.
4. 장바구니에서 주문을 제출합니다.
5. `/customer/orders`에서 현재 세션 주문 내역을 확인합니다.

## 관리자 흐름

1. `http://localhost:3000/admin/login`으로 이동합니다.
2. 다음 값을 입력합니다.
   - 매장 코드: `demo-store`
   - 관리자 비밀번호: `admin`
3. `/admin/dashboard`에서 현재 주문을 확인합니다.
4. `/admin/tables`에서 테이블 세션을 완료할 수 있습니다.
5. `/admin/menus`에서 메뉴를 관리할 수 있습니다.
6. `/admin/history`에서 과거 주문을 조회합니다.

참고: 로그인 화면 입력 필드에 다른 기본값이 표시되어도 seed DB 기준 관리자 비밀번호는 `admin`입니다.

## 테스트 실행

전체 테스트:

```bash
npm test
```

watch mode:

```bash
npm run test:watch
```

특정 테스트 파일 실행:

```bash
npx vitest run src/features/cart/cart-service.test.ts
```

현재 검증 결과:

- Test files: 19 passed
- Tests: 66 passed

## TypeScript 검증

```bash
npx tsc --noEmit
```

현재 검증 결과:

- TypeScript compile 통과

## Production Build

```bash
npm run build
```

Node.js `18.18.0+`, `19.8.0+`, 또는 `20.0.0+`에서 실행해야 합니다.

현재 확인된 local 제한:

```text
Node.js 18.17.1에서는 Next.js 요구사항 미충족으로 build가 시작 전 중단됩니다.
```

해결:

1. Node.js를 `20.x` 또는 `18.18.0+`로 업그레이드합니다.
2. dependency를 다시 확인합니다.
3. build를 재실행합니다.

```bash
npm install
npm run build
```

## API 개요

| API | 설명 |
|---|---|
| `POST /api/customer/setup` | 고객 테이블 인증 및 세션 생성 |
| `GET /api/customer/menu` | 고객 메뉴 조회 |
| `POST /api/customer/orders` | 고객 주문 생성 |
| `GET /api/customer/orders/current` | 현재 세션 주문 조회 |
| `POST /api/admin/login` | 관리자 로그인 |
| `GET /api/admin/dashboard` | 관리자 dashboard snapshot |
| `GET /api/admin/events` | 관리자 SSE event stream |
| `GET /api/admin/orders` | 관리자 주문 조회 |
| `PATCH /api/admin/orders/status` | 주문 상태 변경 |
| `GET /api/admin/tables` | 테이블 목록 조회 |
| `POST /api/admin/tables` | 테이블 생성/수정 |
| `POST /api/admin/tables/complete` | 테이블 세션 완료 |
| `GET /api/admin/menus` | 관리자 메뉴 조회 |
| `POST /api/admin/menus` | 메뉴 저장 |
| `POST /api/admin/menus/reorder` | 메뉴 순서 변경 |
| `GET /api/admin/history` | 주문 이력 조회 |

## 프로젝트 구조

```text
src/
├── app/                 # Next.js route, page, API route
├── components/          # 고객/관리자 UI component
├── features/            # 고객, 관리자, 주문, realtime feature logic
├── lib/                 # 공통 type, API response/error helper
├── server/              # DB, repository, event bus
└── test/                # test fixture, generator

aidlc-docs/
├── inception/           # 요구사항, user stories, application design
└── construction/        # functional/NFR/code/build-test 산출물
```

## 품질 문서

주요 AI-DLC 산출물:

- `aidlc-docs/inception/requirements/requirements.md`
- `aidlc-docs/inception/user-stories/stories.md`
- `aidlc-docs/inception/application-design/application-design.md`
- `aidlc-docs/construction/testing-and-quality/code/code-summary.md`
- `aidlc-docs/construction/build-and-test/build-and-test-summary.md`

PBT 재현성 가이드:

- `aidlc-docs/construction/testing-and-quality/code/pbt-reproducibility.md`

수동 realtime 검증 checklist:

- `aidlc-docs/construction/testing-and-quality/code/manual-verification-checklist.md`

## 자주 발생하는 문제

### `npm run build`가 Node.js 버전 오류로 실패하는 경우

Node.js를 업그레이드한 뒤 다시 실행합니다.

```bash
node -v
npm install
npm run build
```

### 관리자 로그인이 실패하는 경우

다음을 확인합니다.

- DB 초기화 여부: `npm run db:init`
- 매장 코드: `demo-store`
- 관리자 비밀번호: `admin`

### 고객 테이블 인증이 실패하는 경우

다음을 확인합니다.

- 매장 코드: `demo-store`
- 테이블 번호: `1`
- 테이블 비밀번호: `table-1`

테이블 `2`, `3`, `4`는 각각 `table-2`, `table-3`, `table-4`를 사용합니다.

### 데이터가 꼬인 경우

개발 중 seed DB를 새로 만들고 싶으면 기존 SQLite 파일을 정리한 뒤 다시 초기화합니다.

```bash
npm run db:init
```

현재 `seedDatabase`는 이미 `demo-store`가 있으면 seed를 중복 삽입하지 않습니다.

## 현재 상태

- 개발 구현: 완료
- 테스트: 통과
- TypeScript compile: 통과
- Production build: Node.js 업그레이드 후 재검증 필요
