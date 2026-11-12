// Decide whether this commit releases. A release commit is a merged release PR:
// it changed core's version compared with HEAD^ (`pnpm version -r` bumped it).
// Runs before `pnpm install`. Writes dist/release.json and the `release` step output.
import { mkdirSync, writeFileSync } from 'node:fs';
import { PACKAGES, RELEASE_JSON, setOutput, sh, trySh } from './sh.mjs';

const { GITHUB_REPOSITORY: repo, GITHUB_SHA: sha } = process.env;

const skip = (reason) => {
  console.log(`No release: ${reason}`);
  setOutput('release', 'false');
  process.exit(0);
};

const stableTags = (args) => sh('git', ['tag', '--list', 'v*', ...args]).split('\n').filter((t) => t && !t.includes('-'));

const coreVersionAt = (rev) => {
  const json = trySh('git', ['show', `${rev}:${PACKAGES[0].dir}/package.json`]);
  return json === null ? null : JSON.parse(json).version;
};

const version = coreVersionAt('HEAD');
const before = coreVersionAt('HEAD^');
if (before === null) skip('HEAD^ has no core package.json');
if (version === before) skip(`core is still at ${version}, so this is not a release commit`);
const tagName = `v${version}`;

// A claimed tag: done if its Release exists, resume if it's this commit's, fail if it's another's.
const owner = trySh('git', ['rev-parse', '--verify', '--quiet', `${tagName}^{commit}`]);
if (owner !== null && owner !== sha) throw new Error(`${tagName} is already on ${owner}, not ${sha}`);
if (owner === sha && trySh('gh', ['release', 'view', tagName, '-R', repo, '--json', 'tagName']) !== null) {
  skip(`${tagName} is already released`);
}

// Old or out-of-order run: HEAD is already contained in a higher release.
const highest = stableTags(['--sort=-v:refname'])[0];
if (highest && highest !== tagName && trySh('git', ['merge-base', '--is-ancestor', 'HEAD', highest]) !== null) {
  skip(`HEAD is already contained in ${highest} (stale run)`);
}

const pr = sh('gh', ['api', `repos/${repo}/commits/${sha}/pulls`, '--jq', '.[0].number // empty']);
const release = { version, sha, pr: pr ? Number(pr) : null, distTag: 'latest', tag: true, resume: owner === sha };
mkdirSync('dist', { recursive: true });
writeFileSync(RELEASE_JSON, `${JSON.stringify(release, null, 2)}\n`);
console.log(`Release (core ${before} → ${version}):`, release);
setOutput('release', 'true');
