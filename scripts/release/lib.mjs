/**
 * Body of the `## <version>` section of a CHANGELOG.md that `pnpm version -r` wrote,
 * up to the next `## ` heading. Empty when the heading is missing or has no entries.
 */
export const changelogSection = (markdown, version) => {
  const lines = markdown.split('\n');
  const start = lines.indexOf(`## ${version}`);
  if (start === -1) return '';
  const end = lines.findIndex((line, i) => i > start && line.startsWith('## '));
  return lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
};
