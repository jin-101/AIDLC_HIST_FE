# PBT 재현성 가이드

## 목적

이 문서는 fast-check 기반 property-based test 실패를 재현하고, 최소 실패 사례를 regression test로 승격하는 절차를 정의한다.

## 기본 실행

```bash
npm test
```

Vitest가 모든 example-based test와 PBT를 함께 실행한다.

## 실패 정보 확인

fast-check property가 실패하면 출력에서 다음 정보를 확인한다.

- 실패한 test file
- 실패한 property 이름
- seed
- path
- shrunk minimal failing input

seed와 path는 같은 실패 입력을 재현하는 핵심 정보다.

## 실패 test file만 재실행

예시:

```bash
npx vitest run src/features/cart/cart-service.test.ts
```

특정 파일을 먼저 재실행해 실패 범위를 좁힌다.

## seed/path 재현

fast-check 실패 메시지에 seed/path가 표시되면 해당 값을 test 설정에 임시로 넣어 재현한다.

예시:

```ts
fc.assert(property, { seed: 123456789, path: "0:1:2" });
```

재현 후에는 다음 중 하나로 처리한다.

- production code 또는 test generator의 결함이면 수정한다.
- business rule이 누락된 입력이면 generator constraint를 보강한다.
- 실제 regression이면 최소 실패 입력을 example-based test로 추가한다.

## Regression 승격 기준

PBT가 발견한 실패 사례는 다음 조건 중 하나에 해당하면 example-based regression test로 고정한다.

- 사용자 스토리의 핵심 acceptance criteria를 위반한다.
- total, validation, status transition 같은 business invariant를 깨뜨린다.
- shrink 결과가 작고 읽기 쉬운 domain example이다.
- 동일 failure가 seed/path 재실행에서 반복된다.

## 운영 원칙

- fast-check shrinking은 비활성화하지 않는다.
- 모든 seed를 고정하지 않는다.
- flaky failure는 무시하거나 단순 retry로 덮지 않는다.
- raw primitive generator가 의미 없는 입력을 만들면 domain generator를 먼저 보강한다.

## 관련 규칙

- PBT-07: domain-specific generator 품질
- PBT-08: shrinking과 seed 기반 재현성
- PBT-10: example-based test와 PBT의 보완 관계
- TQ-RULE-022: seed/path 기록
- TQ-RULE-023: PBT 실패 재실행 방법 문서화
