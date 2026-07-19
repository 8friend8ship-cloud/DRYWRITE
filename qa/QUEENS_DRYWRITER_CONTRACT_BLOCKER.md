# Queens-driven DryWriter contract QA — blocked

## Current repository classification

The current repository is a browser-side Vite/React article viewer. It is not the Queens-driven DryWriter writing backend.

Observed evidence:

- `App.tsx` initializes sample articles and persists them to browser `localStorage`.
- `package.json` exposes only Vite `dev`, `build`, and `preview` scripts.
- No versioned writer endpoint, Prompt Snapshot contract, resolver log, chapter checkpoint, retry/finalization state, or backend test harness is present.
- `README.md` instructs use of `GEMINI_API_KEY` through `.env.local`; this must not be treated as proof of a protected server-only Gemini boundary.

## Non-destructive QA result

The required contract cannot be tested from this source tree. The following remain `BLOCKED_SOURCE_MISSING`:

1. Original A/B/C/D/Custom linked preset packages
2. Queens real/staging candidate provenance
3. Automatic reason/confidence resolver reaching Prompt Snapshot
4. Hook enable/disable enforcement
5. Number provenance typing
6. Policy layering above the original engine
7. Server-only Gemini and free-tier controls
8. Chapter/checkpoint/retry/finalization/partial rewrite
9. Versioned schema-valid endpoints and ID matching
10. Front acknowledgement against backend source
11. Menus/triggers/locks/folders/versions/errors/token storage/rollback

## Required staging inputs

To unblock QA, provide within an accessible repository or staging package:

- writer backend source
- redacted configuration schema
- staging base URL and versioned endpoints
- dry-run fixture
- Prompt Snapshot fixture
- resolver evidence fixture
- chapter/checkpoint/finalization fixtures
- endpoint schemas carrying `CORE_ID` and `CONTENT_ID`

## Safety gate

No production deployment, billing enablement, secret exposure, publishing, permission change, merge to `main`, or original deletion is authorized by this QA branch.
