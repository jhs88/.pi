#!/usr/bin/env python3
"""Read-only upstream-main check. Exit 0=current, 1=updates, 2=error.

Only a disposable bare Git repository is written. Never load or execute upstream
code, edit local skills, or advance the adaptation manifest.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile

ROOT = Path(__file__).resolve().parents[1]
UPSTREAM = 'https://github.com/t3dotgg/tstack'


def git(repo: Path, *args: str) -> bytes:
    result = subprocess.run(
        ['git', '-C', str(repo), *args], capture_output=True, timeout=90,
        env={**os.environ, 'GIT_TERMINAL_PROMPT': '0'},
    )
    if result.returncode:
        raise RuntimeError(result.stderr.decode('utf-8', errors='replace').strip()
                           or f'git failed with exit {result.returncode}')
    return result.stdout


def snapshot(repo: Path, revision: str) -> dict[str, str]:
    """Hash only ordinary skills files. Reject symlink/submodule skill inputs."""
    files = {}
    for row in git(repo, 'ls-tree', '-rz', '--full-tree', revision).split(b'\0'):
        if not row:
            continue
        meta, raw_path = row.split(b'\t', 1)
        mode, kind, oid = meta.decode('ascii').split()
        path = raw_path.decode('utf-8')
        if not path.startswith('skills/'):
            continue
        if mode not in ('100644', '100755') or kind != 'blob':
            raise ValueError(f'Unsupported upstream skill entry: {path} ({mode} {kind})')
        relative = path.removeprefix('skills/')
        files[relative] = hashlib.sha256(git(repo, 'cat-file', 'blob', oid)).hexdigest()
    if not any(p.endswith('/SKILL.md') for p in files):
        raise ValueError('No upstream skills found; refusing to report an empty inventory as current')
    return files


def skill_names(files: dict[str, str]) -> set[str]:
    return {p.removesuffix('/SKILL.md') for p in files if p.endswith('/SKILL.md')}


def compare(manifest: dict, head: str, current: dict[str, str],
            repository_files: list[str]) -> dict:
    baseline = manifest['source_files']
    old_skills, new_skills = skill_names(baseline), skill_names(current)
    added = sorted(current.keys() - baseline.keys())
    removed = sorted(baseline.keys() - current.keys())
    changed = sorted(p for p in current.keys() & baseline.keys() if current[p] != baseline[p])
    touched = set(added + removed + changed)
    modified_skills = sorted(n for n in old_skills & new_skills
                             if any(p.startswith(n + '/') for p in touched))
    return {
        'upstream': manifest['upstream'], 'branch': 'main',
        'pinned_revision': manifest['revision'], 'main_revision': head,
        'updates_available': head != manifest['revision'] or bool(touched),
        'new_skills': sorted(new_skills - old_skills),
        'removed_skills': sorted(old_skills - new_skills),
        'modified_skills': modified_skills,
        'added_files': added, 'removed_files': removed, 'changed_files': changed,
        'repository_changed_files': sorted(repository_files),
        'compare_url': f"{UPSTREAM}/compare/{manifest['revision']}...{head}",
    }


def check(manifest: dict) -> dict:
    if manifest.get('upstream') != UPSTREAM:
        raise ValueError('Unexpected upstream URL in manifest')
    pin = manifest.get('revision', '')
    if not isinstance(pin, str) or not re.fullmatch(r'[0-9a-f]{40}', pin):
        raise ValueError('Manifest revision must be an exact 40-character lowercase Git SHA')
    baseline = manifest.get('source_files')
    if not isinstance(baseline, dict) or not baseline:
        raise ValueError('Manifest source_files must be a nonempty mapping')
    for path, digest in baseline.items():
        if (not isinstance(path, str) or not isinstance(digest, str)
                or not re.fullmatch(r'[0-9a-f]{64}', digest)):
            raise ValueError('Invalid manifest source file or SHA-256 digest')
    if set(manifest.get('skills', [])) != skill_names(baseline):
        raise ValueError('Manifest skill inventory disagrees with source_files')
    scratch = Path(os.environ.get('TMPDIR', Path.home() / '.hermes/cache/scratch'))
    scratch.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='tstack-update-check-', dir=scratch) as directory:
        repo = Path(directory)
        git(repo, 'init', '--bare', '--quiet')
        git(repo, 'fetch', '--quiet', '--no-tags', '--depth=1', UPSTREAM,
            'refs/heads/main')
        head = git(repo, 'rev-parse', 'FETCH_HEAD').decode().strip()
        # Resolve main once. Later branch movement cannot mix snapshots.
        if head != pin:
            git(repo, 'fetch', '--quiet', '--no-tags', '--depth=1', UPSTREAM, pin)
        pinned_files = snapshot(repo, pin)
        if pinned_files != baseline:
            raise ValueError('Manifest hashes/inventory do not match the pinned upstream revision')
        current = snapshot(repo, head)
        all_changed = git(repo, 'diff', '--name-only', '-z', pin, head).decode().split('\0')
        return compare(manifest, head, current, [p for p in all_changed if p])


def render(report: dict) -> str:
    lines = [f"Tstack upstream main: {report['main_revision']}",
             f"Local adaptation pin: {report['pinned_revision']}",
             'Updates available for review.' if report['updates_available'] else 'Up to date with upstream main.']
    for key, label in [('new_skills', 'New skills'), ('removed_skills', 'Removed skills'),
                       ('modified_skills', 'Modified skills'), ('added_files', 'Added skill files'),
                       ('removed_files', 'Removed skill files'), ('changed_files', 'Changed skill files'),
                       ('repository_changed_files', 'Changed repository files')]:
        values = report[key]
        lines.append(f"{label} ({len(values)}): " + (', '.join(values) or 'none'))
    lines.extend([report['compare_url'], 'Read-only check; local skills and manifest were not modified.'])
    return '\n'.join(lines)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, default=ROOT / 'docs/tstack-manifest.json')
    parser.add_argument('--json', action='store_true', help='Emit a machine-readable report')
    args = parser.parse_args(argv)
    try:
        manifest = json.loads(args.manifest.read_text())
        if not isinstance(manifest, dict):
            raise ValueError('Manifest must be a JSON object')
        report = check(manifest)
    except (OSError, ValueError, RuntimeError, subprocess.TimeoutExpired) as error:
        if args.json:
            print(json.dumps({'error': str(error), 'status': 'check_failed'}))
        else:
            print(f'Tstack update check failed: {error}', file=sys.stderr)
        return 2
    print(json.dumps(report, indent=2) if args.json else render(report))
    return 1 if report['updates_available'] else 0


if __name__ == '__main__':
    sys.exit(main())
