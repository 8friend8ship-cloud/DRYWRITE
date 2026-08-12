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
