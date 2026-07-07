# Requirements Final Clarification Questions

요구사항 확정 전에 남은 모순과 누락을 정리하기 위한 마지막 확인 질문입니다.
각 질문의 `[Answer]:` 뒤에 선택지 문자를 입력해 주세요. 선택지가 맞지 않으면 마지막 `Other`를 선택하고 설명을 적어 주세요.

## Question 1
배포 실패 rollback 방식과 배포 전략을 어떻게 맞출까요?

배경: 이전 답변에서 rollback은 `Blue/green 환경 전환`, 배포 전략은 `Direct / in-place`를 선택했습니다. Blue/green rollback은 일반적으로 Blue/green 배포 전략과 함께 설계해야 일관됩니다.

A) Blue/green 배포 전략으로 변경하고, 실패 시 이전 환경으로 swap back

B) Direct / in-place 배포 전략을 유지하고, 실패 시 이전 artifact/version 재배포로 rollback

C) 초기 MVP에서는 배포/rollback 설계를 문서화만 하고 실제 구현 범위에서는 제외

X) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 2
기존 incident response 프로세스의 참조는 무엇인가요?

배경: 이전 답변에서 기존 incident response 프로세스 사용을 선택했습니다. Resiliency Baseline에서는 해당 프로세스 이름 또는 참조를 문서화해야 합니다.

A) 기존 프로세스 참조를 사용 - 아래 `[Answer]:` 뒤에 이름 또는 링크/설명을 함께 적어 주세요

B) 공식 프로세스가 없음 - AI-DLC가 lightweight incident response 및 COE 프로세스를 제안

C) MVP 단계에서는 incident response를 문서화만 하고 실제 운영 연동은 제외

X) Other (please describe after [Answer]: tag below)

[Answer]: C

