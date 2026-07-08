# Build Instructions

## Prerequisites

- **Runtime**: Node.js `18.18.0` 이상, `19.8.0` 이상, 또는 `20.0.0` 이상
- **Package Manager**: npm
- **Build Tool**: Next.js `next build`
- **Project Root**: `/Users/jhan/Desktop/test/ai-dlc/angular-study`
- **Database**: local SQLite

## Dependencies

Runtime dependency:

- `better-sqlite3`
- `next`
- `react`
- `react-dom`
- `uuid`

Dev dependency:

- `vitest`
- `fast-check`
- `@testing-library/react`
- `jsdom@24.1.3`
- `typescript`
- `tsx`

## Environment Variables

| Variable | Required | 설명 |
|---|---|---|
| `TABLE_ORDER_DB_PATH` | No | 지정하지 않으면 `data/table-order.sqlite`를 사용한다. |

## Build Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Initialize Local Database

```bash
npm run db:init
```

### 3. Run TypeScript Compile Check

```bash
npx tsc --noEmit
```

기대 결과:

- TypeScript error 없음

### 4. Build Application

```bash
npm run build
```

기대 결과:

- Next.js production build 성공
- `.next/` build artifact 생성

## Current Build Status

현재 local observation:

- `npx tsc --noEmit`: 통과
- `npm run build`: Node.js `18.17.1` 때문에 시작 전 중단

Build 실패 메시지:

```text
You are using Node.js 18.17.1. For Next.js, Node.js version "^18.18.0 || ^19.8.0 || >= 20.0.0" is required.
```

## Troubleshooting

### Build Fails with Node.js Version Error

원인:

- local Node.js version이 Next.js 요구사항보다 낮다.

해결:

1. Node.js를 `18.18.0` 이상 또는 `20.x` 이상으로 업그레이드한다.
2. dependency를 다시 확인한다.
3. build를 재실행한다.

```bash
npm install
npm run build
```

### Build Fails with Dependency Errors

원인:

- `node_modules`가 없거나 lockfile과 설치 상태가 맞지 않을 수 있다.

해결:

```bash
npm install
npm test
npx tsc --noEmit
```

### Build Fails with Compilation Errors

원인:

- TypeScript compile error 또는 Next.js build-time error

해결:

1. 먼저 `npx tsc --noEmit`으로 type error를 확인한다.
2. 실패한 file과 line을 수정한다.
3. `npm test`를 실행한다.
4. `npm run build`를 다시 실행한다.
