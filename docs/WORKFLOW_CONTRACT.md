# DRYWRITE Workflow Contract

## System flow

```text
Google Drive / Google Sheets
  -> Google Apps Script
  -> Gemini processing
  -> normalized Seed data
  -> DRYWRITE deterministic template engine
  -> Vercel presentation UI
```

DRYWRITE is the rendering, template, preview, and future authorized editing frontend. Google Sheets and the backend remain the production source of truth.

## Backend responsibilities

- Read source records from approved Drive and Sheets resources.
- Authorize users and all create, update, delete, import, and publishing operations.
- Run Gemini with secrets held in Apps Script Properties or another approved server-side secret store.
- Validate and normalize Gemini output before returning it to DRYWRITE.
- Generate or refine titles from processed content. The intent preserved from the former browser code is: produce one concise, compelling title without labels, quotes, or extra formatting.
- Generate cover media or a stable `COVER_IMAGE_URL`. The preserved visual intent is: modern editorial/infographic imagery, clean geometry, limited palette, and no embedded words.
- Produce summaries, categories, tags, cover prompts, source references, template selection, lifecycle status, language, and timestamps.
- Define the final Apps Script WebApp URL, HTTP method, authentication mechanism, request envelope, response envelope, errors, pagination, and concurrency rules.

## Frontend responsibilities

- Consume normalized content through `ContentRepository`.
- Transform content deterministically through `templates/articleTemplate` and `templates/contentParser`.
- Render covers, metadata, headings, sections, search, navigation, and platform presentation.
- Use sample/mock normalized data only for Preview and offline fallback.
- Keep Admin components reusable but inaccessible from the public application until backend authorization is implemented.
- Never authenticate Gemini or store Gemini credentials in the browser.

## Normalized data contract

The canonical TypeScript definition is `ContentRecord` in `types.ts`.

| Field | Purpose |
|---|---|
| `contentId` | Stable content identity |
| `title` | Backend-approved display title |
| `rawText` | Processed long-form source for deterministic parsing |
| `summary` | Listing and platform summary |
| `category` | Primary editorial grouping |
| `tags` | Search and downstream classification |
| `coverImageUrl` | Stable cover asset location |
| `coverPrompt` | Backend generation intent and audit trail |
| `sourceId` | Upstream source correlation |
| `templateId` | Deterministic presentation selection |
| `status` | Content lifecycle state |
| `language` | BCP-47-style content language |
| `createdAt` / `updatedAt` | ISO-8601 timestamps |

No real Apps Script function names, Sheet IDs, or WebApp URLs are currently present in this repository. Integration status is therefore `WAITING_BACKEND_CONTRACT`.

## Cache rules

- Server data is authoritative.
- `localStorage` key `drywriter_content_cache_v1` is a disposable UI cache only.
- Cache may support offline/Preview fallback but must never be treated as the production database.
- Sample records live separately in `data/sampleContent.ts` and use `SAMPLE-` identifiers.
- Unsaved drafts and UI preferences must use distinct keys if added later.

## Admin authorization

- Public Preview exposes no Admin entry point.
- Client-side passwords are forbidden.
- Admin writes require server-side identity, authorization, validation, and audit behavior defined by the Apps Script/backend contract.
- Import/export components remain reusable but must only be mounted inside an authorized Admin route.

## Secret handling

- Gemini API keys, OAuth tokens, service account JSON, Sheet IDs that are considered private, and session credentials must not be committed or bundled.
- Browser code must not import `@google/genai`, accept Gemini keys, Base64-encode credentials, or call Gemini directly.
- `.vercel` and `.env*` remain ignored. Only explicitly reviewed public configuration names may be committed.
