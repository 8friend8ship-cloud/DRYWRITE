# DryWriter AI 최소사용 / ChatGPT 최종요리 계약

기준일: 2026-08-18

## 표준 흐름

Queens → Seed → TEMPLATE_1_INPUT → CHATGPT_T1_REVIEW → TEMPLATE_2_OUTPUT → CHATGPT_FINAL_READY → FINAL_OUTPUT

## 금지

- 프런트에서 Gemini/OpenAI API 직접 호출 금지
- 브라우저 localStorage에 API 키 저장 금지
- Apps Script에서 글 전체를 AI로 재생성 금지
- 이미 완료된 템플릿을 다음 단계에서 처음부터 다시 생성 금지

## Gemini 역할

Google Sheets Gemini는 요약, 분류, 태그, 누락 후보, 구조화 보조에만 사용한다.

## ChatGPT 역할

DryWriter는 1차 템플릿부터 ChatGPT 검수 대상이다. 페르소나 선택, 상황/갈등/대화 구조, AI 티 제거, 중복 제거를 1차에서 검수하고 2차 템플릿 이후 최종 자연어 요리를 수행한다.

## 배포 테스트 성공 조건

HTTP 200만으로 성공 처리하지 않는다. 관리자 화면에서 원문 입력 → 1차 템플릿 생성 → CHATGPT_T1_REVIEW_REQUIRED 표시 → 검수 패키지 생성 → 검수대기 원고 저장까지 확인해야 한다.

향후 중앙 큐 연결 후에는 같은 CONTENT_ID로 1차 검수 결과와 FINAL_OUTPUT이 되돌아오는 것까지 E2E 기준으로 삼는다.
