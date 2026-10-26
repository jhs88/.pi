// Exercise installed Pi discovery only. No agent startup or inference.
import assert from 'node:assert/strict';
import { readFileSync, realpathSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const agentDir = process.env.PI_AGENT_DIR || join(root, 'agent');
const version = readFileSync(join(agentDir, 'install/current-version'), 'utf8').trim();
assert.match(version, /^[a-zA-Z0-9._+-]+$/);
assert.notEqual(version, '.');
assert.notEqual(version, '..');
const entry = realpathSync(join(agentDir, 'install/releases', version, 'node_modules/.bin/pi'));
const loaderPath = resolve(dirname(entry), '../core/skills.js');
const { loadSkillsFromDir } = await import(pathToFileURL(loaderPath).href);
const manifest = JSON.parse(readFileSync(join(root, 'docs/tstack-manifest.json'), 'utf8'));
const expected = new Set(manifest.skills);
const result = loadSkillsFromDir({ dir: join(agentDir, 'skills'), source: 'user' });
const ours = result.skills.filter(s => expected.has(s.name));
const diagnostics = result.diagnostics.filter(d => manifest.skills.some(n => d.path?.includes(`/${n}/`)));
assert.equal(ours.length, 9);
assert.equal(new Set(ours.map(s => s.name)).size, 9);
assert.deepEqual(diagnostics, []);
assert(!result.skills.some(s => s.name === 'design-loop'));
assert(result.skills.some(s => s.name === 'agent-gauntlet'));
for (const skill of ours) {
  assert.equal(realpathSync(skill.filePath), realpathSync(join(root, 'agent/skills', skill.name, 'SKILL.md')));
}

const scratch = process.env.TMPDIR || join(homedir(), '.hermes/cache/scratch');
mkdirSync(scratch, { recursive: true });
const temp = mkdtempSync(join(scratch, 'tstack-loader-'));
try {
  mkdirSync(join(temp, 'missing-description'));
  writeFileSync(join(temp, 'missing-description/SKILL.md'), '---\nname: missing-description\n---\nInvalid fixture\n');
  mkdirSync(join(temp, 'not-a-skill'));
  writeFileSync(join(temp, 'not-a-skill/notes.txt'), 'full send council sol loop');
  const negative = loadSkillsFromDir({ dir: temp, source: 'path' });
  assert.equal(negative.skills.length, 0);
  assert(negative.diagnostics.some(d => d.message.includes('description')));
  console.log(JSON.stringify({ piVersion: version, discovered: ours.map(s => s.name), diagnostics,
    negativeControl: 'missing description rejected; plain-text near miss not discovered' }, null, 2));
} finally {
  rmSync(temp, { recursive: true });
}
