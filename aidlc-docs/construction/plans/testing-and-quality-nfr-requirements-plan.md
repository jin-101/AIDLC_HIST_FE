# Testing and Quality NFR Requirements 계획

## 목적

Testing and Quality Module의 테스트 실행 성능, 재현성, 유지보수성, build prerequisite, 품질 게이트 기준을 확정한다.

## Unit Context

- **Unit**: Testing and Quality Module
- **이전 단계**: Functional Design 완료
- **현재 품질 기준선**:
  - `npm test`: 17개 test file, 59개 test 통과
  - `npx tsc --noEmit`: 통과
  - `npm run build`: Node.js `18.17.1`이 Next.js 요구사항보다 낮아 시작 전 중단
  - PBT framework: `fast-check`
  - Test runner: Vitest

## Planning Questions

## Question 1
테스트 실행 시간 목표는 어떻게 둘까요?

A) 로컬 MVP 기준 `npm test`는 60초 이내, 개별 PBT는 기본 fast-check 설정을 유지

B) `npm test` 10초 이내를 목표로 PBT run 수를 적극 제한

C) 실행 시간 목표를 두지 않음

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 2
품질 게이트는 어떤 명령 조합으로 정의할까요?

A) `npm test`, `npx tsc --noEmit`, Node upgrade 후 `npm run build`

B) `npm test`만 필수로 둠

C) `npm run build`만 필수로 둠

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 3
PBT 재현성 요구사항은 어떻게 둘까요?

A) fast-check 실패 출력의 seed/path를 문서화하고, 실패 case는 regression example로 승격 가능하게 설계

B) 모든 PBT seed를 고정해 매번 같은 값만 실행

C) PBT 재현성 문서화는 제외

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 4
테스트 dependency 관리는 어떻게 할까요?

A) 기존 Vitest/fast-check와 현재 추가된 `@testing-library/react`, `jsdom@24.1.3`만 유지하고 runtime dependency는 추가하지 않음

B) Playwright, MSW 등 e2e/network mock 도구를 지금 추가

C) 테스트 dependency를 줄이기 위해 hook test를 제거

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Question 5
Build prerequisite는 어떻게 품질 기준에 반영할까요?

A) Node.js `18.18.0` 이상 또는 `20.x` 이상을 build prerequisite으로 문서화하고 현재 Node 실패를 known limitation으로 기록

B) Next.js 버전을 낮춰 현재 Node.js `18.17.1`에서 build되게 조정

C) build prerequisite 문서화를 제외

X) Other (please describe after [Answer]: tag below)

[Answer]:A

## Recommended Prototype Answers

- Question 1: A
- Question 2: A
- Question 3: A
- Question 4: A
- Question 5: A

## Execution Checklist

- [x] 모든 planning question 답변 완료 여부를 검증한다.
- [x] 답변의 모호성 또는 모순을 분석한다.
- [x] 테스트 실행 성능 목표를 확정한다.
- [x] 품질 게이트 명령 조합을 확정한다.
- [x] PBT seed/reproducibility 요구사항을 확정한다.
- [x] 테스트 dependency 관리 방식을 확정한다.
- [x] build prerequisite 요구사항을 확정한다.
- [x] `nfr-requirements.md`를 생성한다.
- [x] `tech-stack-decisions.md`를 생성한다.
- [x] Extension compliance를 검증한다.
- [x] 완료한 단계의 체크박스를 즉시 갱신한다.

## Compliance Notes

### PBT

NFR Requirements는 PBT 실행 시간, generator 품질, seed 재현성, example-based test와의 보완 관계를 품질 게이트로 명시해야 한다.

### Resiliency

NFR Requirements는 테스트 실패 재시도, known limitation 기록, Node prerequisite, SSE recovery 검증 기준을 명시해야 한다.
