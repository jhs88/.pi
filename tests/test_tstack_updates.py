"""Offline upstream checker tests using explicit synthetic snapshots."""
import contextlib
import copy
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location('tstack_update_check', ROOT / 'scripts/check_tstack_updates.py')
assert SPEC is not None and SPEC.loader is not None
checker = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(checker)


class Updates(unittest.TestCase):
    def setUp(self):
        self.manifest = {
            'upstream': checker.UPSTREAM, 'revision': 'a' * 40, 'skills': ['example'],
            'source_files': {'example/SKILL.md': '1' * 64, 'example/scripts/helper': '2' * 64},
        }
        self.current = copy.deepcopy(self.manifest['source_files'])

    def report(self, head=None, files=None):
        return checker.compare(self.manifest, head or 'a' * 40,
                               self.current if files is None else files, [])

    def test_no_updates(self):
        report = self.report()
        self.assertFalse(report['updates_available'])
        self.assertEqual(report['new_skills'], [])
        self.assertEqual(report['changed_files'], [])

    def test_new_skill_and_support_file(self):
        self.current['brand-new/SKILL.md'] = '3' * 64
        self.current['brand-new/references/guide.md'] = '4' * 64
        report = self.report('b' * 40)
        self.assertEqual(report['new_skills'], ['brand-new'])
        self.assertEqual(len(report['added_files']), 2)
        self.assertTrue(report['updates_available'])

    def test_removed_skill(self):
        report = self.report('b' * 40, {'replacement/SKILL.md': '3' * 64})
        self.assertEqual(report['removed_skills'], ['example'])
        self.assertEqual(report['new_skills'], ['replacement'])
        self.assertEqual(len(report['removed_files']), 2)

    def test_changed_support_marks_existing_skill_modified(self):
        self.current['example/scripts/helper'] = '5' * 64
        report = self.report('b' * 40)
        self.assertEqual(report['modified_skills'], ['example'])
        self.assertEqual(report['changed_files'], ['example/scripts/helper'])
        self.assertEqual(report['new_skills'], [])

    def test_added_or_removed_support_marks_existing_skill(self):
        del self.current['example/scripts/helper']
        self.current['example/agents/new.yaml'] = '6' * 64
        report = self.report('b' * 40)
        self.assertEqual(report['modified_skills'], ['example'])
        self.assertEqual(report['added_files'], ['example/agents/new.yaml'])
        self.assertEqual(report['removed_files'], ['example/scripts/helper'])

    def test_readme_only_revision_still_requests_review(self):
        report = checker.compare(self.manifest, 'b' * 40, self.current, ['README.md'])
        self.assertTrue(report['updates_available'])
        self.assertEqual(report['modified_skills'], [])
        self.assertEqual(report['repository_changed_files'], ['README.md'])

    def test_main_pinned_once_and_manifest_verified(self):
        calls = []
        def fake_git(repo, *args):
            calls.append(args)
            if args[0] == 'rev-parse':
                return ('b' * 40 + '\n').encode()
            if args[0] == 'diff':
                return b'LICENSE\0'
            return b''
        before = copy.deepcopy(self.manifest)
        with patch.object(checker, 'git', side_effect=fake_git), \
             patch.object(checker, 'snapshot', return_value=self.current) as snapshot:
            result = checker.check(self.manifest)
        self.assertEqual(self.manifest, before)
        self.assertEqual(result['main_revision'], 'b' * 40)
        self.assertEqual(snapshot.call_args_list[0].args[1], 'a' * 40)
        self.assertEqual(snapshot.call_args_list[1].args[1], 'b' * 40)
        self.assertIn(('fetch', '--quiet', '--no-tags', '--depth=1', checker.UPSTREAM, 'refs/heads/main'), calls)

    def test_bad_manifest_rejected_before_network(self):
        for key, value in [('upstream', 'https://example.org/not-upstream'), ('revision', 'main'),
                           ('skills', ['incorrect']), ('source_files', {})]:
            bad = {**self.manifest, key: value}
            with patch.object(checker, 'git') as git, self.assertRaises(ValueError):
                checker.check(bad)
            git.assert_not_called()

    def test_baseline_hash_mismatch_is_error(self):
        with patch.object(checker, 'git', return_value=('a' * 40 + '\n').encode()), \
             patch.object(checker, 'snapshot', return_value={'example/SKILL.md': '0' * 64}), \
             self.assertRaisesRegex(ValueError, 'Manifest hashes/inventory'):
            checker.check(self.manifest)

    def test_snapshot_rejects_symlink_and_empty_inventory(self):
        for tree in [b'120000 blob abc\tskills/example/SKILL.md\0', b'']:
            with patch.object(checker, 'git', return_value=tree), self.assertRaises(ValueError):
                checker.snapshot(Path('.'), 'a' * 40)

    def test_cli_statuses_and_network_error(self):
        for updates, expected in [(False, 0), (True, 1)]:
            report = {**self.report(), 'updates_available': updates}
            out = io.StringIO()
            with patch.object(checker, 'check', return_value=report), contextlib.redirect_stdout(out):
                code = checker.main(['--json'])
            self.assertEqual(code, expected)
            self.assertEqual(json.loads(out.getvalue())['updates_available'], updates)
        for error in [RuntimeError('network unavailable'), subprocess.TimeoutExpired('git', 90)]:
            out = io.StringIO()
            with patch.object(checker, 'check', side_effect=error), contextlib.redirect_stdout(out):
                code = checker.main(['--json'])
            self.assertEqual(code, 2)
            self.assertEqual(json.loads(out.getvalue())['status'], 'check_failed')


if __name__ == '__main__':
    unittest.main()
