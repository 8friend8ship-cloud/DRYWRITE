# DRYWRITE Canonical Integration 2026-08-27

Status: PREVIEW_REBUILD_REQUIRED

## PRE_CHECK
- Production LAST_GOOD: main / 53c6ad307e1706366c499624febbcca3748c66b9
- Vercel project: drywrite-preview-repair-baseline
- Deployment source: 8friend8ship-cloud/DRYWRITE main
- Central rule: preserve LAST_GOOD, compare legacy/current branches, apply minimum delta, verify Preview/runtime before Production.

## Case lookup
- Central history contains no prior exact DRYWRITE merge-conflict solution for this branch set.
- Reuse generic guardrails: no blind merge, no force-overwrite, preserve latest production fixes, diagnose file-level conflicts first.

## Current integration inputs
- codex/drywriter-central-agent-gate-20260821: DryWriter gate, Apps Script client, content repository/cache, MVP pipeline, template/persona contracts, tests.
- factory/front-reverse-control-20260823: 10m backdata factory adapter + reverse requirement policy.
- feat/local-language-bot-bridge-20260821: local language bot bridge.
- main: latest Vite entry repair + AdSense production fixes.

## Failure and resolution
- PR #11 mergeable=false: DIVERGED_BRANCH_FILE_CONFLICT.
- Rebuilt from current main as integration/canonical-clean-20260827.
- Overlay limited to canonical DryWriter engine/services/templates, backdata factory, and language bridge.
- index.tsx preserves installAdSense() and adds FrontLanguageBotBridge.
- PR #12 direct ancestry check: ahead_by=6, behind_by=0; mergeable=true after GitHub recomputation.
- Vercel Preview still referenced the clean branch's first commit d4b503a instead of latest functional HEAD 14aa21d. This checkpoint commit intentionally retriggers the branch Preview so the actual integration HEAD is built and verified.

## Prevention rules
- Never infer a GitHub PR conflict solely from the immediate create-PR mergeable field; re-read PR metadata and verify commit ancestry.
- Never accept an earlier READY Preview as proof for a newer branch HEAD; require deployment githubCommitSha == tested branch HEAD.
- Preserve current Production LAST_GOOD until Preview build + runtime/readback + regression checks pass.

## Completion gate
CASE_LOOKUP_DONE=true; MERGE_CONFLICT_RESOLVED=true; WORKFLOW_RUN_PASS=pending; RESULT_READBACK_PASS=pending; SAME_FIXTURE_RETEST_PASS=pending; REGRESSION_CHECK_PASS=pending; LESSON_CHECKED=pending.
