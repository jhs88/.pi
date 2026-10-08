"""Summarize saved native codemode results without calling a model."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
suite = json.loads((ROOT / 'suite.json').read_text())
fixtures = {case['id']: case for case in suite['cases']}
assert len(fixtures) == 54


def percentile(values, fraction):
    ordered = sorted(values)
    return ordered[max(0, math.ceil(fraction * len(ordered)) - 1)] if ordered else None


def numeric_difference(left, right):
    maximum = 0
    for key, value in left.items():
        other = right.get(key)
        if isinstance(value, dict) and isinstance(other, dict):
            maximum = max(maximum, numeric_difference(value, other))
        elif isinstance(value, (int, float)) and isinstance(other, (int, float)):
            maximum = max(maximum, abs(value - other))
    return maximum


def metrics(rows):
    checks = [check for row in rows if not row['errors'] for check in row['checks']]
    categories = [check for check in checks if check['type'] != 'score']
    scores = [check for check in checks if check['type'] == 'score']
    return {
        'cases': len(rows),
        'validCases': sum(not row['errors'] for row in rows),
        'categoricalCorrect': sum(check['correct'] for check in categories),
        'categoricalTotal': len(categories),
        'scoreMeanAbsoluteError': sum(check['absoluteError'] for check in scores) / len(scores) if scores else None,
        'scoreNearestCorrect': sum(check['correct'] for check in scores),
        'scoreTotal': len(scores),
    }


def discrete_outcomes(row):
    return [(check['key'], math.floor(check['actual'] + 0.5) if check['type'] == 'score' else check['actual'])
            for check in row['checks']]


def verify_row(row, model_id):
    fixture = fixtures[row['caseId']]
    result = row['result']
    assert result['api'] == 'typesafe-system-one'
    assert result['provider'] == 'llama.cpp' and result['model'] == model_id
    if row['errors']:
        assert result['stopReason'] != 'stop', 'Investigate a successful result with schema errors'
        return
    assert result['stopReason'] == 'stop'
    assert set(result['answers']) == set(fixture['questions'])
    for key, question in fixture['questions'].items():
        answer = result['answers'][key]
        assert answer['type'] == question['type']
        expected = fixture['expected'][key]
        if question['type'] == 'bool':
            assert math.isfinite(answer['probability']) and 0 <= answer['probability'] <= 1
            actual = answer['probability'] > 0.5
        elif question['type'] == 'choice':
            probabilities = answer['probabilities']
            assert set(probabilities) == set(question['criteria'])
            assert all(math.isfinite(value) and 0 <= value <= 1 for value in probabilities.values())
            assert abs(sum(probabilities.values()) - 1) < 1e-6
            assert math.isfinite(answer['confidence']) and 0 <= answer['confidence'] <= 1
            assert answer['choice'] in question['criteria']
            actual = answer['choice']
        else:
            assert math.isfinite(answer['score']) and 0 <= answer['score'] <= len(question['criteria']) - 1
            assert math.isfinite(answer['confidence']) and 0 <= answer['confidence'] <= 1
            actual = answer['score']
        check = next(check for check in row['checks'] if check['key'] == key)
        assert check['actual'] == actual and check['expected'] == expected
        correct = math.floor(actual + 0.5) == expected if question['type'] == 'score' else actual == expected
        assert check['correct'] == correct
        if question['type'] == 'score':
            assert abs(check['absoluteError'] - abs(actual - expected)) < 1e-12


summaries = []
for model_id in suite['models']:
    slug = model_id.rsplit('/', 1)[1].lower()
    run = json.loads((ROOT / f'{slug}-results.json').read_text())
    rows = run['rows']
    assert len(rows) == run['plannedRequests'] == 108 and not run['stoppedEarly']
    for row in rows:
        verify_row(row, model_id)
    first = [row for row in rows if row['repeat'] == 1]
    second = {row['caseId']: row for row in rows if row['repeat'] == 2}
    assert len(first) == len(second) == len(fixtures)
    assert {row['caseId'] for row in first} == set(second) == set(fixtures)
    valid_pairs = [(row, second[row['caseId']]) for row in first
                   if not row['errors'] and not second[row['caseId']]['errors']]
    groups = {group: metrics([row for row in first if row['group'] == group])
              for group in dict.fromkeys(case['group'] for case in suite['cases'])}
    latency = [row['durationMs'] for row in rows if row['repeat'] == 2 and not row['errors']]
    summary = {
        'id': model_id, 'requests': len(rows), 'validRequests': sum(not row['errors'] for row in rows),
        'firstRepeat': metrics(first), 'groups': groups,
        'repeatDiffs': sum(row['result']['answers'] != second[row['caseId']]['result']['answers'] for row in first),
        'validRepeatOutcomeChanges': sum(discrete_outcomes(left) != discrete_outcomes(right) for left, right in valid_pairs),
        'repeatTransportDifferences': sum(bool(row['errors']) != bool(second[row['caseId']]['errors']) for row in first),
        'maxValidRepeatNumericDifference': max((numeric_difference(left['result']['answers'], right['result']['answers'])
                                               for left, right in valid_pairs), default=0),
        'secondRepeatLatencyMs': {'p50': percentile(latency, 0.5), 'p95': percentile(latency, 0.95), 'max': max(latency)},
        'firstObservedRequestMs': rows[0]['durationMs'],
        'totalInputTokens': sum(row['result'].get('usage', {}).get('input', 0) for row in rows),
        'totalOutputTokens': sum(row['result'].get('usage', {}).get('output', 0) for row in rows),
        'longerInputTokens': [{'caseId': row['caseId'], 'inputTokens': row['result'].get('usage', {}).get('input')}
                             for row in first if row['group'] == 'longer-input'],
        'errors': [{'caseId': row['caseId'], 'repeat': row['repeat'], 'errors': row['errors'], 'result': row['result']}
                   for row in rows if row['errors']],
    }
    summaries.append(summary)

(ROOT / 'summary.json').write_text(json.dumps(summaries, indent=2) + '\n')
for summary in summaries:
    result = summary['firstRepeat']
    print(f"{summary['id']}: {summary['validRequests']}/{summary['requests']} valid; "
          f"categorical {result['categoricalCorrect']}/{result['categoricalTotal']}; "
          f"score MAE {result['scoreMeanAbsoluteError']:.3f}; "
          f"second-repeat p50/p95 {summary['secondRepeatLatencyMs']['p50']}/{summary['secondRepeatLatencyMs']['p95']} ms")
print(f"Verified {sum(summary['requests'] for summary in summaries)} saved requests without inference.")
