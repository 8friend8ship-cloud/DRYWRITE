<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# DRYWRITE frontend

DRYWRITE renders normalized content from the Google Sheets → Apps Script → Gemini backend workflow. The current Preview uses normalized sample data until the backend request/response contract is available.

See [docs/WORKFLOW_CONTRACT.md](docs/WORKFLOW_CONTRACT.md) for ownership, data contract, cache, Admin, and secret rules.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Verify the frontend:
   `npm run verify`

The browser never accepts or stores a Gemini API key. Gemini processing belongs to the authorized Apps Script backend.

## 현행 제품 명칭 · 2026-11-16

- 사용자 표시명: **굳웨이 라이트 (GOODWAY WRITE)** · GOODWHY 브랜드
- 과거 표기: DryWriter / DRYWRITE (기존 코드, API, Vercel 도메인, 경로 및 기록용 호환 별칭)
- 실제 배포 프런트: `drywrite.contents-os.com` / GitHub `8friend8ship-cloud/DRYWRITE`
- 이 저장소는 주로 기존 글 조회/렌더링 프런트이며, 생성 및 검수 승인 데이터는 별도 기존 Writer·Apps Script 계층에서 관리한다.
- 바른관계 5원칙·본섬김·하몬서클을 글쓰기 전에 적용하는 `GLOBAL_WRITE_RIGHT_RELATIONSHIP_GATE_V1_20261116` 서버 실행 연동은 **검증 전 HOLD**. 화면 표시를 바꾸었다고 신규 글 검증/운영 발행을 승인한 것은 아니다.
- 기존 `APP_DRYWRITE`, Writer URL, 콘텐츠 ID, 시트, 복원된 연결, 사용자가 승인한 글은 변경하지 않는다. 신규 물리 트리거/프로젝트/백엔드 노드 없음.
