# Results

Live observations from running option B (`pnpm change` intents + release PR). One section per check: what was run, raw output, date.

## Repo setting that contradicts the spec (2026-11-12)

- "Allow GitHub Actions to create and approve pull requests" is on (`can_approve_pull_request_reviews: true`), so changesets/action can open the release PR with `GITHUB_TOKEN`.
- It's one switch: turning it on also lets Actions approve PRs. The spec's hardening says "Actions can't approve PRs". The real setup opens the release PR with an Octo STS token instead and leaves this off.

## B on pnpm 11.28.9: dry run (2026-11-11)

Scratch workspace, no CI:

- A react patch intent alone plans both packages at the next patch, through the fixed group.
- Adding a core minor intent plans both at the minor.
- `pnpm version -r` bumps both `package.json` files and writes each package's `CHANGELOG.md`. It deletes the used intents, records them in `.changeset/ledger.yaml`, and leaves `internal` and the lockfile alone.
- A `--bump none` intent is left out of the plan. `pnpm version -r` deletes it and bumps nothing, even when it's the only intent.
- A react-only intent leaves core's `CHANGELOG.md` with an empty `## 0.0.1` heading (checked 2026-11-12).

## B: deviations from the plan (2026-11-12)

- `stage.mjs` is C's with one change: `notes` is a markdown string (both packages' `## X.Y.Z` changelog sections), not a list of PR titles.
- The release PR's main-HEAD guard uses `gh api repos/…/branches/main`, not `git ls-remote`, so it also works on a private repo.

## B: release flow pushed (2026-11-12)

- `6f18c69 ci: add option B release flow`, run 43198072938: all green, `release-stage` skipped.
- changesets/action v2.1.2 ran with no `.changeset/config.json`: `No changesets present or were removed by merging version PR. Not publishing because publish-script is not set.`
- `decide`: `No release: core is still at 0.0.0, so this is not a release commit`.

## B: intent check (2026-11-12)

- PR #1 `feat(core): add shout`, changing `packages/core/index.js` only. `intent-check` (run 43198427516) failed:
  - `Published files changed: packages/core/index.js` / `Intents added: none`
  - `This PR changes a published package but adds no change intent. Run: pnpm change --bump <patch|minor|major|none> --summary "…" <package>`
- Added an intent with `pnpm change --bump minor --summary "Add shout" @luca-gr4vy/release-poc-b`, which wrote `.changeset/smart-glasses-give.md`. Local `pnpm change status` planned both packages `0.0.0 → 0.1.0` (core `minor, via fixed+intent`, react `minor, via dependencies+fixed`).
- `intent-check` (run 43198518297) passed:
  - `Intents added: .changeset/smart-glasses-give.md`
  - `pnpm change check`: `Checked 1 pending change intent: every one resolves to a workspace package.` / `All package versions satisfy the configured versioning invariants.`
- PR #1 stays open for Step 3, where it is the core minor.
