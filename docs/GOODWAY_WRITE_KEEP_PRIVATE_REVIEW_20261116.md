# 굳웨이 라이트 · Google Keep 메모의 비공개 변환 및 발행검토 계약 (2026-11-16)

**Central lineage:** DUAL_EYE_MULTI_BRAIN_BRIDGE_V1  
**Purpose:** GOODWHY_SION_RIGHT_RELATIONSHIP_PURPOSE_V1_20261116  
**Display:** 굳웨이 라이트 / GOODWAY WRITE (keep APP_WRITE, APP_DRYWRITE and legacy IDs unchanged)  
**Owner account:** homedesigntaedi@gmail.com  
**State:** LOCAL_REVIEW_CODE_READY · NOT_CONNECTED_TO_KEEP · NEVER_PUBLISH_AUTOMATICALLY

## 1. Objective
Use the owner's Google Keep ideas, personal writing and experience as **potential sources** for original GOODWAY WRITE articles. Keep is a **private source archive**, not a publicly readable feed. Rewriting and publication are separate, individually approved acts. No new project, pack, node, credential, scheduled trigger or paid model API has been added.

## 2. What is implemented
- **Existing feature-only code branch:** `fix/goodway-write-archive-pagination-20261116` in the **existing** `DRYWRITE` repo; DRAFT [PR #19](https://github.com/8friend8ship-cloud/DRYWRITE/pull/19); `main` untouched.
- `scripts/keep-review-gate.mjs`: local-only converter for extracted Google Takeout **Keep JSON**; no network calls, no OAuth, no Google Keep API, no Drive, no publication and no console output of note contents. It writes only to an **explicit private output directory outside the repository and Keep export source** with restricted folder/file permissions.
- Treat every ordinary note as `HOLD_CREATOR_REVIEW`, `publicYn=N`, `approvalStatus=NOT_REQUESTED`, not approved. `revisionHash` marks changes while `contentId` is source-identical when stable `note.id` or Takeout filename is available.
- If a note includes credential patterns, token/API keys, emails/phone numbers, personal IDs, private address, bank/card details, internal system URLs, collaborator info, attachments, trash/archive status, or unsupported/empty format: **`HOLD_SENSITIVE_NO_DRAFT`**, no title or raw text in the generated review manifest, no article draft.
- Only candidate drafts without detected flags remain **locally** available for the creator's thorough editorial/privacy/rights review; the manifest never writes source text. **Regex detection is not comprehensive; clean-looking text is never auto-cleared.**
- Unit tests are in `tests/keep-review-gate.test.mjs`, and `npm run verify` runs archive and Keep tests plus lint/typecheck/build when executed on a full checkout. The 2026-11-16 local Node test exercise used the exact fetched Git blob SHA of these source/test files and the existing archive proxy/tests: **9/9** passed. This does *not* prove real Keep ingestion, complete build, or production E2E.

## 3. Source availability
- No Google Keep connector action is available in the current connected tools; Google Drive searched for file names containing Keep and found **no actual Keep export**.
- Google Keep API is documented for enterprise administrators. Do not enable broader Keep API/OAuth/domain-wide delegation to solve a personal note migration.
- Official Google Keep Help: https://support.google.com/keep/answer/10017039?hl=ko . Local Takeout archive includes note content, lists, attachments, colors and collaborators; **export itself is private and should not be added to GitHub/Cloud/Chat**.

## 4. Explicit local execution, only after owner exports Keep
1. From the owner's authorized account open `https://takeout.google.com/`, choose **only Google Keep**, download the archive directly to the owner's local computer, extract it in a private directory. Confirm ownership; do not upload the original ZIP.
2. From the existing DRYWRITE checkout containing this **unmerged** code, run (adjust the paths for the machine):
   ```sh
   node scripts/keep-review-gate.mjs --input-dir "/path/to/Takeout/Keep" --output-dir "/path/outside-repo/GOODWAY_Keep_Private_Review"
   ```
3. The command prints **counts only**; `manifest.json` contains no sensitive titles or bodies; allowed-looking notes become `KEEP_*.review.json` files with `HOLD_CREATOR_REVIEW`; flagged notes generate only a reason code.
4. Keep outputs **outside GitHub, Google Drive sync, public web folders and automatic backup/sharing locations**. Do not email or share the original export or filtered drafts with any external service; no raw Keep content belongs in public READ APIs.
5. Before moving any particular note into the central writing system, independently review identity/rights/third-party privacy, redact or rewrite the note *locally*, and confirm that removed information cannot be reconstructed from context, embedded metadata, alt text, attachments, screenshots or links.

## 5. Mandatory publication stages (all default HOLD)
`KEEP_ORIGINAL_PRIVATE` → `LOCAL_DETECT_AND_QUARANTINE` → `CREATOR_PRIVACY_REVIEW` → `ORIGINAL_GOODWAY_ARTICLE_DRAFT` → `R1_SOURCE_RIGHTS_TECH` → `R2_BON_SEOMGIM_8` → `R3_HARMONY_CIRCLE_6` → `RIGHT_RELATIONSHIP_5` → `EXACT_CONTENT_HUMAN_APPROVAL` → `PROVIDER_ACK_AND_PUBLIC_URL_READBACK`.

Every stage must have a real reviewer/evidence receipt. **No automatic promotion** from Keep Takeout to `48_FRONT_ANSWER_PACKAGE` `ACTIVE/APPROVED/PUBLIC_YN=Y`. Keep credentials, API settings, tokens, family/customer records and private metadata permanently out of the public pipeline. Source-note counts and filtered findings must not be advertised as original authored/public articles.

## 6. Related audits and outstanding work
- [WRITE 1st/2nd readback inventory](https://github.com/8friend8ship-cloud/WRITE/blob/fix/write-style-bound-adapter-20260905/docs/GOODWAY_WRITE_ALL_ARTICLES_READONLY_AUDIT_20261116.md): 36 APP_DRYWRITE candidates; 0 publicly eligible; 3 duplicate-title pairs; 2 blank titles; external provider-owned article inventory still unknown.
- On 2026-11-16, a **read-only rule-based scan** of selected author-text fields in 36 writer candidates and 18 output drafts found **0 recognized secret/contact/person patterns**. This is not a privacy certification: files and unscanned metadata, external resources, accidental partial disclosure and context-based identifiability still require personal review.
- DO NOT merge PR #19 to production until full `npm run verify` (including lint/typecheck/build), permission-safe Preview browser QA, no-secret disclosure tests, source owner review and explicit approval.
- No Keep notes were available in this session; **real source-to-article conversion count is 0, public posts 0**. FIRST_UNFINISHED is obtaining an authorized local export and running private review plus independently verifying its receipts.
