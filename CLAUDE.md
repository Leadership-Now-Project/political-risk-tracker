# Political Risk Tracker — Claude Code Implementation Guide

This is the single source of truth for maintaining the US Political Risk Tracker. It replaces and supersedes `CONTENT-UPDATE-INSTRUCTIONS.md`, `us-political-risk-framework-instructions.md`, and the scattered instructions across the existing scripts.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Research & Scoring Methodology](#2-research--scoring-methodology)
3. [Weekly Update Process](#3-weekly-update-process)
4. [Monthly Archive Process](#4-monthly-archive-process)
5. [Actions & Pushback Updates](#5-actions--pushback-updates)
6. [Validation & Deployment](#6-validation--deployment)
7. [Data Schema Reference](#7-data-schema-reference)

---

## 1. Architecture Overview

### Tech Stack
- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS with custom brand colors (navy #0E2344, cream #F8F6F1, gold #BDAA77)
- **Charts:** Recharts, D3, react-simple-maps
- **Deployment:** Vercel (auto-deploys from git)

### Data Files (all in `data/`)
| File | Purpose | Updated |
|------|---------|---------|
| `current.json` | Current scores, findings, sources for all 10 categories | Weekly |
| `historical-changes.json` | Monthly summaries with rationale for score changes | Monthly |
| `history/YYYY-MM-DD.json` | Point-in-time score snapshots (numbers only) | Monthly |
| `categories.json` | Static category definitions and rubrics | Rarely |
| `states.json` | State-level risk data | As needed |
| `scenarios.json` | Predefined scenario events with impact deltas | As needed |
| `economic-indicators.json` | Market/economic indicators with sensitivity weights | As needed |
| `actions-pushback.json` | Executive actions and legal challenges tracker | Weekly/biweekly |
| `actions-timeline.json` | Week-by-week chronological view | Weekly/biweekly |

### Scoring Model
- **10 categories** across 3 domains, scored 1–10 (higher = more risk)
- **Domain scores** = average of member categories
- **Overall score** = average of all 10 categories
- **Risk levels:** Low (1–2.9), Moderate (3–4.9), Elevated (5–6.9), High (7–8.9), Severe (9–10)

| Domain | Categories |
|--------|-----------|
| Rule of Law & National Security (`rule-of-law`) | `elections`, `rule-of-law`, `national-security` |
| Operating & Economic Environment (`operating-economic`) | `regulatory-stability`, `trade-policy`, `government-contracts`, `fiscal-policy` |
| Societal & Institutional Integrity (`societal-institutional`) | `media-freedom`, `civil-discourse`, `institutional-integrity` |

### Existing Scripts (reference only — prefer the processes below)
- `scripts/weekly-update.js` — Interactive CLI (uses readline, not suitable for non-interactive Claude Code use)
- `scripts/update-content.js` — Another interactive CLI with `--status` and `--category` flags
- `scripts/monthly-archive.js` — Creates history snapshots and updates History page imports
- `scripts/extract-actions-data.py` — Placeholder, not yet implemented
- `content-update.csv` — Alternative CSV-based input format

---

## 2. Research & Scoring Methodology

This section tells Claude Code how to research current events and propose score updates. It is the upstream input for the Weekly Update Process (Section 3). **All proposed scores require user approval before being written to data files.**

### 2.1 End-to-End Workflow

```
┌─────────────────────────────────────────────────────────┐
│  Step 1: RESEARCH (this section)                        │
│  Claude Code searches the web, gathers evidence,        │
│  applies rubrics, and proposes scores + findings.       │
│  Output: a proposed update for user review.             │
├─────────────────────────────────────────────────────────┤
│  Step 2: USER REVIEW                                    │
│  User reviews proposed scores, adjusts as needed,       │
│  and says "go ahead" or provides corrections.           │
├─────────────────────────────────────────────────────────┤
│  Step 3: DATA ENTRY (Section 3)                         │
│  Claude Code writes approved scores/findings to         │
│  current.json, recalculates aggregates, validates.      │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Source Hierarchy

For each category, prioritize sources in this order:
1. **Primary sources**: Court filings, official government documents, legislation text, executive orders, agency press releases
2. **Verified reporting**: Major wire services (AP, Reuters), newspapers of record (NYT, WSJ, WaPo, FT)
3. **Specialized trackers**: Academic institutions, nonpartisan watchdogs, legal databases
4. **Expert analysis**: Think tanks (Brookings, AEI, Brennan Center, CATO, etc. — note ideological lean)

### 2.3 Data Collection Standards
- Record **date**, **source URL**, and **key quote or data point** for each finding
- Note when claims are disputed or unverified
- Distinguish between **allegations**, **confirmed events**, and **outcomes**
- Flag retractions or corrections
- Primary window: trailing 12 months from current date
- Compare against: same period in prior year (for trend analysis)

### 2.4 Category Research Instructions

For each category below: run the search queries, check the listed data sources, track the listed metrics, and apply the scoring rubric to propose a score.

---

#### `elections` — Elections
**Domain:** Rule of Law & National Security
**Risk indicators:** Interference, disenfranchisement, term limit circumvention

**Search queries:**
- `"voter suppression" OR "election interference" site:brennancenter.org`
- `"voting rights" lawsuit filed [YEAR]`
- `"election administration" changes [YEAR]`
- `state election law changes [YEAR]`
- `"voter roll purge" [YEAR]`

**Data sources:** Brennan Center Voting Laws Roundup, MIT Election Data + Science Lab, Election Assistance Commission, NCSL state legislature tracking, DOJ Voting Section press releases, PACER/Court Listener for election cases

**Metrics:**
- Number of new state voting restrictions passed
- Number of election-related lawsuits filed
- Election officials who resigned citing threats
- Documented election interference allegations
- Changes to election certification processes

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal democratic activity, minor procedural disputes |
| 3–4 | Elevated litigation, some restrictive laws passed |
| 5–6 | Significant restrictions enacted, credible interference allegations |
| 7–8 | Systematic disenfranchisement efforts, defiance of election outcomes |
| 9–10 | Overt attempts to overturn results, term limit violations |

---

#### `rule-of-law` — Legal / Defying Court Orders
**Domain:** Rule of Law & National Security
**Risk indicators:** Refusal to comply with court rulings, retributive prosecutions

**Search queries:**
- `"contempt of court" federal government [YEAR]`
- `"defied court order" administration [YEAR]`
- `"DOJ" prosecution "political" OR "retribution" [YEAR]`
- `"judicial independence" threats [YEAR]`

**Data sources:** PACER/Court Listener, DOJ Office of Professional Responsibility, American Bar Association statements, Federal Judicial Center, Inspector General reports, Congressional oversight hearing transcripts

**Metrics:**
- Court orders challenged or defied by executive branch
- Contempt findings against federal officials
- Prosecutions of political opponents/critics
- Dismissals of cases against political allies
- Judicial statements citing executive non-compliance

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal legal disputes, appeals through proper channels |
| 3–4 | Aggressive legal postures, delayed compliance |
| 5–6 | Pattern of non-compliance, prosecutorial discretion concerns |
| 7–8 | Open defiance of court orders, clear retributive prosecution pattern |
| 9–10 | Systematic rule of law breakdown, judges targeted |

---

#### `national-security` — National Stability
**Domain:** Rule of Law & National Security
**Risk indicators:** Politically motivated military deployment, dismantling cyber defenses

**Search queries:**
- `"Insurrection Act" invocation OR consideration [YEAR]`
- `"military deployment" domestic [YEAR]`
- `"CISA" budget OR leadership OR reorganization`
- `"cyber defense" cuts OR dismantled [YEAR]`
- `"intelligence community" independence [YEAR]`

**Data sources:** DoD press releases, Congressional Armed Services Committee hearings, CISA announcements and budgets, GAO reports, Military Times / Defense One, Inspector General reports (DoD, DHS)

**Metrics:**
- Domestic military deployments (non-disaster)
- CISA budget/staffing changes
- Cyber incident response capability assessments
- Military leadership dismissals/resignations
- Intelligence community politicization incidents

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal operations, routine deployments |
| 3–4 | Unusual rhetoric, minor organizational changes |
| 5–6 | Significant cyber defense reductions, politicized appointments |
| 7–8 | Domestic military use for political purposes, major security gaps |
| 9–10 | Military deployed against civilians, critical defenses dismantled |

---

#### `regulatory-stability` — Regulatory Stability
**Domain:** Operating & Economic Environment
**Risk indicators:** Rapid policy reversals, executive order volume, contradictory guidance

**Search queries:**
- `executive orders [YEAR] site:ballotpedia.org`
- `"regulatory" reversal OR rollback [YEAR]`
- `"independent agency" heads fired OR removed [YEAR]`
- `"compliance" uncertainty OR "regulatory whiplash" [YEAR]`

**Data sources:** Ballotpedia executive order tracker, Brookings regulatory tracker, Deloitte/KPMG regulatory outlook reports, Supreme Court docket for agency authority cases

**Metrics:**
- Volume of executive orders, memoranda, proclamations
- Agency leadership changes (firings, vacancies)
- Major regulatory reversals from prior administration
- Court cases challenging executive regulatory authority
- Industry compliance cost estimates

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal regulatory activity, predictable policy direction |
| 3–4 | Elevated executive action volume, some reversals |
| 5–6 | Significant policy instability, agencies face leadership gaps |
| 7–8 | Contradictory guidance, independent agencies compromised |
| 9–10 | Regulatory framework non-functional, complete unpredictability |

---

#### `trade-policy` — Trade Policy
**Domain:** Operating & Economic Environment
**Risk indicators:** Trade wars, tariff escalation, supply chain disruption

**Search queries:**
- `tariff policy [YEAR] impact`
- `"trade war" tariffs [YEAR]`
- `"trade deficit" [YEAR]`
- `"Court of International Trade" tariff ruling [YEAR]`

**Data sources:** CSIS, CFR trade analysis, Peterson Institute for International Economics, Tax Foundation tariff tracker, Federal Reserve bank research, USTR announcements

**Metrics:**
- Tariff increases (% and dollar value)
- Trade deficit changes
- Court challenges to tariff authority
- Retaliatory tariff actions by trading partners
- Business/consumer cost projections

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal trade negotiations, minor tariff adjustments |
| 3–4 | Elevated rhetoric, some tariff escalation |
| 5–6 | Significant trade disruption, retaliatory spirals beginning |
| 7–8 | Major trade wars, GDP-impacting tariff levels |
| 9–10 | Trade breakdown, severe supply chain collapse |

---

#### `government-contracts` — Cronyism & Retaliation
**Domain:** Operating & Economic Environment
**Risk indicators:** Favoritism in contracts/regulation, targeted business punishment

**Search queries:**
- `"no-bid contract" federal [YEAR]`
- `"government contract" awarded "political donor" [YEAR]`
- `"regulatory" retaliation business [YEAR]`
- `DOGE contract termination [YEAR]`

**Data sources:** USASpending.gov, Federal Procurement Data System, GAO bid protest decisions, Inspector General reports (all agencies), OpenSecrets (donor/contract correlations), POGO

**Metrics:**
- Non-competitive contract awards (dollar value, %)
- Contract awards to political donors
- Regulatory actions against companies that criticized administration
- IG findings of contracting irregularities
- DOGE-related contract changes

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal contracting, typical regulatory activity |
| 3–4 | Some questionable awards, elevated scrutiny of critics |
| 5–6 | Pattern of favoritism, documented retaliation cases |
| 7–8 | Systematic cronyism, weaponized regulation |
| 9–10 | Overt pay-to-play, businesses destroyed for political reasons |

---

#### `fiscal-policy` — Major Economic Disruptions
**Domain:** Operating & Economic Environment
**Risk indicators:** Fed interference, data manipulation, debt ceiling crises

**Search queries:**
- `"Federal Reserve" independence OR pressure OR interference [YEAR]`
- `"debt ceiling" crisis [YEAR]`
- `"economic data" manipulation OR suppression [YEAR]`
- `"government shutdown" [YEAR]`

**Data sources:** Federal Reserve statements and meeting minutes, CBO analyses, BLS methodology documents, Peterson Institute, Tax Foundation, IMF/World Bank US assessments, credit rating agencies (S&P, Moody's, Fitch)

**Metrics:**
- Public pressure on Fed from executive branch
- Fed leadership changes or attempted changes
- Delays/changes to economic data releases
- Government shutdown events
- Credit rating actions
- Market volatility tied to policy

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal policy debates, standard fiscal operations |
| 3–4 | Elevated rhetoric, some fiscal brinksmanship |
| 5–6 | Credible Fed interference attempts, shutdown threats |
| 7–8 | Data integrity compromised, major economic dislocations |
| 9–10 | Fed independence destroyed, data fabrication |

---

#### `media-freedom` — Freedom of Expression
**Domain:** Societal & Institutional Integrity
**Risk indicators:** Press suppression, coercion of speech, university funding retaliation

**Search queries:**
- `"press freedom" United States [YEAR]`
- `"university funding" cut OR revoked political [YEAR]`
- `"journalist" arrested OR detained OR threatened [YEAR] US`
- `"academic freedom" threat [YEAR]`

**Data sources:** Reporters Without Borders Press Freedom Index, Committee to Protect Journalists (CPJ), PEN America, FIRE, AAUP, Department of Education funding decisions, First Amendment court cases

**Metrics:**
- US Press Freedom Index ranking
- Journalist arrests/detentions
- University funding revocations citing political reasons
- Government demands to media platforms
- Academic freedom incidents

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Robust press freedom, normal academic debates |
| 3–4 | Concerning rhetoric, isolated incidents |
| 5–6 | Pattern of retaliation, funding cuts with political motive |
| 7–8 | Systematic suppression, self-censorship widespread |
| 9–10 | Press effectively controlled, universities silenced |

---

#### `civil-discourse` — Intimidation & Political Violence
**Domain:** Societal & Institutional Integrity
**Risk indicators:** Targeting judges, opponents, journalists; pardoning political violence

**Search queries:**
- `"threats against judges" [YEAR]`
- `"political violence" United States [YEAR]`
- `"January 6" pardon [YEAR]`
- `"domestic terrorism" charges [YEAR]`
- `threats against "election workers" [YEAR]`

**Data sources:** U.S. Marshals Service judicial security reports, CPJ, FBI Domestic Terrorism statistics, U.S. Capitol Police threat assessments, ADL/SPLC incident trackers, Pew Research political violence surveys

**Metrics:**
- Threats against federal judges
- Journalists arrested/detained
- Pardons for political violence convictions
- Documented political violence incidents
- Threats against election workers

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Baseline threat levels, isolated incidents |
| 3–4 | Elevated threats, concerning rhetoric from officials |
| 5–6 | Pattern of intimidation, some pardons for violence |
| 7–8 | Systematic targeting, mass pardons for political violence |
| 9–10 | State-sanctioned violence, journalists imprisoned |

---

#### `institutional-integrity` — Erosion of Institutions & Norms
**Domain:** Societal & Institutional Integrity
**Risk indicators:** Gutting agencies, undermining watchdogs, data transparency

**Search queries:**
- `"federal workforce" reduction OR "RIF" [YEAR]`
- `"inspector general" fired OR removed [YEAR]`
- `"FOIA" backlog OR denial rate [YEAR]`
- `"schedule F" OR civil service reform [YEAR]`
- `"data" removed government website [YEAR]`

**Data sources:** OPM workforce data, CIGIE (Council of IGs) reports, FOIA.gov request/response data, Sunlight Foundation/Data Coalition, GAO High Risk List, Congressional testimony from former officials, Internet Archive (for removed government data)

**Metrics:**
- Federal workforce changes by agency
- IG vacancies and removals
- FOIA response times and denial rates
- Government datasets removed or altered
- Senior career official departures
- Agency budget changes (adjusted for inflation)

**Scoring rubric:**
| Score | Description |
|-------|-------------|
| 1–2 | Normal turnover, routine reorganization |
| 3–4 | Elevated departures, some data access concerns |
| 5–6 | Significant workforce reductions, IG independence compromised |
| 7–8 | Systematic hollowing out, data suppression |
| 9–10 | Agencies non-functional, transparency destroyed |

---

### 2.5 How to Present Proposed Updates

After researching, present results to the user in this format for each category:

```
## [CATEGORY NAME] (category-id)
**Current score:** X → **Proposed score:** Y
**Trend:** increasing | stable | decreasing

### Key Findings (for current.json)
1. "Finding text with source attribution (Source Name)"
2. "Finding text..."
3. "Finding text..."

### Sources (URLs for current.json)
1. https://...
2. https://...
(5-7 total)

### Score Justification
2-3 sentences explaining why this score was assigned based on the rubric.

### Data Gaps
Note any metrics that could not be verified or sources unavailable.
```

After presenting all categories, show a summary table:

```
| Category               | Current | Proposed | Change | Trend      |
|------------------------|---------|----------|--------|------------|
| elections              |       8 |        8 |      0 | increasing |
| rule-of-law            |       9 |        9 |      0 | increasing |
| ...                    |     ... |      ... |    ... | ...        |
| OVERALL                |     8.0 |      X.X |   ±X.X | —          |
```

Then ask: **"Do these proposed scores and findings look right? I can adjust any category before writing to current.json."**

### 2.6 Quality Checklist (run before proposing)

- [ ] All claims have source URLs that resolve
- [ ] Dates are verified and within the trailing 12-month window
- [ ] Disputed claims are flagged as such in findings text
- [ ] Multiple sources corroborate major findings
- [ ] Scoring is consistent with the rubric for that category
- [ ] Ideological lean of sources is noted where relevant
- [ ] Data gaps are acknowledged
- [ ] Each finding includes source attribution in parentheses

---

## 3. Weekly Update Process

Use this process every week, AFTER research is complete and the user has approved the proposed scores (Section 2). The user may also provide data directly as text, CSV, a document, or verbal instructions — in which case skip Section 2.

### Step 1: Back up current state
```bash
cp data/current.json data/current.backup.json
```

### Step 2: Update `data/current.json`

For each category being updated, modify the corresponding entry in the `scores` object:

```json
{
  "category_id": {
    "score": <integer 1-10>,
    "trend": "<increasing|stable|decreasing>",
    "keyFindings": [
      "Finding 1 with source attribution in parentheses (Source Name)",
      "Finding 2...",
      "Finding 3..."
    ],
    "sources": [
      "https://full-url-1",
      "https://full-url-2"
    ],
    "lastUpdated": "YYYY-MM-DD"
  }
}
```

**Rules:**
- Keep exactly 3 key findings per category (may have up to 5 if warranted)
- Each finding should include source attribution in parentheses at the end
- Include 5–7 source URLs per category, all verified working links
- Set `lastUpdated` to the date the research was conducted, not necessarily today
- Leave unchanged categories untouched

### Step 3: Recalculate aggregates

After modifying scores, recalculate these fields in `current.json`:

```javascript
// Domain scores
domainScores["rule-of-law"] = round((elections + rule_of_law + national_security) / 3, 2)
domainScores["operating-economic"] = round((regulatory_stability + trade_policy + government_contracts + fiscal_policy) / 4, 2)
domainScores["societal-institutional"] = round((media_freedom + civil_discourse + institutional_integrity) / 3, 2)

// Overall score
overallScore = round(sum_of_all_10_scores / 10, 1)

// Risk level
if overallScore < 3: "Low"
else if overallScore < 5: "Moderate"
else if overallScore < 7: "Elevated"
else if overallScore < 9: "High"
else: "Severe"
```

### Step 4: Update assessment metadata

```json
{
  "assessmentDate": "YYYY-MM-DD",       // Today's date
  "assessmentPeriod": "YYYY-MM-DD to YYYY-MM-DD"  // Rolling 12-month window
}
```

### Step 5: Validate

```bash
# Verify JSON is valid
node -e "const d = require('./data/current.json'); console.log('Overall:', d.overallScore, d.riskLevel); console.log('Domains:', JSON.stringify(d.domainScores)); Object.entries(d.scores).forEach(([k,v]) => console.log(k, v.score, v.trend, v.keyFindings.length + ' findings', v.sources.length + ' sources'))"

# Build to catch any type errors
npm run build
```

---

## 4. Monthly Archive Process

Run this on or around the 20th of each month, AFTER the weekly update for that week.

### Step 1: Create history snapshot

Create `data/history/YYYY-MM-20.json` (always use the 20th for consistency):

```json
{
  "date": "YYYY-MM-20",
  "scores": {
    "elections": 8,
    "rule-of-law": 8,
    ...
  },
  "domainScores": {
    "rule-of-law": 8.0,
    "operating-economic": 6.5,
    "societal-institutional": 7.67
  },
  "overallScore": 7.3,
  "riskLevel": "High"
}
```

**IMPORTANT:** The snapshot `scores` object contains plain numbers (not the full score objects with findings). Extract just the `.score` value from each category in `current.json`.

### Step 2: Add import to `app/history/page.tsx`

Add a new import line after the existing history imports:

```typescript
import historyYYYYMM from '@/data/history/YYYY-MM-20.json';
```

And add the new snapshot to the `historicalSnapshots` array:

```typescript
const historicalSnapshots: HistoricalSnapshot[] = [
  history202507 as HistoricalSnapshot,
  // ... existing entries ...
  historyYYYYMM as HistoricalSnapshot,  // ← new entry
];
```

### Step 3: Update `data/historical-changes.json`

Append a new entry to the `changes` array:

```json
{
  "period": "Month YYYY",
  "date": "YYYY-MM-20",
  "overallScore": <current overall score>,
  "overallChange": <delta from previous month's overallScore>,
  "summary": "One-sentence summary of the month's key developments",
  "keyDevelopments": [
    "Development 1",
    "Development 2",
    "Development 3"
  ],
  "categoryChanges": [
    {
      "category": "category-id",
      "from": <old score>,
      "to": <new score>,
      "rationale": "1-2 sentence explanation of why score changed"
    }
  ]
}
```

**Rules:**
- Compare current scores against the PREVIOUS month's snapshot to detect changes
- Only include categories in `categoryChanges` that actually changed score
- `overallChange` = current overallScore - previous month's overallScore, rounded to 1 decimal
- If no categories changed score, `categoryChanges` should be an empty array
- Key developments should be the 3 most significant events of the month

### Step 4: Validate

```bash
npm run build
```

---

## 5. Actions & Pushback Updates

### Updating `data/actions-pushback.json`

The file has this structure:

```json
{
  "lastUpdated": "YYYY-MM-DD",
  "summary": {
    "totalActions": <int>,
    "totalLegalChallenges": <int>,
    "blockedOrReversed": <int>,
    "implementationRate": <decimal 0-1>,
    "categorySummaries": [...]
  },
  "actions": [...],
  "pushback": [...]
}
```

**When adding a new action:**
```json
{
  "id": "action-NNN",
  "title": "Short title",
  "description": "2-3 sentence description",
  "type": "executive-order|memorandum|agency-rule|proclamation|directive",
  "category": "immigration|environment|civil-rights|government-reform|economic-policy|judiciary|healthcare|education|foreign-policy|media-press",
  "date": "YYYY-MM-DD",
  "status": "implemented|partially-implemented|blocked|reversed|pending-litigation|under-review",
  "source": "https://..."
}
```

**When adding pushback (legal challenge):**
```json
{
  "id": "case-NNN",
  "title": "Case Name v. Defendant",
  "description": "2-3 sentence summary",
  "type": "federal-lawsuit|state-lawsuit|congressional-action|state-legislation|agency-challenge",
  "category": "same categories as actions",
  "dateFiled": "YYYY-MM-DD",
  "status": "filed|preliminary-injunction|injunction-granted|ruling-for|ruling-against|appealed|settled|dismissed",
  "relatedActionId": "action-NNN or null",
  "source": "https://..."
}
```

**After adding entries:** Recalculate the `summary` object:
- `totalActions` = length of actions array
- `totalLegalChallenges` = length of pushback array
- `blockedOrReversed` = count of actions with status "blocked" or "reversed"
- `implementationRate` = count of "implemented" / totalActions
- `categorySummaries` = rebuild counts per category

### Updating `data/actions-timeline.json`

Add entries to the appropriate week. Each week entry has:
```json
{
  "weekOf": "YYYY-MM-DD",
  "weekLabel": "Week of Month DD",
  "actions": [...],
  "pushback": [...]
}
```

---

## 6. Validation & Deployment

### After any data change

```bash
# 1. Verify JSON validity and score calculations
node -e "
const d = require('./data/current.json');
const cats = Object.entries(d.scores);
const sum = cats.reduce((a, [,v]) => a + v.score, 0);
const expected = Math.round((sum / cats.length) * 10) / 10;
console.log('Scores:', cats.map(([k,v]) => k + ':' + v.score).join(', '));
console.log('Overall:', d.overallScore, '(expected:', expected, expected === d.overallScore ? '✓' : '✗ MISMATCH');
console.log('Risk Level:', d.riskLevel);
"

# 2. Build (catches TypeScript errors and import issues)
npm run build

# 3. Optionally run dev server to visually verify
npm run dev
```

### After structural changes (new history imports, new components)

```bash
# Full build + lint
npm run lint && npm run build
```

### Deployment

The app deploys automatically via Vercel when changes are pushed to the git repository. After updating data files:

```bash
git add data/
git commit -m "Weekly update: [brief description of changes]"
git push
```

---

## 7. Data Schema Reference

### `current.json` — Full Schema

```typescript
{
  assessmentDate: string;           // "YYYY-MM-DD"
  assessmentPeriod: string;         // "YYYY-MM-DD to YYYY-MM-DD"
  scores: {
    [categoryId: string]: {
      score: number;                // 1-10 integer
      trend: "increasing" | "stable" | "decreasing";
      keyFindings: string[];        // 3-5 items
      sources: string[];            // 5-7 URLs
      lastUpdated: string;          // "YYYY-MM-DD"
    }
  };
  domainScores: {
    "rule-of-law": number;          // 2 decimal places
    "operating-economic": number;
    "societal-institutional": number;
  };
  overallScore: number;             // 1 decimal place
  riskLevel: "Low" | "Moderate" | "Elevated" | "High" | "Severe";
}
```

### `history/YYYY-MM-20.json` — Snapshot Schema

```typescript
{
  date: string;                     // "YYYY-MM-20"
  scores: {
    [categoryId: string]: number;   // Just the score number, not the full object
  };
  domainScores: {
    "rule-of-law": number;
    "operating-economic": number;
    "societal-institutional": number;
  };
  overallScore: number;
  riskLevel: string;
}
```

### Category IDs (all 10)
```
elections, rule-of-law, national-security,
regulatory-stability, trade-policy, government-contracts, fiscal-policy,
media-freedom, civil-discourse, institutional-integrity
```

### Action Categories
```
immigration, environment, civil-rights, government-reform,
economic-policy, judiciary, healthcare, education, foreign-policy, media-press
```
