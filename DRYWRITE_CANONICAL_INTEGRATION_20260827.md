# DRYWRITE Canonical Integration 2026-08-27

Status: WAITING_VERCEL_GIT_INTEGRATION_RECOVERY

## PRE_CHECK
- Production LAST_GOOD: main / 53c6ad307e1706366c499624febbcca3748c66b9
- Vercel project: drywrite-preview-repair-baseline / prj_FAx5QjSY9xEws50VCfXmOrb6hBRU
- Vercel team: team_TujTxCfsmFUlUS7lfY1DFLMN
- Central rule: preserve LAST_GOOD, compare legacy/current branches, apply minimum delta, verify Preview/runtime before Production.

## Case lookup and guidance
- Central history had no exact DRYWRITE branch-conflict solution, so generic LAST_GOOD/minimum-delta/no-blind-retry guards were applied.
- User continuation rule: central guidance and RESUME_POINT are checked first, then the next safe task executes immediately; detailed explanation/error/root-cause/retest is written to Drive rather than chat.

## Integration result
- PR #11 mergeable=false was replaced by clean branch integration/canonical-clean-20260827 from Production LAST_GOOD.
- DryWriter engine/services/templates, backdata factory adapter and language bridge were overlaid while preserving current Vite/AdSense startup.
- PR #12 is mergeable=true.
- Current candidate HEAD before this note: 373484130d2ffbf2fa40ad6a90e28641a9fe87db.
- GitHub Actions canonical verify: Checkout PASS, Setup Node PASS, Install PASS, Build PASS on both branch push and PR merge ref.

## Vercel diagnosis
- First clean commit d4b503a0359a6b1b2077277e6c768e3537e67e6e produced a Vercel Preview and a `Vercel Preview Comments` GitHub check.
- Later candidate commits produced GitHub Actions checks only; the Vercel GitHub App created no check run for a882da1 or later HEADs.
- Vercel deployment list after deployment dpl_694p2nYq3sJNTRs2LzTjud8uHcKJ contains no later deployment. Therefore this is not a Vite/build failure; it is a GitHub→Vercel deployment-trigger/integration path failure.
- Repository has no vercel.json at the candidate root, so no repository-level `git.deploymentEnabled=false` configuration was found.
- A separate Preview recovery workflow attempted the alternate authenticated CLI route against the known canonical project IDs. It stopped at the explicit credential gate because GitHub Actions secret `VERCEL_TOKEN` is not configured. No deployment or Production change occurred.
- The recovery workflow was disabled after the diagnostic run. Direct deletion was blocked by the tool security gate, so it was converted to manual-only disabled audit form instead of retrying or bypassing deletion safeguards.
- Local agent-browser fallback was unavailable (`agent-browser: command not found`), so Vercel Dashboard repair cannot be performed through that local path in this runtime.

## Prevention rules
- Do not repeat branch/no-op/PR creation as a deployment retrigger after Vercel App checks disappear from later commits.
- Compare check-runs: presence of Vercel App on LAST_WORKING commit and absence on current candidate is evidence of Git integration delivery failure.
- Do not create token-based CI deployment unless an existing approved VERCEL_TOKEN/deploy hook is present; never request or expose token values in logs.
- Never treat GitHub build PASS as Runtime VERIFIED; require Vercel deployment githubCommitSha == candidate HEAD and live readback.
- Preserve Production main until Preview/runtime/readback/regression gates pass.

## Completion gate
CASE_LOOKUP_DONE=true; GUIDANCE_APPLIED=true; MERGE_CONFLICT_RESOLVED=true; WORKFLOW_RUN_PASS=true; SAME_FIXTURE_BUILD_RETEST_PASS=true; VERCEL_GIT_TRIGGER_PASS=false; LATEST_PREVIEW_SHA_MATCH=false; RESULT_READBACK_PASS=false; REGRESSION_CHECK_PASS=pending; LESSON_CHECKED=true; PRODUCTION_PROMOTION_ALLOWED=false.

## Resume point
Repair/re-authorize the DRYWRITE project's GitHub↔Vercel deployment integration or provide an already-approved Vercel deploy credential/hook through the secure project settings. After that, deploy the current candidate Preview, require metadata SHA equality, run live browser/runtime/readback regression, then request Production/main approval only if every gate passes.
