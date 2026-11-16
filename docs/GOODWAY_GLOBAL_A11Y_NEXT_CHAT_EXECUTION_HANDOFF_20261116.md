# 굳웨이 라이트 × 본섬김 글로벌 접근성 — 다음 창 실제 실행 인계문

**작성 기준일:** 2026-11-16 (KST)  
**연속 계보:** `DUAL_EYE_MULTI_BRAIN_BRIDGE_V1`  
**창조자 상위 목적:** `GOODWHY_SION_RIGHT_RELATIONSHIP_PURPOSE_V1_20261116` — 바른관계 5원칙, 본섬김 GATE0+8, 하몬서클 6, R1/R2/R3  
**기준 계정:** `homedesigntaedi@gmail.com`  
**노트북:** `BOOK-1HE2THGKRA` (Chrome 사용, Edge 금지)  
**현행 사용자 브랜드:** `굳웨이 라이트 / GOODWAY WRITE`; 기존 `APP_WRITE`, `APP_DRYWRITE`, `DryWriter` 소스 식별자/원본 계보는 변경하지 않음  
**작업 원칙:** LAST_GOOD → FIRST_UNFINISHED; 기존 PROJECT/PACK/NODE/Trigger 중복 생성 금지, 원본/고객 자료/실 운영 master/main 보존, 기본 무료 모델·외부 API 0회

## 1. 이 문서를 읽고 다음 창에서 곧바로 재개할 근거

- **기존 전용 GitHub:** `8friend8ship-cloud/DRYWRITE`  
- **개발 브랜치:** `fix/goodway-write-archive-pagination-20261116`  
- **초안 PR:** https://github.com/8friend8ship-cloud/DRYWRITE/pull/19 — **DRAFT / NOT MERGED**
- **소스 검증 커밋:** `eb784b5d6f9f85effaf167b92faab8b4187c2d4a`; Windows 격리 clone에서 실제 `npm run verify` exit 0.
- **문서 정리 후 PR HEAD:** `482f6bd56765a3120ac9023a048515005742b406` (코드 검증 이후 문서 파일 추가; 최신 HEAD에 2026-11-16 Vercel Preview READY가 존재함). 필요하면 최신 HEAD를 별도 깨끗한 clone으로 재확인.
- **Preview 배포:** `https://drywrite-preview-repair-baseline-hyrnuc2sa.vercel.app` — READY 상태는 빌드 상태이며 Chrome 실제 이용/접근성 PASS 증거가 아니다. 이전 Preview HTTP 접근 시 Vercel `Login · Vercel` 인증 화면; **권한 있는 Chrome 로그인으로 테스트**, 인증 우회나 배포 보호 해제 금지.
- **기존 Production:** https://drywrite.contents-os.com — 사용자에게 정상 공개된 `ACTIVE + APPROVED + PUBLIC_YN=Y` 글만 조회하는 기존 서버 계약 보호. 이전 운영 API `LIST_CONTENT` 0건, 미승인/없는 내용의 GET_CONTENT `NOT_FOUND` 실측. 즉 실제 승인된 기사에 대한 다국어·음성 E2E는 아직 통과한 적 없음.

### 원본과 보고서 링크

1. [글로벌 접근성·Chrome 번역·음성 JSON/MCP 상세 보고](https://github.com/8friend8ship-cloud/DRYWRITE/blob/fix/goodway-write-archive-pagination-20261116/docs/GOODWAY_GLOBAL_ACCESSIBILITY_CHROME_TRANSLATE_VOICE_BRIDGE_20261116.md)
2. [건조한 작가 T1 → 굳웨이 T2 스토리보드·시트 함수계약 브리프](https://github.com/8friend8ship-cloud/DRYWRITE/blob/fix/goodway-write-archive-pagination-20261116/docs/GOODWAY_DRYWRITER_T1_T2_STORYBOARD_SHEETS_LOOP_BRIEF_20261116.md)
3. [WRITE Codex·Gemini 무료 한도/바른관계 목적 QA](https://github.com/8friend8ship-cloud/WRITE/blob/codex/r16-json-storage-repair-v1/docs/GOODWAY_WRITE_CODEX_GEMINI_FREE_QUOTA_PURPOSE_QA_20261116.md); 관련 WRITE [DRAFT PR #2](https://github.com/8friend8ship-cloud/WRITE/pull/2).
4. [Google Keep 개인정보 로컬 검수](https://github.com/8friend8ship-cloud/DRYWRITE/blob/fix/goodway-write-archive-pagination-20261116/docs/GOODWAY_WRITE_KEEP_PRIVATE_REVIEW_20261116.md) — 원본 실제 Takeout 없음, 미수집·미발행.
5. [중앙 운영헌장 정본](https://docs.google.com/document/d/1N6B96SpMM7l990EbzR9Md5RmHdC5wGSRxu3ClxnKZog/edit)
6. [건조한 작가 기존 지식 아카이브/전자책](https://docs.google.com/document/d/11PuHgK4uCO1L3BzEntn4O48ktMwLlnSRD5SNLNBLCzk/edit)
7. [고객용 AI 앱개발 전자책 작업복사본](https://docs.google.com/document/d/1G3lpvsGrpRJemIy66L6CxBWbm1RmeuMF07eU1v0wXPA/edit)
8. [WRITER 원장](https://docs.google.com/spreadsheets/d/1SI-MQC7drEsxug5_mveiH7iXE2Yw1PzYRQlES8Az7nk/edit) 및 [61_BACKEND_FUNCTION_CONTRACT](https://docs.google.com/spreadsheets/d/1M1rF2IeSDgwpvWuDZC6fSmLFwYpceQCtPBMs_XZJ7xo/edit)

## 2. 실제 완료·저장된 소스별 역할

`App.tsx`: 공개 글/Source Revision 및 본문 건너뛰기를 전달, 기존 브라우저 front page token 계약 유지.  
`index.html`: `html lang=ko translate=yes`, 현행 브랜드 표시; 원본 한글 1회 발행을 Chrome 사용자의 브라우저 번역으로 보여주는 구조. 사이트가 Chrome 번역 UI를 JS로 강제 클릭하지 않는다.  
`components/HomeView.tsx`: 정확한 본섬김 브랜드·검색 레이블·main 타깃.  
`components/MenuView.tsx`: Esc/Tab 키보드 및 dialog focus 순환·복귀. TS 포커스 타입 초기 2건 FAIL 후 scoped 수정.  
`components/ArticleView.tsx`: H1 1개·H2 챕터, lang 태그, 접근성 위젯.  
`components/GlobalAccessibilityControls.tsx`: 본섬김 도우미(시각·손·언어), 원문 보기, Chrome 페이지 번역 안내, 동의형 Chrome 데스크톱 on-device 번역, 기기 localService TTS/속도/일시정지/재개/정지, OS Voice Access 지원 안내, 명시적 선택 마이크 명령, 개인정보 없는 JSON 내보내기. 자동 마이크 ON 금지. 외부 처리가 가능한 음성은 공개 승인 글의 명시적 동의 필요.  
`services/chromeLocalTranslation.ts`: Chrome Translator API 제공 여부·언어쌍 확인, 길이 제한, 공개 승인 서버 글에 한함. Android Chrome은 브라우저 기본 페이지 번역으로 대체.  
`services/globalVoiceContract.mjs`: `GOODWAY_GLOBAL_VOICE_JSON_MCP_V1_20261116`, 공개 CONTENT_ID/revision/BCP47/voice/status 등 **메타데이터만**, 원고·번역 본문·PCM·마이크 전사·API Key/Token 저장 금지. SION_LOCAL_VOICE, GEMINI_LIVE는 미승인 상태로 차단; `mcpAdapterStatus=NOT_WIRED`.  
`scripts/open_goodway_chrome.py`: Chrome 일반 창으로 고정 운영/로컬 Preview URL 열기, OS Chrome의 번역 메뉴를 그대로 노출. 유저 명시 호출, 120초 중복 방지, 로컬 `%LOCALAPPDATA%/GOODWAY_WRITE/bridge_logs/chrome_voice_bridge.jsonl`에 route/node/status/time만 기록. 새 트리거·비용·수집 없음.  
`scripts/open-goodway-chrome.ps1`: 원본 Windows 보안 정책상 ExecutionPolicy로 실행 실패, **우회하지 않고 사용 중단**. Python을 정식 로컬 경로로 사용.  
`tests/global-voice-contract.test.mjs`: 6개 신규 글로벌 언어/음성/비공개 계약 테스트.

### 실제 검증 (소스 커밋 `eb784b5d6f9f`)

소유 노트북 임시 별도 clean clone에서 `npm ci --no-audit --no-fund` 218 packages Exit0. `npm run verify` Exit0:
- Archive/API 4/4 PASS
- Keep privacy 5/5 PASS
- 굳웨이 T2 storyboard 7/7 PASS
- Global Voice locale/JSON 6/6 PASS
- **합계 22/22 PASS**
- ESLint PASS, `tsc --noEmit` PASS, Vite 42 modules build PASS.
- 주의: 이는 **정적/로컬 테스트 + 빌드 성공**, 실제 장애인 사용자/국가별 Chrome 음성/안드로이드 실기기·WCAG 완전 준수/서버 원격음성 출력/Production PASS가 아님.

### 실제 Chrome 브릿지 영수증

BOOK-1HE2THGKRA: Chrome `157.0.8103.51`, Python `3.14.3`. `scripts/open_goodway_chrome.py --route production --dry-run` PASS. 실제 `--route production` 호출 Exit0, Chrome 새 일반 창 열림, 로컬 JSONL READBACK `contract=GOODWAY_CHROME_VOICE_BRIDGE_V1_20261116`, `node=CHROME_PUBLIC_READER_LAUNCH`, `status=CHROME_OPENED`, `sensitivePayloadSent=False`. 이는 **기존 운영 웹사이트를 연 것**이며 신규 프런트 배포를 의미하지 않는다.

## 3. 원본 팩/함수계약 연결 현황

- 기존 Writer `23_WRITER_QA_RULES!A18:H18`: `GWQ-A11Y-20261116` 새 1행, `DRAFT_SPEC_ONLY_RUNTIME_HOLD`. 접근성은 본섬김의 기본 문제. 시각/손/언어·스크린리더·키보드·번역·TTS 대체 검수 요구.
- 기존 `61_BACKEND_FUNCTION_CONTRACT!V35,V36,V44`: 원래 `FACTORY_DRYWRITE_20260823`, `FACTORY_WRITE_20260823`, `FACTORY_VTUBE_20260823` NEXT_ACTION에 `[GOODWAY_A11Y_GLOBAL_VOICE_V1_20261116]` 참고 메모만 추가. 실제 Script 함수·물리 스케줄/권한/운영 STATUS **변경 없음**.
- [V-tube VoicePack](https://github.com/8friend8ship-cloud/V-tube/blob/main/services/videoTemplateAutomationService.ts): 현재 KO/EN/JA 기존 3개 LanguageCode만 정본으로 확인. 다른 언어는 Chrome 번역·브라우저/OS 음성 경로, 기존 VTube VoicePack 음성합성 지원을 사실과 달리 주장하지 말 것.
- 시온 로컬 CosyVoice/Qwen/Sion TTS: 기존 권리·참조 음색·로컬 서비스·모델 다국어 품질 검증 전 **HOLD**, 보호된 원본 음색/얼굴/보이스를 변경하지 않는다.
- Gemini Live: 현 무료 프로젝트/모델별 음성 쿼터·권리/데이터 사용·서버 단기 토큰·명시적 사용자 마이크 동의 없으면 **HOLD**. 클라이언트 비밀키 금지. Codex는 계정 포함 실제 한도 확인 전 무료 자동 호출 금지.
- JSON/MCP팩: 지금은 **schema/meta stage**, V-tube 영상 백엔드/서버 오디오 렌더링/MCP 호출은 실연결·두 건 독립 Provider ACK 없어서 **NOT_WIRED**.

## 4. 다음 채팅의 실행 우선순위 (P0 → P3)

### P0 — 절대 READBACK / 재검증
1. 연결 계정 `homedesigntaedi@gmail.com` 맞는지 확인. PR #19 HEAD 및 Vercel Preview/Production SHA·배포 보호 구분, 원본 노트북 워킹트리 dirty_count 확인. 어떤 자동화/팩/노드를 새로 만들지 않는다.
2. 소유자 허가된 Chrome으로 Vercel 인증된 Preview URL에 접근. 브라우저 GUI + React hydration + 메뉴 Tab/Esc/focus restore/검색 레이블/본문 skip/H1/aria-live/320~390px overflow/Zoom 200%/reduced-motion 확인. SSO 없는 HTTP Login 200은 PASS가 아니다.
3. Preview에서 실기사 데이터가 없으면 **가상의 오프라인 fixture**로만 UI 시험. 48_FRONT_ANSWER_PACKAGE 미승인 글을 공개로 전환하여 시험하지 않는다. 공개 LIST 0건은 있는 그대로 보고.

### P1 — 글로벌 언어·음성 실기기 QA
4. Windows Chrome (허용 모델) `Translator.availability`로 `ko→en/ja/es/zh-Hans/zh-Hant` 검증, 모델 다운로드/정책 동의, 성능/음색 실제 제공 여부 기록. 지원 없음은 Fallback, 무료/유료 API 자동 전환 금지.
5. Android Chrome `⋮ → 번역` 및 OS Voice Access/TalkBack, Windows NVDA/키보드 테스트. '읽어주기' TTS가 **Chrome 번역 결과**를 항상 읽지 않는 사실을 사용자에게 고지. 각 언어는 BCP47 태그·기기 음성 제공 여부와 인식명령 언어를 별도 기록.
6. A11Y WCAG 2.2 AA 실제 결과 표: `KEYBOARD_ONLY, FOCUS_VISIBLE, SCREEN_READER, ALT_TEXT, H1_HIERARCHY, STATUS_ANNOUNCEMENT, CHROME_TRANSLATE, TTS_DEVICE, MIC_CONSENT, REDUCED_MOTION, MOBILE_320`. 보조기기 테스트 미실시 항목은 UNKNOWN/HOLD, PASS 위조 금지.

### P2 — 시온/VTUBE/MCP 오디오 연계 연구
7. 기존 V-tube의 정확한 브랜치/Script/VoicePack 기능계약/Provider 권리·SHA READBACK. 현재 JSON metadata-only request를 기존 MCP adapter와 매핑하되 새 pack/trigger/유료 API 생성하지 않는다.
8. PUBLIC_CONTENT_ID, 언어, REVISION, 승인음색/권리/사용자 동의, 예상 무료 비용/시간/토큰, PCM/MP3 아티팩트 민감정보, 오디오 서버 노출 범위를 독립 R1/R2/R3 검수. 최소 허가된 1건의 백엔드 x2 receipt 없으면 `VOICE_RENDER_HOLD`.
9. Gemini Live는 별도 승인된 무료 단기 토큰·프로젝트 quota·고객 음성 외부 처리 동의가 있기 전 호출하지 않는다. 시온 원본 음성·보이스 학습 데이터 복사/공개 금지.

### P3 — 최종 승인/기록
10. 정확한 글 원문/번역/음성·국가별 표시/권리/소요비용·장애 접근성 실제 수혜를 독립 검수하고 창조자의 글별 최종 승인을 받아야만 배포·발행 검토.
11. 기존 중앙헌장, 건조한 작가 아카이브, 앱개발 전자책 작업복사본, 61 계약, GitHub 문서에 **해당 단계에서 실제 발생한 영수증만** append + READBACK. 불변 원본 교체·운영 main force push/merge, 승인되지 않은 글·KEEP·고객 자료 게시 금지.

## 5. 다음 창에 그대로 전달할 인계 명령 (프롬프트)

> 기존 `DUAL_EYE_MULTI_BRAIN_BRIDGE_V1` 계보, 계정 `homedesigntaedi@gmail.com`, 노트북 `BOOK-1HE2THGKRA`, 기존 DRYWRITE DRAFT PR #19와 GOODWAY_GLOBAL_VOICE_JSON_MCP_V1_20261116을 유지해. 먼저 이 GitHub 인계문과 중앙헌장·건조한 작가 아카이브 전자책·앱개발 전자책·WRITER 23 QA와 61 함수계약을 실제 READBACK해. LAST_GOOD=기능 소스 `eb784b5d6f9f` 22/22·lint/tsc/build PASS + Python Chrome 열림/JSONL 실행영수증 PASS + 접근성 시트 계약 메모 READBACK. FIRST_UNFINISHED=권한 있는 Chrome에서 Vercel Preview 접근성 UI/화면낭독기·키보드·언어별 번역 실제 테스트 → Android Chrome/TalkBack·Voice Access → 기존 Vtube/시온 음성팩·JSON/MCP 실제 승인된 연결 x2. 새 PACK/PROJECT/NODE/Trigger·유료 AI·계정 키 외부 전송·자동발행/운영 배포 금지. 모든 단계에서 실행 영수증/출처·권리·바른관계5/본섬김8/하몬서클 R1/R2/R3를 구분하고, 통과한 범위만 중앙기록/전자책에 append+READBACK해.

**FINAL:** `PASS_SOURCE_22_TESTS_AND_CHROME_LAUNCH_LOG__HOLD_BROWSER_USER_E2E_VOICE_PROVIDERS_AND_PRODUCTION`
