# OpenAI Project Control

- Repository: `8friend8ship-cloud/DRYWRITE`
- Project role: **Canonical writing engine / e-book and long-form master generator**
- Management status: `ACTIVE_CORE`
- Last reviewed: `2026-07-30 KST`
- Runtime code source: this repository
- Operations source of truth: Google Drive aliases registered in the central external-connection registry

## 1. 활용 방향

이 저장소는 프로젝트 전반의 **기준 글(롱폼 마스터)**을 생산하는 핵심 엔진으로 사용한다. 플랫폼별 글을 이 저장소에서 각각 새로 만들지 않고, 여기에서 완성한 기준본을 하위 앱이 편집·요약·영상화한다.

주요 산출물:
- 건조한 작가 스타일의 롱폼 마스터
- 전자책/PDF용 원문
- R16·성경365·잠언365에 전달할 글 데이터
- ClipStream·animation에 전달할 장면/대본 원본

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
| `package.json` | `[DEPLOY]` | Vite 기반 실행·빌드와 Gemini SDK 의존성 관리 | 확인됨 | 빌드·버전 호환 점검 |
| `App.tsx` 및 화면 컴포넌트 | `[FRONTEND] [CORE]` | 글 입력·생성·결과 확인 | 검토 예정 | 입력값과 DryWriter 설정 연결 확인 |
| Gemini 호출 서비스 | `[BACKEND] [SECRET]` | 글 생성 모델 호출 | 검토 예정 | 키의 클라이언트 노출 여부 확인 |
| 프롬프트/템플릿 파일 | `[PROMPT] [CORE]` | 건조한 작가 및 장르별 템플릿 | 검토 예정 | R16·정보성 글 템플릿 분리 |
| 내보내기/PDF 영역 | `[INTEGRATION]` | 전자책·하위 앱 전달용 결과 생성 | 검토 예정 | JSON/PDF/마스터 원문 분리 |

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
