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

## B: release PR from two merges (2026-11-12)

- Merged #2 `fix(react): export isReact flag` (react patch intent `silver-sides-tell`) at 10:16:58Z, `7b25679`. Run 43198973552, `release-pr`:
  - `git checkout changeset-release/main` → `error: pathspec … did not match`, then `git checkout -b changeset-release/main`, `git reset --hard 7b25679…`
  - `pnpm version -r` → `@luca-gr4vy/release-poc-b: 0.0.0 → 0.0.1`, `@luca-gr4vy/release-poc-b-react: 0.0.0 → 0.0.1`
  - `Creating pull request` → #3 `chore: release` at `0.0.1`.
- Merged #1 `feat(core): add shout` (core minor intent `smart-glasses-give`) at 10:18:05Z, `9e19055`. Run 43199136312, `release-pr`: the same branch steps, then `0.0.0 → 0.1.0` for both, and `Updating found pull request #3`.
- `decide` in both runs: `No release: core is still at 0.0.0, so this is not a release commit`.
- #3 now (head `010f09a`) changes:
  - `.changeset/ledger.yaml` +8 (both intents, listed under `…@0.1.0`)
  - `.changeset/silver-sides-tell.md` and `.changeset/smart-glasses-give.md` deleted
  - `packages/core/CHANGELOG.md` (new: `## 0.1.0` / `### Minor Changes` / `- Add shout`)
  - `packages/react/CHANGELOG.md` (new: `## 0.1.0` / `### Patch Changes` / `- Export isReact flag` / `- Updated dependencies:` / `  - @luca-gr4vy/release-poc-b@0.1.0`)
  - both `package.json` → `0.1.0`
- React's section says "Patch Changes" although react goes `0.0.0 → 0.1.0`: the heading follows the intent's bump, the version follows the fixed group.
- #3's body is changesets/action's fixed template ("…merge this and publish to npm yourself or setup this action to publish automatically…"), then `# Releases` with each package's `## name@0.1.0` section. The template's publish wording doesn't fit our stage flow, and the action has no input to change it.
- The bot's pushes created `ci` and `intent-check` runs on #3 that ended `action_required` (43199075056, 43199075173, 43199242791, 43199242752): public repo, bot-made PR.

## B: CI on the release PR (2026-11-12)

- Closed and reopened #3. The four `action_required` runs flipped to `failure` on close, as on A.
- After the reopen: `ci` (43199369732) passed `ci` and `scan`; `intent-check` (43199370108) was `skipped` by the `changeset-release/` head-branch rule. `gh pr checks 3`: `intent-check: skipping`, `ci: pass`, `scan: pass`.

## B: release 0.1.0 (2026-11-12)

- Merged #3 at 10:26:48Z → `c25641b chore: release (#3)`. Run 43200442494, all green:
  - `release-pr` (10:27:36–10:27:45): `No changesets present or were removed by merging version PR. Not publishing because publish-script is not set.` No new release PR.
  - `release-pack` (10:27:36–10:27:47): `decide` → `Release (core 0.0.0 → 0.1.0): { version: '0.1.0', sha: 'c25641b…', pr: 3, distTag: 'latest', tag: true, resume: false }`. Both tarballs contain `CHANGELOG.md`, `index.js`, `package.json`.
  - `release-stage` (10:27:52–10:28:19): `✅ Staged package @luca-gr4vy/release-poc-b@0.1.0` (5.7 s, id `b873a0bd-…`), then `✅ Staged package @luca-gr4vy/release-poc-b-react@0.1.0` (4.7 s, id `e7b80d27-…`).
- Tag `v0.1.0` → `c25641b`. Release `v0.1.0`: `draft=false immutable=true`, published 10:28:14Z. Its notes are both packages' `## 0.1.0` changelog sections, under `## @luca-gr4vy/release-poc-b` and `## @luca-gr4vy/release-poc-b-react`.
- `github-actions` commented on #3 at 10:28:15Z with the approve instructions. Merge to comment: 87 s.

## B: re-run after a successful release (2026-11-12)

- `gh run rerun 43200442494` (attempt 2): all green, `release-stage` skipped.
- `release-pr`: main was still `c25641b`, so the guard let the action run. It logged `No changesets present…` and opened nothing.
- `decide`: `No release: v0.1.0 is already released`.

## B: malware-scan wait (2026-11-12)

- `pnpm stage list` (locally, user's login):
  - core `0.1.0`, staged 10:28:08Z: `status: staged` at 10:32:19Z (≤ 4 min 11 s).
  - react `0.1.0`, staged 10:28:13Z: still `validating` at 10:32:19Z, `staged` at 10:33:30Z (polled every 30 s, so ~5 min). C's scans took ≤ 1.5 min.
- npmjs.com showed "Validating. Automated review hasn't finished. You can approve this version once processing completes." while the scan ran.

## B: approval (2026-11-12)

- The user approved core, then react, on npmjs.com with 2FA.
- `npm view @luca-gr4vy/release-poc-b-react@0.1.0 dependencies dist-tags` → `{"@luca-gr4vy/release-poc-b":"^0.1.0"}`, `latest: 0.1.0`. Core: `latest: 0.1.0`.
