// Exercise installed Pi discovery and skill loading only. No agent startup or inference.
import assert from 'node:assert/strict';
import { existsSync, readFileSync, realpathSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const agentDir = resolve(process.env.PI_AGENT_DIR || join(root, 'agent'));
const version = readFileSync(join(agentDir, 'install/current-version'), 'utf8').trim();
assert.match(version, /^[a-zA-Z0-9._+-]+$/);
assert.notEqual(version, '.');
assert.notEqual(version, '..');
const entry = realpathSync(join(agentDir, 'install/releases', version, 'node_modules/.bin/pi'));
const core = resolve(dirname(entry), '../core');
const { DefaultPackageManager } = await import(pathToFileURL(join(core, 'package-manager.js')).href);
const { DefaultResourceLoader } = await import(pathToFileURL(join(core, 'resource-loader.js')).href);
const { loadSkills, loadSkillsFromDir } = await import(pathToFileURL(join(core, 'skills.js')).href);
const sharedDir = join(homedir(), '.agents/skills');
const sharedNames = [
  'ask-matt', 'babysit-pr', 'code-review', 'codebase-design', 'council', 'diagnosing-bugs',
  'domain-modeling', 'file-pr', 'full-send', 'full-stop', 'grill-me', 'grill-with-docs',
  'grilling', 'handoff', 'implement', 'implement-spec', 'improve-codebase-architecture',
  'leaving-pr-comments', 'modernize', 'pr', 'prototype', 'research', 'retro',
  'setup-matt-pocock-skills', 'sol-loop', 'takeover', 'tdd', 'teach', 'technical-writing',
  'to-questionnaire', 'to-spec', 'to-tickets', 'triage', 'unslop', 'wait-what', 'wayfinder',
  'wizard', 'writing-for-agents',
];
const localNames = ['agent-gauntlet', 'code-navigation', 'compare-prototypes', 'subagents', 'tilth'];
const expected = [...sharedNames, ...localNames].sort();
assert.equal(sharedNames.length, 38);
assert.equal(expected.length, 43);

// Exercise the package manager's native auto-discovery with actual skill overrides.
// Do not resolve packages, reload extensions, or create a live settings manager.
const settingsManager = { isProjectTrusted: () => true };
const readSettings = path => existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
const projectBaseDir = join(root, '.pi');
const manager = new DefaultPackageManager({ cwd: root, agentDir, settingsManager });
const accumulator = manager.createAccumulator();
manager.addAutoDiscoveredResources(accumulator, readSettings(join(agentDir, 'settings.json')),
  readSettings(join(projectBaseDir, 'settings.json')), agentDir, projectBaseDir);
const resources = manager.toResolvedPaths(accumulator).skills.filter(resource => resource.enabled);
const paths = resources.map(resource => resource.path);
const metadata = new Map(resources.map(resource => [resource.path, resource.metadata]));
const result = loadSkills({ cwd: root, agentDir, skillPaths: paths, includeDefaults: false });
assert.deepEqual(result.diagnostics, []);
assert.deepEqual(result.skills.map(skill => skill.name).sort(), expected);
assert.equal(paths.length, expected.length, 'compatibility aliases must not enter native discovery');
assert.equal(new Set(result.skills.map(skill => skill.name)).size, expected.length);
for (const skill of result.skills) {
  const base = sharedNames.includes(skill.name) ? sharedDir : join(agentDir, 'skills');
  const source = join(base, skill.name, 'SKILL.md');
  assert.equal(skill.filePath, source, `${skill.name} must use the intended discovery path`);
  assert.equal(realpathSync(skill.filePath), realpathSync(source));
}

// Apply the same resource-loader integration used after discovery, without reload().
const loader = new DefaultResourceLoader({ cwd: root, agentDir, settingsManager });
loader.updateSkillsFromPaths(paths, metadata);
const integrated = loader.getSkills();
assert.deepEqual(integrated.diagnostics, []);
assert.deepEqual(integrated.skills.map(skill => skill.filePath).sort(),
  result.skills.map(skill => skill.filePath).sort());
const local = loadSkillsFromDir({ dir: join(agentDir, 'skills'), source: 'user' });
assert.deepEqual(local.diagnostics, []);
assert.deepEqual(local.skills.map(skill => skill.name).sort(), [...localNames].sort());
assert.deepEqual(local.skills.filter(skill => skill.disableModelInvocation).map(skill => skill.name).sort(),
  ['agent-gauntlet', 'compare-prototypes']);
assert.equal(result.skills.find(skill => skill.name === 'technical-writing').disableModelInvocation, true);
assert(!result.skills.some(skill => skill.name === 'design-loop'));

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
  assert(negative.diagnostics.some(diagnostic => diagnostic.message.includes('description')));

  const fixture = (dir, name) => {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'SKILL.md'), `---\nname: ${name}\ndescription: Explicit loader fixture.\n---\nFixture only.\n`);
  };
  const parent = join(temp, 'parent');
  fixture(parent, 'parent');
  fixture(join(parent, 'child'), 'child');
  const nested = loadSkillsFromDir({ dir: parent, source: 'path' });
  assert.deepEqual(nested.skills.map(skill => skill.name), ['parent']);
  assert.deepEqual(nested.diagnostics, []);
  const collisionPaths = [join(temp, 'first'), join(temp, 'second')];
  for (const path of collisionPaths) fixture(path, 'collision');
  const collision = loadSkills({ cwd: root, agentDir, skillPaths: collisionPaths, includeDefaults: false });
  assert.equal(collision.skills.length, 1);
  assert(collision.diagnostics.some(diagnostic => diagnostic.type === 'collision'));

  console.log(JSON.stringify({ piVersion: version, entry, sharedCount: sharedNames.length,
    localCount: localNames.length, total: result.skills.length, diagnostics: result.diagnostics,
    sources: result.skills.map(({ name, filePath, disableModelInvocation }) =>
      ({ name, filePath, disableModelInvocation })),
    negativeControls: ['missing description rejected', 'plain-text near miss ignored',
      'nested child not recursively discovered inside a skill', 'name collision diagnosed'],
  }, null, 2));
} finally {
  rmSync(temp, { recursive: true });
}
