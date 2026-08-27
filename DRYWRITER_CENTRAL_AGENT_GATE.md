# Drywriter 중앙 에이전트 생산 게이트

이 브랜치는 현재 배포 SHA에서 파생된 최소 계약 반영본이다.

## 생산 순서

1. Queens 자료를 Seed로 식별한다.
2. 중앙 에이전트가 Seed 조합과 메시지·구조·스타일을 검토한다.
3. 중앙 에이전트 검토 ID를 남긴 뒤 T1을 생성한다.
4. T1 결과를 중앙 에이전트가 리폼·검토한다.
5. 중앙 에이전트 검토 ID를 남긴 뒤 T2를 생성한다.
6. 앱 백엔드가 테스트하고 오류·부족분을 보고한다.

## 차단

- Persona, Seed, Pack 버전, Front App ID가 없으면 HOLD
- T1/T2에 중앙 에이전트 검토 ID가 없으면 HOLD
- 이 계약은 글을 자동 생성하지 않으며, 앱 백엔드가 호출해 실행 결과를 기록해야 한다.

## 현재 기준

- Persona: DRYWRITER
- Pack: DRYWRITER-PACK-v0.1
- Base deployment SHA: 609397c8cac1ec78d07d7b02f84da0d4d09fb9ec
