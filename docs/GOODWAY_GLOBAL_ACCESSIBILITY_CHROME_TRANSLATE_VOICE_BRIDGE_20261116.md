# 굳웨이 라이트 — 본섬김 글로벌 접근성, Chrome 번역 및 경량 음성 JSON/MCP 브릿지

**일자:** 2026-11-16 · **계보:** DUAL_EYE_MULTI_BRAIN_BRIDGE_V1 · **정본 계정:** homedesigntaedi@gmail.com  
**최상위 목적:** GOODWHY_SION_RIGHT_RELATIONSHIP_PURPOSE_V1_20261116 · **앱 식별자:** APP_DRYWRITE 보존  
**범위:** 기존 [DRYWRITE 초안 PR #19](https://github.com/8friend8ship-cloud/DRYWRITE/pull/19)에서 기능·브릿지·검수만 작업. 메인/운영 배포/발행/트리거 변경 없음.  
**현재 판정:** `PASS_CODE_AND_LOCAL_CHROME_LAUNCH_ONLY__HOLD_PRODUCTION_AND_REAL_USER_A11Y_E2E`

## 1. 본섬김 원칙 — 장애와 언어가 글 접근의 이유로 배제되지 않도록

- **시각 장애:** 기본 텍스트를 실제 DOM과 적절한 제목 계층으로 제공. 헤더·본문 건너뛰기 링크, 진입 가능한 탐색/버튼, 명시적 검색 레이블, 상태 aria-live, 음성 듣기·재개·정지·속도 조절, 음성 미지원 대체로 OS 화면낭독기를 지원.
- **손/운동 장애:** 키보드 전용 조작, 메뉴 열기/닫기·Esc·Tab 포커스 이동·복귀, OS Voice Access/스위치 제어 안내. 마이크 없는 기본 이용 가능. Web Speech 음성명령은 **사용자가 명시적으로 허용**할 때만 켜지고 자동 재시작 없음. 일부 Chrome 음성인식은 외부 서버로 오디오를 전송할 수 있으므로 개인정보·마이크 수집에 대해 화면에 고지.
- **저시력:** 다크 모드 대비, 버튼 텍스트, 브라우저 확대/글꼴 크기 기능과 어울리는 반응형 레이아웃. 정식 WCAG 2.2 AA 실사용자/보조공학 감사는 아직 미수행.
- **언어 장벽:** **원본은 한국어 한 번만 승인/발행**하고 브라우저의 **Chrome 기본 페이지 번역** 기능으로 방문자가 자신의 언어로 보게 함. 문서 루트 `<html lang="ko" translate="yes">`와 기사 `lang=source/translated` 적용. 방문자는 Chrome 설정의 자동 번역 언어를 선택할 수 있음; 사이트 JavaScript가 Chrome 내장 번역 메뉴를 억지로 호출하거나 사용자의 언어 선호를 강제로 변경할 수 없음.
- **기기 내 번역(추가 선택):** desktop Chrome 138+에서 제공되는 `Translator.availability/create`가 허용된 지원 언어 쌍만 현재 공공 승인 글을 번역하고, 필요한 언어팩 다운로드는 클릭 시도. Android에는 이 API가 없어 Chrome 페이지 번역을 사용. 지원되지 않는 언어/기기, 모델 다운로드 오류, 권한 거부는 분명한 오류+Chrome 번역 안내로 대체. **모든 언어에 AI/음성이 보장된다는 뜻이 아님.**
- **직접 음성 듣기:** `SpeechSynthesis`의 BCP47 언어·기기 음성 목록 확인. `SpeechSynthesisVoice.localService=true`를 기본으로 사용해 외부 전송 가능성을 줄임. 공개 글에 한해서만 사용자가 별도 동의하면 remoteService 음성을 선택 가능(요금/네트워크 주의). 해당 언어 음성이 없으면 오디오 제공 불가를 분명히 표시하고 Chrome 번역 화면을 OS 스크린리더로 듣도록 안내. Chrome 메뉴 번역은 앱 내부 상태를 바꾸지 않으므로 **앱 TTS가 원문을 읽을 수 있음**을 명확히 고지.

## 2. 실제 반영된 기존 파일과 계약

- `index.html`: 한국어 소스 언어 표시, Google Chrome 자동 페이지 번역에 장애 없는 기본 메타와 브랜드 수정.
- `App.tsx`: 본문 건너뛰기, 기존 기사 public-source/revision/meta를 안전하게 전달, 이전 승인 공개 목록/GET_CONTENT 규칙 그대로 유지.
- `components/HomeView.tsx`: 검색 레이블, 메뉴와 콘텐츠 메인 포커스, 독자용 정확한 브랜드.
- `components/MenuView.tsx`: Esc, Tab 순환, 닫기 포커스 및 복귀. 기존 버튼/탐색 불변.
- `components/ArticleView.tsx`: 기사 제목 단일 H1, 의미 있는 구조, 기사 언어 태그, 브라우저 음성·번역 접근성 위젯 탑재.
- `components/GlobalAccessibilityControls.tsx`: **본섬김 접근성 도우미**: 화면이 보이지 않는 경우, 손 조작이 어려운 경우, 다국어 보기를 원하는 경우 별도 도우미 안내; 한국어 원문, Chrome 메뉴 번역 도움말, 데스크톱 on-device 번역, TTS 음색·속도·일시정지·중지, 동의형 음성명령, 기기 로컬 음성 우선, JSON 내보내기. 자동 마이크·클라우드 API 호출 없음. 음성인식 명령은 한국어 중심/일부 영어 단어만, 세계 모든 언어의 음성명령을 구현한 것은 아님.
- `services/chromeLocalTranslation.ts`: 공개 승인 서버 원문만 제한된 길이·블록 수 안에서 on-device Chrome Translator로 번역. 번역 결과 원격 업로드/배포/저장 없음. 중국어 간체/번체 구분. 확장 BCP47 대상 언어의 실제 지원 여부 확인 뒤 실행.
- `services/globalVoiceContract.mjs`: 보안 메타데이터 `GOODWAY_GLOBAL_VOICE_JSON_MCP_V1_20261116`; `CONTENT_ID + SOURCE_REVISION + SOURCE_LANGUAGE + REQUESTED_LANGUAGE + PROVIDER + VOICE_NAME + STATUS` 참조만 작성. 기사 본문·번역 문장·마이크 음성·PCM/MP3·API 키·토큰·고객/Keep 원문을 저장하거나 전송하지 않음. 서버 측 승인 재검수 필수, JSON은 실제 음성 렌더 결과 영수증이나 공개 승인 아님.
- `scripts/open_goodway_chrome.py`: **기존 노트북 Chrome 일반 창**을 명시적 호출로 열어 주소창의 Chrome 번역 기능을 유지. `--route production|local-preview` 고정 도메인만, 실행성 상태만 `%LOCALAPPDATA%/GOODWAY_WRITE/bridge_logs/chrome_voice_bridge.jsonl` 로컬 기록. 120초 중복 열기 방지. 패키지·유료 모델·새 물리 트리거·자동 마이크 없음.
- `scripts/open-goodway-chrome.ps1`도 코드로 남아 있지만 실제 Windows 실행정책이 차단하여 런타임에서 **사용하지 않음**. 정책 우회 없이 Python으로 대체.
- `tests/global-voice-contract.test.mjs`: 6개 테스트; BCP47·긴 글 분할·미승인 출처 차단·번역하지 않았는데 번역한 척 금지·Gemini Live/시온 무인 호출 차단·JSON 개인정보 보호.

## 3. 기존 팩 재사용 통합 지도 (중복팩 금지)

| 기존 팩/계보 | 연계 기능 | 실제 상태 |
|---|---|---|
| WRITER/DRYWRITE T1/T2 | 원고 하나를 한국어 정본으로 유지, 공개 승인 글만 웹 읽기 | 프론트 코드 PASS, 실제 배포 HOLD |
| 본섬김/바른관계/하몬서클 | 독자의 시각·손·언어 장벽 자체를 GATE0 서비스 문제로 취급하고 QA | WRITER `23_WRITER_QA_RULES`에 draft 정책만 추가 |
| Aside + REA | 개인정보·저작권·원고 권리, 보조기기·읽기 쉬운 문장·편견 검수 | 실무 승인/실접근성 수동 QA HOLD |
| JSON팩 | 원문/음성 바이트 없이 음성 메타 참조·상태만 구조화 | 소스·테스트 PASS |
| MCP팩 | 기존 승인된 서버 연결 수단으로 PUBLIC_CONTENT_ID+locale+provider pointer만 조회·전달 | 실제 MCP 오디오 adapter `NOT_WIRED` |
| Python팩 | Windows 사용자 소유 Chrome 실행, 파일 적재 없이 로컬 JSONL node log | **실행 PASS** |
| 기존 [V-tube VoicePack](https://github.com/8friend8ship-cloud/V-tube/blob/main/services/videoTemplateAutomationService.ts) | `ko/en/ja` 3개 언어 음색·속도·피치·감정 + Style JSON + 기존 `VTubeVideoTemplateBridge_20260826.gs`와 연결 가능 | 기존 계약 확인만, GOODWAY ↔ VTUBE 실제 큐/ACK 미연결 |
| 시온 로컬 TTS/음성팩 | 승인된 시온 음색을 지역별 음소·발음·현지화 QA로 사용 | 음성 권리·모델 언어·로컬 서비스 API 실제 READBACK/동의 필요, **HOLD** |
| Gemini Live/Live Translate | 실시간 상호작용과 추가 언어/오디오 | 무료 여부·RPD/분당 과금·키 안전·서버 ephemeral 토큰·동의 확인 전 **DISABLED** |
| Codex팩/Gemini팩 | 무료 한도 내 글/번역 QA 보조, 정책/테스트 업데이트 | 기존 WRITE PR #2 무료 우선 계약 재사용, 외부 모델 호출 0 |

**주의:** V-tube 기존 `LanguageCode='ko'|'en'|'ja'`이며, 현재 DRYWRITE 음성 UI에 추가로 표시한 언어/임의 BCP47 코드가 V-tube용 다국어 TTS를 자동 생성하거나 실제 그 언어 오디오를 제공한다는 뜻이 아니다. 그 외 언어는 Chrome 번역과 지원되는 브라우저/기기 음성을 통해 접근한다. 향후 V-tube 다국어 확장은 기존 VoicePack 서비스의 adapter v2로 해야 하고 자동으로 기존 모델을 수정·덮어쓰면 안 된다.

## 4. Chrome 브릿지 실제 기기 영수증

2026-11-16 KST, 운영 노트북 BOOK-1HE2THGKRA:
- Chrome **157.0.8103.51**, RAM 31.6 GB, C: 여유 343.2 GB 조사(기기 조건은 모델별 별도).
- 최초 PowerShell 실행 브릿지 `.ps1`: **PowerShell ExecutionPolicy가 UnauthorizedAccess로 차단**; 정책 변경·우회 **하지 않음**.
- Python 3.14.3, 원본 GitHub 스크립트 SHA `5624acc871c0e44039350d69b6cfe4a2257285a9`에 대해 `--dry-run` → `CHROME_READY_DRY_RUN`, 실제 `--route production` → `GOODWAY_CHROME_OPENED_ROUTE=production` EXIT=0.
- 로컬 JSONL READBACK: `contract=GOODWAY_CHROME_VOICE_BRIDGE_V1_20261116`, `node=CHROME_PUBLIC_READER_LAUNCH`, `route=production`, `status=CHROME_OPENED`, `sensitivePayloadSent=False`. 사용자 원고나 키를 로그로 남기지 않음.
- **열린 운영 Chrome 창은 기존 production 코드**이며 새 접근성 PR은 아직 병합되지 않았음. 이것을 새 기능의 운영 반영으로 주장하지 말 것.

## 5. 실제 코드 QA와 범위

- 초기 `npm run verify`의 16개 기존 테스트 + 6개 글로벌 음성 신규 테스트, lint, TS, Vite 빌드 PASS.
- 보안/접근성 강화 후 격리 클론 검사에서 **MenuView TypeScript focus 타입 2건 실패**를 실제 발견해 정확하게 기록·패치.
- 현재 소스 최종 HEAD `eb784b5d6f9f85effaf167b92faab8b4187c2d4a`를 Windows 격리 클론에서 npm ci 218개 패키지 성공 후 `npm run verify` **exit0**, 4 Archive + 5 Keep + 7 Storyboard + 6 Global Voice = **22/22 테스트 PASS**, ESLint PASS, TypeScript PASS, Vite 42 modules build PASS. 소스 원본 8friend8ship-cloud/DRYWRITE 운영 main 변경 없음.
- 테스트는 기능 계약/컴파일/브릿지 경로에 관한 것이며 실제 Chrome Translator 모델 availability, 실제 장치 음성 목록, 음성 인식 보조공학, 국가별 브라우저/OS, Gemini Live, 시온 음색 출력의 사용자 체험 및 WCAG 2.2 AA 심사는 **미실시**.
- 운영 공개 글은 과거 `LIST_CONTENT 0건`이고 실제 승인 아티클의 글로벌 청각/번역 E2E가 불가. 실제 사용자 서비스 승격은 불허.

## 6. 전 세계 공개 앱에서 Chrome 번역 쓰는 방법

**PC Chrome:** 한글 굳웨이 글 URL 열기 → 주소창 번역 아이콘 또는 ⋮ → 번역 → 언어 선택. 설정 → 언어 → Google 번역 → 자동 번역할 언어에서 한국어를 지정. **Android Chrome:** ⋮ → 번역 또는 번역 알림 → 언어 선택, 설정 → 언어 → 자동 번역 설정.

- 사이트에서 자동 번역을 강제하지 않는다. 방문자 Chrome 환경이 사용자 선택 언어대로 페이지를 처리하도록 의미 있는 Korean lang/본문과 렌더링 가능한 일반 텍스트를 제공.
- 기기 내 번역 버튼은 별도 추가 기능. desktop Chrome Translator API는 Android에서 사용할 수 없음; 복잡한 입력·지원되지 않는 언어는 native Chrome 번역으로 복귀.
- 음성 읽기는 사용자의 선택된 기기 언어에 맞는 음성 서비스가 있어야 함. Chrome native page translation 시 앱 내부 speechSynthesis 텍스트는 **원문일 수 있으므로** 번역된 음성 보장 금지; OS 화면낭독기는 화면 번역과 독립된 조작 흐름으로 이용.

**공식 참고:**
- Chrome 공식 번역: https://support.google.com/chrome/answer/173424?hl=ko
- Chrome on-device Translator 문서: https://developer.chrome.google.cn/docs/modern-web-guidance/guides/built-in-ai/translator?hl=ko
- Web Speech 음성 localService: https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisVoice/localService
- Web Speech recognition 서버 처리 가능성: https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
- Gemini Live ephemeral token: https://ai.google.dev/gemini-api/docs/live-api/ephemeral-tokens
- Gemini Live 최신 가격: https://ai.google.dev/gemini-api/docs/pricing
- WCAG: https://www.w3.org/TR/WCAG22/

## 7. 데이터 보호, 발행·음성 승인 게이트

`PUBLISHED_PUBLIC_CONTENT_ID` (server ACTIVE+APPROVED+PUBLIC_YN=Y) → `LANGUAGE/TRANSLATION_AVAILABILITY` (no cross-language fabrication) → `LOCAL_VOICE_AVAILABLE` / `USER_CONSENT_REMOTE_VOICE` → `WEB_TTS_PREVIEW` → `JSON_METADATA_ONLY` → **HOLD_MCP_BACKEND_ATTACH** until true provider proof.

Only exact source revision + model rights/license and audience language QA with creator approval can authorize persistent audio file work. For Gemini Live, allocate a verified budget and server-issued short-lived token only when user consents; do not insert long-lived credentials into JavaScript. Do not send raw Keep, family, customer, invoices, secrets, camera/mic to a voice model.

The existing **GOODWHY right-relationship five principles** and **BON GATE0+8** apply to accessibility, not merely to sentiment of the article: the user should be able to obtain the benefit without eyesight, manual dexterity, or Korean literacy whenever their browser/device supports a path.

## 8. LAST_GOOD / FIRST_UNFINISHED

**LAST_GOOD:** DRYWRITE PR #19 code staged + global voice JSON metadata contract + Chrome Python local launch/log actual PASS + 22 tests/lint/typecheck/build PASS + source-only central A11Y QA and 61 function contract notes.

**FIRST_UNFINISHED:** exact Chrome-authenticated Preview UI/keyboard/screenreader test → Android Chrome translate/Voice Access test → actual public approved sample (never unapproved internal) on both native Chrome translate and local Translator → Sion local voice service rights/runtime readback → verified Gemini Live free-tier/ephemeral token only if separately authorized → existing VTube VoicePack backend metadata bridge with two real provider ACKs → creator signed voice locale/quality approval → production PR merge/deploy with rollback. 

**HOLD:** No production merge, no unapproved public article, no microphone auto-start, no server audio upload, no paid model calls, no new physical trigger, no new pack/node.
