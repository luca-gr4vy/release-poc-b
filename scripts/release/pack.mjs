// The release PR already set the versions and wrote each package's CHANGELOG.md.
// Check the versions, take this version's changelog sections as the Release
// notes, then pack the tarballs into dist/.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { changelogSection } from './lib.mjs';
import { PACKAGES, RELEASE_JSON, sh } from './sh.mjs';

const release = JSON.parse(readFileSync(RELEASE_JSON, 'utf8'));

const sections = [];
for (const { name, dir } of PACKAGES) {
  const { version } = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
  if (version !== release.version) throw new Error(`${name} is at ${version}, but core says ${release.version}`);
  const section = changelogSection(readFileSync(join(dir, 'CHANGELOG.md'), 'utf8'), version);
  if (section) sections.push(`## ${name}\n\n${section}`);
}

writeFileSync(RELEASE_JSON, `${JSON.stringify({ ...release, notes: sections.join('\n\n') }, null, 2)}\n`);
console.log(sh('pnpm', ['-r', '--filter', './packages/*', 'pack', '--pack-destination', 'dist']));
