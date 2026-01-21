# Content Update Instructions for Claude Code

## Overview
This document explains how to update the Political Risk Tracker webapp content using the CSV file `content-update.csv`.

## Files Involved
- **Input:** `content-update.csv` - Edit this file to update scores, findings, and sources
- **Output:** `data/current.json` - The webapp reads this file for all assessment data

## CSV Column Definitions

| Column | Description | Valid Values |
|--------|-------------|--------------|
| `category_id` | Unique identifier for category | `elections`, `rule-of-law`, `national-security`, `regulatory-stability`, `trade-policy`, `government-contracts`, `fiscal-policy`, `media-freedom`, `civil-discourse`, `institutional-integrity` |
| `score` | Risk score (higher = more risk) | Integer 1-10 |
| `trend` | Direction of risk | `increasing`, `stable`, `decreasing` |
| `key_finding_1` | First key finding | Text (include source attribution in parentheses) |
| `key_finding_2` | Second key finding | Text |
| `key_finding_3` | Third key finding | Text |
| `source_1` through `source_7` | Supporting URLs | Full URLs (leave empty if fewer sources) |
| `last_updated` | Date of update | YYYY-MM-DD format |

## Instructions for Claude Code

When the user shares the updated CSV file, perform these steps:

### 1. Parse the CSV
```bash
# Read the CSV file
cat content-update.csv
```

### 2. Update `data/current.json`
Transform the CSV data into the JSON structure. For each row in the CSV:

```json
{
  "category_id_here": {
    "score": <score from CSV>,
    "trend": "<trend from CSV>",
    "keyFindings": [
      "<key_finding_1>",
      "<key_finding_2>",
      "<key_finding_3>"
    ],
    "sources": [
      "<source_1>",
      "<source_2>",
      // ... include all non-empty sources
    ],
    "lastUpdated": "<last_updated from CSV>"
  }
}
```

### 3. Recalculate Domain Scores
After updating individual scores, recalculate domain averages:

**Rule of Law & National Security** (`rule-of-law` domain):
- Categories: `elections`, `rule-of-law`, `national-security`
- Formula: `(elections + rule-of-law + national-security) / 3`

**Operating & Economic Environment** (`operating-economic` domain):
- Categories: `regulatory-stability`, `trade-policy`, `government-contracts`, `fiscal-policy`
- Formula: `(regulatory-stability + trade-policy + government-contracts + fiscal-policy) / 4`

**Societal & Institutional Integrity** (`societal-institutional` domain):
- Categories: `media-freedom`, `civil-discourse`, `institutional-integrity`
- Formula: `(media-freedom + civil-discourse + institutional-integrity) / 3`

### 4. Recalculate Overall Score
```
overallScore = average of all 10 category scores
```

### 5. Determine Risk Level
Based on the overall score:
- 1-2: `"Low"`
- 3-4: `"Moderate"`
- 5-6: `"Elevated"`
- 7-8: `"High"`
- 9-10: `"Severe"`

### 6. Update Assessment Metadata
- Set `assessmentDate` to today's date (YYYY-MM-DD)
- Update `assessmentPeriod` to reflect the new period being assessed

### 7. Sample Python Script
```python
import csv
import json
from datetime import date

def csv_to_current_json(csv_path, json_path):
    # Read CSV
    with open(csv_path, 'r') as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # Build scores dict
    scores = {}
    for row in rows:
        sources = [row[f'source_{i}'] for i in range(1, 8) if row.get(f'source_{i}')]
        scores[row['category_id']] = {
            'score': int(row['score']),
            'trend': row['trend'],
            'keyFindings': [
                row['key_finding_1'],
                row['key_finding_2'],
                row['key_finding_3']
            ],
            'sources': sources,
            'lastUpdated': row['last_updated']
        }

    # Calculate domain scores
    domain_scores = {
        'rule-of-law': round((scores['elections']['score'] +
                              scores['rule-of-law']['score'] +
                              scores['national-security']['score']) / 3, 2),
        'operating-economic': round((scores['regulatory-stability']['score'] +
                                     scores['trade-policy']['score'] +
                                     scores['government-contracts']['score'] +
                                     scores['fiscal-policy']['score']) / 4, 2),
        'societal-institutional': round((scores['media-freedom']['score'] +
                                         scores['civil-discourse']['score'] +
                                         scores['institutional-integrity']['score']) / 3, 2)
    }

    # Calculate overall score
    overall = round(sum(s['score'] for s in scores.values()) / len(scores), 1)

    # Determine risk level
    if overall <= 2:
        risk_level = 'Low'
    elif overall <= 4:
        risk_level = 'Moderate'
    elif overall <= 6:
        risk_level = 'Elevated'
    elif overall <= 8:
        risk_level = 'High'
    else:
        risk_level = 'Severe'

    # Build final JSON
    today = date.today().isoformat()
    result = {
        'assessmentDate': today,
        'assessmentPeriod': f"{(date.today().replace(year=date.today().year-1)).isoformat()} to {today}",
        'scores': scores,
        'domainScores': domain_scores,
        'overallScore': overall,
        'riskLevel': risk_level
    }

    # Write JSON
    with open(json_path, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"Updated {json_path}")
    print(f"Overall Score: {overall} ({risk_level})")

# Run the update
csv_to_current_json('content-update.csv', 'data/current.json')
```

### 8. Verify the Update
After updating, run the Next.js development server to verify:
```bash
npm run dev
```

## Notes
- Always backup `data/current.json` before updating
- The webapp automatically reads from `data/current.json` on page load
- Sources are optional - include only verified, working URLs
- Key findings should be factual and include source attribution in parentheses
