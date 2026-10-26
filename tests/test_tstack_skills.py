"""Offline packaging/behavior tests. No model or GitHub writes occur."""
import contextlib
import hashlib
import importlib.machinery
import importlib.util
import io
import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / 'agent/skills'
NAMES = {'babysit-pr', 'council', 'file-pr', 'full-send', 'full-stop',
         'leaving-pr-comments', 'modernize', 'sol-loop', 'takeover'}
REV = '7de017b3fc9d50c03cf3ecb98fb71e0ca65a78bd'
SCRIPT = SKILLS / 'babysit-pr/scripts/pr-wait'
loader = importlib.machinery.SourceFileLoader('tstack_pr_wait', str(SCRIPT))
spec = importlib.util.spec_from_loader(loader.name, loader)
assert spec is not None
watch = importlib.util.module_from_spec(spec)
loader.exec_module(watch)


class Packaging(unittest.TestCase):
    def test_exact_inventory_and_provenance(self):
        manifest = json.loads((ROOT / 'docs/tstack-manifest.json').read_text())
        self.assertEqual(set(manifest['skills']), NAMES)
        self.assertEqual(manifest['revision'], REV)
        for name in NAMES:
            text = (SKILLS / name / 'SKILL.md').read_text()
            self.assertTrue(text.startswith('---\n'))
            self.assertIn('name: ' + name + '\n', text)
            self.assertIn(REV, text)
            match = re.search(r'^description: (.+)$', text, re.M)
            assert match is not None
            desc = match.group(1)
            self.assertLessEqual(len(desc), 60)
            self.assertIn('## Local integration', text)
            self.assertIn('Follow the requested workflow directly', text)
            self.assertNotIn('## Local authority and verification', text)

    def test_complete_mit_notice(self):
        notices = [(SKILLS / n / 'references/LICENSE-tstack.txt').read_bytes() for n in NAMES]
        self.assertEqual(len(set(notices)), 1)
        self.assertIn(b'Copyright (c) 2026 Theo Browne', notices[0])
        self.assertIn(b'THE SOFTWARE IS PROVIDED "AS IS"', notices[0])

    def test_support_hashes(self):
        manifest = json.loads((ROOT / 'docs/tstack-manifest.json').read_text())
        for rel, expected in manifest['unmodified_support_files'].items():
            actual = hashlib.sha256((SKILLS / rel).read_bytes()).hexdigest()
            self.assertEqual(actual, expected, rel)

    def test_markdown_reference_targets(self):
        for name in NAMES:
            p = SKILLS / name / 'SKILL.md'
            text = p.read_text()
            targets = re.findall(r'\]\(([^)#]+)(?:#[^)]*)?\)', text)
            targets += re.findall(r'`((?:\.\./|references/)[^`]+\.md)`', text)
            for target in targets:
                if not target.startswith(('http:', 'https:')):
                    self.assertTrue((p.parent / target).exists(), (name, target))

    def test_versionable_not_ignored(self):
        for name in NAMES:
            p = SKILLS / name / 'SKILL.md'
            result = subprocess.run(['git', 'check-ignore', '--no-index', str(p)],
                                    cwd=ROOT, capture_output=True, text=True)
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)

    def test_review_and_permission_negative_contracts(self):
        send = (SKILLS / 'full-send/SKILL.md').read_text()
        stop = (SKILLS / 'full-stop/SKILL.md').read_text()
        council = (SKILLS / 'council/SKILL.md').read_text()
        sol = (SKILLS / 'sol-loop/SKILL.md').read_text()
        self.assertIn('this request replaces that rule', send)
        self.assertIn('- Merge the PR once the merge gate passes.', send)
        self.assertIn('Never merge', stop)
        self.assertIn('Three\nproviders are not required', council)
        for model in ['gpt-6.1-sol', 'gpt-6-astra', 'gpt-6-luna']:
            self.assertIn(model, council)
        self.assertNotIn('claude', council.lower())
        self.assertNotIn('gemini', council.lower())
        self.assertNotIn('Default to three rounds', council)
        self.assertIn('until all delegates are satisfied', council)
        self.assertIn('instead of substituting', council)
        self.assertIn('Budget end is not approval', sol)
        self.assertNotIn('orchestrator_capabilities', council + sol)
        self.assertNotIn('t3_thread_send', sol)


    def test_pi_default_and_workflow_steering(self):
        settings = json.loads((ROOT / 'agent/settings.json').read_text())
        self.assertEqual(settings['defaultModel'], 'gpt-6.1-sol')
        self.assertEqual(settings['defaultProvider'], 'llamacpp')
        steering = (ROOT / 'agent/APPEND_SYSTEM.md').read_text()
        self.assertNotIn('Spawn only when explicitly requested', steering)
        self.assertIn('Delegate when the active workflow calls for it', steering)
        self.assertFalse((SKILLS / 'design-loop').exists())
        self.assertFalse((ROOT / 'docs/history/retired-skills').exists())
        self.assertTrue((SKILLS / 'agent-gauntlet/SKILL.md').is_file())
        subagents = (SKILLS / 'subagents/SKILL.md').read_text()
        self.assertIn('Use `subagent_workflow` for the upstream workflow engine', subagents)
        self.assertNotIn('use the Pi Tooling `workflow` tool', subagents)


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
