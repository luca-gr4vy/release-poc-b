import { test } from 'node:test';
import assert from 'node:assert/strict';
import { changelogSection } from './lib.mjs';

// Shaped like `pnpm version -r` output: an empty `## 0.0.1` comes from a react-only intent.
const core = '# @x/core\n\n## 0.1.10\n\n- Later\n\n## 0.1.1\n\n## 0.1.0\n\n### Minor Changes\n\n- Add core shout\n\n## 0.0.1\n';
const react = '# @x/react\n\n## 0.1.0\n\n### Patch Changes\n\n- Fix react guard\n\n- Updated dependencies:\n  - @x/core@0.1.0\n';

test('changelogSection', () => {
  for (const [markdown, version, expected] of [
    [core, '0.1.0', '### Minor Changes\n\n- Add core shout'],
    [core, '0.1.1', ''],
    [core, '0.0.1', ''],
    [core, '0.1.10', '- Later'],
    [core, '9.9.9', ''],
    [react, '0.1.0', '### Patch Changes\n\n- Fix react guard\n\n- Updated dependencies:\n  - @x/core@0.1.0'],
  ]) {
    assert.equal(changelogSection(markdown, version), expected, version);
  }
});
