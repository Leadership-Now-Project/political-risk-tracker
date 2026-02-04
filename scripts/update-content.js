#!/usr/bin/env node

/**
 * Content Update Script
 *
 * Streamlined script to update political risk data:
 * - Review current scores and findings
 * - Update specific categories
 * - Auto-recalculate aggregates
 *
 * Usage:
 *   node scripts/update-content.js              # Interactive mode
 *   node scripts/update-content.js --status     # Show current status only
 *   node scripts/update-content.js --category elections --score 8
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const CURRENT_PATH = path.join(ROOT, 'data/current.json');
const ECONOMIC_PATH = path.join(ROOT, 'data/economic-indicators.json');

const CATEGORIES = [
  'elections', 'rule-of-law', 'national-security', 'regulatory-stability',
  'trade-policy', 'government-contracts', 'fiscal-policy', 'media-freedom',
  'civil-discourse', 'institutional-integrity'
];

const CATEGORY_NAMES = {
  'elections': 'Elections',
  'rule-of-law': 'Rule of Law',
  'national-security': 'National Security',
  'regulatory-stability': 'Regulatory Stability',
  'trade-policy': 'Trade Policy',
  'government-contracts': 'Government Contracts',
  'fiscal-policy': 'Fiscal Policy',
  'media-freedom': 'Media Freedom',
  'civil-discourse': 'Civil Discourse',
  'institutional-integrity': 'Institutional Integrity'
};

const DOMAINS = {
  'rule-of-law': ['elections', 'rule-of-law', 'national-security'],
  'operating-economic': ['regulatory-stability', 'trade-policy', 'government-contracts', 'fiscal-policy'],
  'societal-institutional': ['media-freedom', 'civil-discourse', 'institutional-integrity']
};

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function c(color, text) {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function getScoreColor(score) {
  if (score <= 3) return 'green';
  if (score <= 5) return 'yellow';
  if (score <= 7) return 'yellow';
  return 'red';
}

function getDateString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function calculateDomainScores(scores) {
  const domainScores = {};
  for (const [domain, categories] of Object.entries(DOMAINS)) {
    const sum = categories.reduce((acc, cat) => acc + scores[cat].score, 0);
    domainScores[domain] = Math.round((sum / categories.length) * 100) / 100;
  }
  return domainScores;
}

function calculateOverallScore(scores) {
  const sum = CATEGORIES.reduce((acc, cat) => acc + scores[cat].score, 0);
  return Math.round((sum / CATEGORIES.length) * 10) / 10;
}

function getRiskLevel(score) {
  if (score < 3) return 'Low';
  if (score < 5) return 'Moderate';
  if (score < 7) return 'Elevated';
  if (score < 9) return 'High';
  return 'Severe';
}

function showStatus(current) {
  console.log('\n' + c('bold', '═══════════════════════════════════════════════════════════════'));
  console.log(c('bold', '  US POLITICAL RISK TRACKER - CURRENT STATUS'));
  console.log(c('bold', '═══════════════════════════════════════════════════════════════') + '\n');

  console.log(`  ${c('dim', 'Assessment Date:')} ${current.assessmentDate}`);
  console.log(`  ${c('dim', 'Assessment Period:')} ${current.assessmentPeriod}`);

  const scoreColor = getScoreColor(current.overallScore);
  console.log(`\n  ${c('bold', 'Overall Score:')} ${c(scoreColor, current.overallScore.toFixed(1))} / 10  [${current.riskLevel}]\n`);

  console.log(c('bold', '  Domain Scores:'));
  console.log(`    Rule of Law & National Security:  ${c(getScoreColor(current.domainScores['rule-of-law']), current.domainScores['rule-of-law'].toFixed(1))}`);
  console.log(`    Operating & Economic:             ${c(getScoreColor(current.domainScores['operating-economic']), current.domainScores['operating-economic'].toFixed(1))}`);
  console.log(`    Societal & Institutional:         ${c(getScoreColor(current.domainScores['societal-institutional']), current.domainScores['societal-institutional'].toFixed(1))}`);

  console.log('\n' + c('bold', '  Category Scores:'));
  console.log('  ┌─────────────────────────────┬───────┬────────────┬──────────────┐');
  console.log('  │ Category                    │ Score │ Trend      │ Last Updated │');
  console.log('  ├─────────────────────────────┼───────┼────────────┼──────────────┤');

  for (const catId of CATEGORIES) {
    const cat = current.scores[catId];
    const name = CATEGORY_NAMES[catId].padEnd(27);
    const score = c(getScoreColor(cat.score), String(cat.score).padStart(2) + '/10');
    const trendSymbol = cat.trend === 'increasing' ? '↑' : cat.trend === 'decreasing' ? '↓' : '→';
    const trendColor = cat.trend === 'increasing' ? 'red' : cat.trend === 'decreasing' ? 'green' : 'dim';
    const trend = c(trendColor, (trendSymbol + ' ' + cat.trend).padEnd(10));
    const updated = cat.lastUpdated || 'N/A';
    console.log(`  │ ${name} │ ${score} │ ${trend} │ ${updated.padEnd(12)} │`);
  }
  console.log('  └─────────────────────────────┴───────┴────────────┴──────────────┘\n');
}

function showCategoryDetail(current, categoryId) {
  const cat = current.scores[categoryId];
  console.log('\n' + c('bold', `  ${CATEGORY_NAMES[categoryId]}`));
  console.log('  ' + '─'.repeat(50));
  console.log(`  Score: ${c(getScoreColor(cat.score), cat.score)} | Trend: ${cat.trend} | Updated: ${cat.lastUpdated}`);

  console.log('\n  ' + c('cyan', 'Key Findings:'));
  cat.keyFindings.forEach((f, i) => {
    console.log(`    ${i + 1}. ${f.length > 80 ? f.substring(0, 77) + '...' : f}`);
  });

  console.log('\n  ' + c('cyan', 'Sources:'));
  cat.sources.forEach((s, i) => {
    console.log(`    ${i + 1}. ${s.length > 70 ? s.substring(0, 67) + '...' : s}`);
  });
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function question(rl, prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function quickUpdate(rl, current) {
  console.log('\n' + c('bold', '  Quick Update Mode'));
  console.log('  ' + '─'.repeat(50));
  console.log('  Enter category number to update, or:');
  console.log('    ' + c('dim', 'v [num]') + ' - View category details');
  console.log('    ' + c('dim', 's') + '       - Save and exit');
  console.log('    ' + c('dim', 'q') + '       - Quit without saving\n');

  CATEGORIES.forEach((cat, i) => {
    const score = current.scores[cat].score;
    console.log(`    ${String(i + 1).padStart(2)}. ${CATEGORY_NAMES[cat].padEnd(25)} [${c(getScoreColor(score), score)}]`);
  });

  let hasChanges = false;

  while (true) {
    const input = await question(rl, '\n  > ');
    const trimmed = input.trim().toLowerCase();

    if (trimmed === 'q') {
      if (hasChanges) {
        const confirm = await question(rl, '  Discard changes? [y/N]: ');
        if (confirm.toLowerCase() !== 'y') continue;
      }
      console.log('  Exiting without saving.\n');
      return false;
    }

    if (trimmed === 's') {
      return hasChanges;
    }

    if (trimmed.startsWith('v ')) {
      const num = parseInt(trimmed.substring(2));
      if (num >= 1 && num <= CATEGORIES.length) {
        showCategoryDetail(current, CATEGORIES[num - 1]);
      }
      continue;
    }

    const num = parseInt(trimmed);
    if (num >= 1 && num <= CATEGORIES.length) {
      const categoryId = CATEGORIES[num - 1];
      const cat = current.scores[categoryId];

      console.log(`\n  Updating ${c('bold', CATEGORY_NAMES[categoryId])} (current: ${cat.score})`);

      const newScore = await question(rl, `  New score [1-10, Enter to keep]: `);
      if (newScore && !isNaN(parseInt(newScore))) {
        const score = Math.max(1, Math.min(10, parseInt(newScore)));
        if (score !== cat.score) {
          cat.score = score;
          cat.lastUpdated = getDateString();
          hasChanges = true;
          console.log(`  ${c('green', '✓')} Score updated to ${score}`);
        }
      }

      const newTrend = await question(rl, `  Trend [i/s/d, Enter to keep ${cat.trend}]: `);
      if (newTrend) {
        const trendMap = { 'i': 'increasing', 's': 'stable', 'd': 'decreasing' };
        const trend = trendMap[newTrend.toLowerCase()];
        if (trend && trend !== cat.trend) {
          cat.trend = trend;
          cat.lastUpdated = getDateString();
          hasChanges = true;
          console.log(`  ${c('green', '✓')} Trend updated to ${trend}`);
        }
      }

      const addFinding = await question(rl, `  Add finding? [y/N]: `);
      if (addFinding.toLowerCase() === 'y') {
        const finding = await question(rl, `  Finding text: `);
        if (finding.trim()) {
          cat.keyFindings.unshift(finding.trim());
          if (cat.keyFindings.length > 5) cat.keyFindings.pop();
          cat.lastUpdated = getDateString();
          hasChanges = true;
          console.log(`  ${c('green', '✓')} Finding added`);
        }
      }
    }
  }
}

function saveChanges(current) {
  // Recalculate aggregates
  current.domainScores = calculateDomainScores(current.scores);
  current.overallScore = calculateOverallScore(current.scores);
  current.riskLevel = getRiskLevel(current.overallScore);
  current.assessmentDate = getDateString();

  fs.writeFileSync(CURRENT_PATH, JSON.stringify(current, null, 2) + '\n');

  console.log('\n  ' + c('green', '✓') + ' Changes saved to data/current.json');
  console.log(`  New overall score: ${c(getScoreColor(current.overallScore), current.overallScore.toFixed(1))} (${current.riskLevel})\n`);
}

async function main() {
  const args = process.argv.slice(2);
  const current = JSON.parse(fs.readFileSync(CURRENT_PATH, 'utf8'));

  // Status only mode
  if (args.includes('--status') || args.includes('-s')) {
    showStatus(current);
    return;
  }

  // Command line update mode
  const categoryIdx = args.indexOf('--category');
  const scoreIdx = args.indexOf('--score');

  if (categoryIdx !== -1 && scoreIdx !== -1) {
    const categoryId = args[categoryIdx + 1];
    const newScore = parseInt(args[scoreIdx + 1]);

    if (CATEGORIES.includes(categoryId) && newScore >= 1 && newScore <= 10) {
      current.scores[categoryId].score = newScore;
      current.scores[categoryId].lastUpdated = getDateString();
      saveChanges(current);
      console.log(`Updated ${CATEGORY_NAMES[categoryId]} to ${newScore}`);
    } else {
      console.error('Invalid category or score');
      process.exit(1);
    }
    return;
  }

  // Interactive mode
  showStatus(current);

  const rl = createInterface();
  const shouldSave = await quickUpdate(rl, current);

  if (shouldSave) {
    saveChanges(current);
  }

  rl.close();
}

main().catch(console.error);
