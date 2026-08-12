# OpenAI Project Control

- Repository: `8friend8ship-cloud/DRYWRITE`
- Project role: **Normalized content template, rendering, preview, and authorized editing frontend**
- Management status: `ACTIVE_CORE`
- Last reviewed: `2026-07-30 KST`
- Runtime code source: this repository
- Operations source of truth: Google Drive aliases registered in the central external-connection registry

## 1. 활용 방향

이 저장소는 backend에서 처리된 **정규화 콘텐츠를 결정적으로 렌더링하는 frontend**로 사용한다. 기준 글 생산, Gemini 처리, 인증, 권한, Google Sheets 쓰기는 Apps Script/backend가 담당한다. DRYWRITE는 승인된 Seed 데이터를 template layer로 변환하고 Vercel UI에서 표시한다.

주요 산출물:
- 정규화 콘텐츠의 기사·전자책 presentation
- template별 제목·메타·cover·section 배치
- backend 계약을 사용하는 향후 authorized editing UI
- Vercel Preview와 플랫폼별 presentation 검증

## 2. 상호 연계

### 상위 입력
- `QUEENS_SOURCE`
- `ABIDE_CODE_MAP`
- `DB_MAP_NEWS`
- `DRYWRITE_AUTO_INPUT`
- 사용자 최소 키워드·주제·설정값

### 하위 출력
- `-365-3.30`: 잠언365/성경365 운영 앱
- `-365-AI-`: AI Studio 실험 버전
- `-`: ClipStream AI 파이프라인
- `animation`: 이미지·GIF·MP4 제작
- `Analyzer-12.09`: 품질·성과·수익 분석

## 3. Drive 연계 정책

공개 저장소에는 개인 Drive URL·파일 ID를 직접 넣지 않는다. 아래 별칭을 중앙 운영대장에서 실제 파일과 연결한다.

- `MASTER_REGISTRY`: 전체 프로젝트·저장소·Drive 연결 대장
- `WORKFLOW_CHARTER`: 최상위 에이전트 워크플로우 문서
- `J365_WRITER_SHEET`: J365 작가 에이전트 운영 시트
- `CONTENT_FACTORY`: 롱폼 마스터 생산 시트
- `PUBLISH_AGENT`: 플랫폼 송출 작업 시트

비밀키는 저장소에 넣지 않고 중앙 Agent 설정, Vercel Environment Variables 또는 Apps Script Properties에서만 관리한다.

## 4. 파일 꼬리표

파일을 검토하거나 수정할 때 아래 태그를 이 문서의 파일 대장 또는 PR 설명에 붙인다.

- `[CORE]`: 글 생성 핵심 로직
- `[PROMPT]`: 프롬프트·템플릿·스타일 규칙
- `[FRONTEND]`: 화면·입력·결과 표시
- `[BACKEND]`: 서버·저장·외부 호출
- `[DRIVE]`: Drive/Sheets 입력·출력 연결
- `[INTEGRATION]`: 다른 저장소·앱과 연계
- `[SECRET]`: 키·토큰·민감 설정 점검 대상
- `[DEPLOY]`: Vercel/빌드/배포 관련
- `[LEGACY]`: 구버전 보존용, 신규 개발 금지
- `[REVIEW]`: 역할 또는 최신성 추가 확인 필요

## 5. 초기 파일 대장

| 파일/영역 | 태그 | 활용 방향 | 상태 | 다음 점검 |
|---|---|---|---|---|
| `package.json` | `[DEPLOY]` | Vite, React, local Tailwind build 의존성 | 확인됨 | 빌드·버전 호환 점검 |
| `App.tsx` 및 화면 컴포넌트 | `[FRONTEND]` | repository 데이터 검색·탐색·표시 | 확인됨 | 실제 backend 응답 회귀 |
| `services/contentRepository.ts` | `[BACKEND] [INTEGRATION]` | server/cache/sample 데이터 경계 | 계약 대기 | Apps Script WebApp 계약 연결 |
| `services/appsScriptClient.ts` | `[BACKEND] [SECRET]` | secret 없는 browser-to-backend 경계 | 계약 대기 | 인증·HTTP schema 확정 |
| `templates/` | `[PROMPT] [CORE]` | 정규화 데이터의 결정적 presentation 변환 | 확인됨 | 플랫폼 template 확장 |
| `docs/WORKFLOW_CONTRACT.md` | `[INTEGRATION] [REVIEW]` | backend/frontend 책임과 data contract | 확인됨 | backend 승인 반영 |

## 6. 수정 진행 규칙

1. 코드 작업 전 이 문서에서 해당 파일의 역할과 연계 대상을 확인한다.
2. 파일을 처음 검토하면 파일 대장에 경로·태그·활용 방향을 추가한다.
3. 코드 변경은 원칙적으로 작업 브랜치와 Draft PR로 진행한다.
4. `main`에는 검토되지 않은 실험 코드를 바로 넣지 않는다.
5. Drive 파일을 새로 연결할 때는 먼저 `MASTER_REGISTRY`에 별칭·소유 계정·상태를 기록한다.
6. API 키·토큰·서비스 계정 JSON은 커밋하지 않는다.
7. 변경 후 빌드, 입력→생성→저장→하위 앱 전달 흐름을 함께 확인한다.

## 7. 결정 기록

- `2026-07-30`: DRYWRITE를 전체 프로젝트의 기준 글 생산 엔진으로 지정하고 OpenAI 관리 체계를 시작함.
- `2026-08-12`: 실제 운영 흐름에 맞춰 기준 글 생산과 Gemini 처리를 Apps Script/backend 책임으로 이동하고, DRYWRITE를 정규화 콘텐츠 template/rendering frontend로 재정의함.
