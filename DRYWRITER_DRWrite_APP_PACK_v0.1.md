# DRYWRITE 맞춤 건조한작가 Pack v0.1

APP_ID: DRYWRITE
BASELINE_SHA: 609397c8cac1ec78d07d7b02f84da0d4d09fb9ec
PERSONA_ID: DRYWRITER
PACK_VERSION: DRYWRITER-DRYWRITE-v0.1

## 앱 요구사항

- 긴 글을 읽는 에디토리얼형 프론트
- 제목·커버·본문·메타 라인을 분리
- 장/절 구조를 유지
- 건조한작가 개입은 정보의 배열, 문장 압축, 과장 제거, 독자용 결론 정리에 사용

## Seed용 템플릿

입력: Queens 자료 묶음 + 앱 주제 + 근거 링크
출력: 핵심 사실, 독자 문제, 관찰 포인트, 금지 추론, 추천 구조

중앙 에이전트 확인:
- 자료 간 충돌 확인
- 핵심 메시지 1개 선택
- 독자에게 필요한 순서 결정
- 근거 없는 수사 제거

## 1차 템플릿

구조: 제목 → 메타 라인 → 문제 제기 → 핵심 관찰 3개 → 사례/근거 → 독자에게 남는 질문

검사:
- 제목이 본문 약속과 일치하는가
- 첫 단락이 주제를 설명하는가
- 각 장이 같은 메시지를 반복하지 않는가
- 출처 없는 수치가 없는가

## 2차 템플릿

입력: Seed + T1 + 중앙 에이전트 T1_REVIEW
출력: 최종 본문 + 수정 요약 + 미확인 근거 목록

검사:
- T1 오류가 제거됐는가
- 장/절 구조가 렌더러에서 유지되는가
- 메타 라인이 앱 형식과 맞는가
- 중앙 에이전트 T2_REVIEW_ID가 기록됐는가

## 기본 테스트 글

제목: 정보가 많을수록, 하나의 질문이 필요하다

메타: 건조한작가 | DRYWRITE | DRYWRITER-PACK-v0.1

본문 요지: 자료를 많이 모으는 것과 독자가 이해하는 글을 만드는 것은 같은 일이 아니다. 먼저 질문을 하나로 좁히고, Queens 자료에서 그 질문을 확인하는 근거만 남긴다. 나머지는 다음 글의 재료로 분리한다.

TEST_EXPECTED: T1_REVIEW_REQUIRED / T2_REVIEW_REQUIRED / NO_UNVERIFIED_FACTS

## 반영 상태

- Pack 파일: READY_FOR_APP_BACKEND
- 실제 Apps Script 함수 연결: 미확인
- Vercel Preview 재배포: 대기
- 기본 테스트 실행: PR 반영 후 실행
