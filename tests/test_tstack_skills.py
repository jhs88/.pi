"""Pi integration and shared watcher tests. No model or GitHub writes occur."""
import contextlib
import importlib.machinery
import importlib.util
import io
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / 'agent/skills'
SHARED = Path.home() / '.agents/skills'
NAMES = {'babysit-pr', 'council', 'file-pr', 'full-send', 'full-stop',
         'leaving-pr-comments', 'modernize', 'sol-loop', 'takeover'}
ALIASES = NAMES | {'technical-writing', 'unslop'}
LOCAL = {'agent-gauntlet', 'code-navigation', 'compare-prototypes', 'subagents', 'tilth'}
SCRIPT = SHARED / 'babysit-pr/scripts/pr-wait'
# The shared library is read-only input, even when the caller omits the env flag.
sys.dont_write_bytecode = True
loader = importlib.machinery.SourceFileLoader('tstack_pr_wait', str(SCRIPT))
spec = importlib.util.spec_from_loader(loader.name, loader)
assert spec is not None
watch = importlib.util.module_from_spec(spec)
loader.exec_module(watch)


class PiIntegration(unittest.TestCase):
    def test_shared_skills_need_no_pi_aliases(self):
        for name in ALIASES:
            with self.subTest(name=name):
                self.assertFalse((SKILLS / name).exists())
                self.assertFalse((SKILLS / name).is_symlink())
                self.assertTrue((SHARED / name / 'SKILL.md').is_file())

    def test_only_owned_skills_are_local_directories(self):
        actual = {p.name for p in SKILLS.iterdir()
                  if p.is_dir() and not p.is_symlink() and not p.name.startswith('.')}
        self.assertEqual(actual, LOCAL)
        for name in LOCAL:
            self.assertTrue((SKILLS / name / 'SKILL.md').is_file())

    def test_shared_paths_ignored_owned_skills_versionable(self):
        for name in ALIASES | LOCAL:
            path = SKILLS / name
            result = subprocess.run(['git', 'check-ignore', '--no-index', str(path)],
                                    cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 0 if name in ALIASES else 1,
                             (name, result.stdout, result.stderr))

    def test_shared_markdown_reference_targets(self):
        for name in NAMES:
            p = SHARED / name / 'SKILL.md'
            text = p.read_text()
            targets = re.findall(r'\]\(([^)#]+)(?:#[^)]*)?\)', text)
            targets += re.findall(r'`((?:\.\./|references/)[^`]+\.md)`', text)
            for target in targets:
                if not target.startswith(('http:', 'https:')):
                    self.assertTrue((p.parent / target).exists(), (name, target))

    def test_review_and_permission_negative_contracts(self):
        send = (SHARED / 'full-send/SKILL.md').read_text()
        stop = (SHARED / 'full-stop/SKILL.md').read_text()
        council = (SHARED / 'council/SKILL.md').read_text()
        sol = (SHARED / 'sol-loop/SKILL.md').read_text()
        self.assertIn('this request replaces that rule', send)
        self.assertIn('- Merge the PR once the merge gate passes.', send)
        self.assertIn('Never merge', stop)
        self.assertRegex(council, r'Three\s+providers are not required')
        for model in ['gpt-6.1-sol', 'gpt-6-astra', 'gpt-6-luna']:
            self.assertIn(model, council)
        self.assertNotIn('claude', council.lower())
        self.assertNotIn('gemini', council.lower())
        self.assertNotIn('llamacpp', council)
        self.assertIn('until all delegates are satisfied', council)
        self.assertIn('instead of substituting', council)
        self.assertIn('Budget end is not approval', sol)
        self.assertNotIn('orchestrator_capabilities', council + sol)
        self.assertNotIn('t3_thread_send', sol)

    def test_pi_workflow_steering(self):
        steering = (ROOT / 'agent/APPEND_SYSTEM.md').read_text()
        self.assertNotIn('Spawn only when explicitly requested', steering)
        self.assertIn('Delegate when the active workflow calls for it', steering)
        self.assertFalse((SKILLS / 'design-loop').exists())
        self.assertFalse((ROOT / 'docs/history/retired-skills').exists())
        subagents = (SKILLS / 'subagents/SKILL.md').read_text()
        self.assertIn('Use `subagent_workflow` for the upstream workflow engine', subagents)
        self.assertNotIn('use the Pi Tooling `workflow` tool', subagents)

    def test_owned_and_shared_manual_invocation_flags(self):
        manual = set()
        for name in LOCAL:
            p = SKILLS / name / 'SKILL.md'
            frontmatter = p.read_text().split('---', 2)[1]
            keys = set(re.findall(r'^([a-z][a-z-]*):', frontmatter, re.M))
            self.assertTrue({'name', 'description'} <= keys, name)
            self.assertTrue(keys <= {'name', 'description', 'disable-model-invocation'}, name)
            if 'disable-model-invocation: true' in frontmatter:
                manual.add(name)
        self.assertEqual(manual, {'agent-gauntlet', 'compare-prototypes'})
        technical = (SHARED / 'technical-writing/SKILL.md').read_text()
        self.assertIn('disable-model-invocation: true', technical.split('---', 2)[1])

    def test_shared_install_documented_without_local_updater(self):
        for rel in ['README.md', 'docs/matt-pocock-skills.md', 'docs/tstack-skills.md']:
            text = (ROOT / rel).read_text()
            self.assertIn('npx skills add jhs88/skills -g -a pi', text)
            self.assertIn('automatically', text)
        for rel in ['docs/tstack-manifest.json', 'scripts/check_tstack_updates.py',
                    'tests/test_tstack_updates.py']:
            self.assertFalse((ROOT / rel).exists())
        self.assertTrue((ROOT / 'docs/third-party-notices.md').is_file())


class Watcher(unittest.TestCase):
    def setUp(self):
        scratch = Path(os.environ.get('TMPDIR', Path.home() / '.hermes/cache/scratch'))
        scratch.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='tstack-test-', dir=scratch)
        self.addCleanup(self.temp.cleanup)
        self.state = patch.object(watch, 'STATE_DIR', Path(self.temp.name))
        self.state.start()
        self.addCleanup(self.state.stop)

    def test_cli_help_and_missing_input(self):
        help_result = subprocess.run(['python3', str(SCRIPT), '--help'], capture_output=True, text=True)
        self.assertEqual(help_result.returncode, 0)
        missing = subprocess.run(['python3', str(SCRIPT)], capture_output=True, text=True)
        self.assertEqual(missing.returncode, 2)
        self.assertIn('missing PR number', missing.stdout)

    def test_parse_valid_target(self):
        with patch.object(watch, 'gh') as gh:
            self.assertEqual(watch.parse_target('https://github.com/owner/repo/pull/42', None),
                             ('owner/repo', 42))
            gh.assert_called_once()

    def test_invalid_target_never_calls_github(self):
        with patch.object(watch, 'gh') as gh, contextlib.redirect_stdout(io.StringIO()):
            for raw in ['bad', '0', 'https://example.org/owner/repo/pull/2']:
                with self.assertRaises(SystemExit) as error:
                    watch.parse_target(raw, None)
                self.assertEqual(error.exception.code, 2)
            gh.assert_not_called()

    def test_duplicate_lock_rejected(self):
        handle = watch.lock('owner/repo', 42)
        self.addCleanup(handle.close)
        second = open(watch.STATE_DIR / 'owner__repo__42.lock', 'a+')
        self.addCleanup(second.close)
        with patch('builtins.open', return_value=second), \
             contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit) as error:
            watch.lock('owner/repo', 42)
        self.assertEqual(error.exception.code, 2)

    def test_event_dedup_survives_restart(self):
        w = watch.Watcher('owner/repo', 42, 'any-change', 60)
        w.baseline = False
        with contextlib.redirect_stdout(io.StringIO()):
            w.emit('finding-1', 'new finding')
            w.save()
        resumed = watch.Watcher('owner/repo', 42, 'any-change', 60)
        with contextlib.redirect_stdout(io.StringIO()):
            resumed.emit('finding-1', 'new finding')
        self.assertEqual(resumed.events, 0)
        self.assertIn('finding-1', resumed.reported)

    def snapshot(self, state='OPEN', merge='CLEAN'):
        return {'state': state, 'url': 'https://github.com/owner/repo/pull/42',
                'headRefOid': 'a' * 40, 'baseRefName': 'main',
                'author': {'login': 'author'}, 'viewer': 'viewer',
                'comments': {'nodes': []}, 'reviews': {'nodes': []},
                'reviewThreads': {'nodes': []}, 'baseRef': {'target': {'oid': 'b' * 40}},
                'mergeStateStatus': merge}

    def test_required_failure_exits_for_action(self):
        w = watch.Watcher('owner/repo', 42, 'green', 60)
        w.required = {'test'}
        with patch.object(w, 'fetch_pr', return_value=self.snapshot()), \
             patch.object(w, 'fetch_checks', return_value={'test': {'bucket': 'fail', 'link': 'test-url'}}), \
             contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit) as error:
            w.poll()
        self.assertEqual(error.exception.code, 1)

    def test_green_requires_stable_snapshot(self):
        w = watch.Watcher('owner/repo', 42, 'green', 60)
        w.required = {'test'}
        with patch.object(w, 'fetch_pr', return_value=self.snapshot()), \
             patch.object(w, 'fetch_checks', return_value={'test': {'bucket': 'pass', 'link': 'test-url'}}), \
             patch.object(w, 'behind', return_value=''), contextlib.redirect_stdout(io.StringIO()):
            w.poll()
            with self.assertRaises(SystemExit) as error:
                w.poll()
        self.assertEqual(error.exception.code, 0)

    def test_merged_and_closed_are_distinct(self):
        for state, expected in [('MERGED', 0), ('CLOSED', 1)]:
            w = watch.Watcher('owner/repo', 42, 'green', 60)
            with patch.object(w, 'fetch_pr', return_value=self.snapshot(state=state)), \
                 contextlib.redirect_stdout(io.StringIO()), self.assertRaises(SystemExit) as error:
                w.poll()
            self.assertEqual(error.exception.code, expected)


if __name__ == '__main__':
    unittest.main()
