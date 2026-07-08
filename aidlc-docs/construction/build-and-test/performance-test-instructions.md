# Performance Test Instructions

## 목적

로컬 MVP 기준의 빠른 feedback loop와 realtime 체감 동작을 검증한다. 현재 범위에서는 별도 load testing tool을 추가하지 않는다.

## Performance Requirements

| 항목 | 목표 |
|---|---|
| Unit/PBT test suite | `npm test` 60초 이내 |
| Realtime dashboard update | 수동 검증 기준 주문 생성 후 약 2초 이내 표시 |
| Build prerequisite | Node.js `18.18.0` 이상 또는 `20.x` 이상 |

## Current Performance Observation

최근 실행 결과:

- `npm test`: 약 3.31초
- Test files: 19 passed
- Tests: 66 passed

## Run Performance-Oriented Checks

### 1. Test Suite Duration

```bash
npm test
```

기대 결과:

- 전체 test suite가 60초 이내 완료된다.
- PBT shrinking과 seed reproducibility는 유지된다.

### 2. TypeScript Compile Duration

```bash
npx tsc --noEmit
```

기대 결과:

- TypeScript compile이 local development feedback loop 안에서 완료된다.

### 3. Manual Realtime Latency Check

절차:

1. `npm run dev`로 local server를 실행한다.
2. 관리자 dashboard를 연다.
3. 고객 화면에서 주문을 생성한다.
4. dashboard가 약 2초 이내 갱신되는지 확인한다.

관련 checklist:

- `aidlc-docs/construction/testing-and-quality/code/manual-verification-checklist.md`

## Exclusions

현재 local MVP 범위에서 제외:

- k6/JMeter 기반 load test
- browser e2e 성능 테스트
- cloud autoscaling 성능 테스트
- production APM/monitoring 기반 latency 분석

## When Performance Does Not Meet Target

1. 느린 test file을 확인한다.
2. PBT generator가 과도하게 큰 입력을 생성하는지 확인한다.
3. integration-style test가 불필요하게 DB를 반복 초기화하는지 확인한다.
4. browser realtime 지연이면 SSE 연결 상태와 dashboard snapshot fallback을 확인한다.
