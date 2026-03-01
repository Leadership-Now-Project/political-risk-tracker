import { NextResponse } from 'next/server';
import { readFile, commitMultipleFiles } from '@/lib/github';
import currentData from '@/data/current.json';
import { CurrentAssessment } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { summary, keyDevelopments, categoryChanges } = await request.json();

    if (!summary) {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    const current = currentData as CurrentAssessment;
    const now = new Date();
    const snapshotDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-20`;
    const periodLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // 1. Build history snapshot (scores only)
    const snapshot = {
      date: snapshotDate,
      scores: Object.fromEntries(
        Object.entries(current.scores).map(([k, v]) => [k, v.score])
      ),
      domainScores: current.domainScores,
      overallScore: current.overallScore,
      riskLevel: current.riskLevel,
    };

    // 2. Read and update historical-changes.json
    const { content: histContent } = await readFile('data/historical-changes.json');
    const histData = JSON.parse(histContent);
    const prevOverall = histData.changes.length > 0
      ? histData.changes[histData.changes.length - 1].overallScore
      : current.overallScore;

    histData.changes.push({
      period: periodLabel,
      date: snapshotDate,
      overallScore: current.overallScore,
      overallChange: Math.round((current.overallScore - prevOverall) * 10) / 10,
      summary,
      keyDevelopments: keyDevelopments || [],
      categoryChanges: categoryChanges || [],
    });

    // 3. Read and update history page imports
    const { content: histPageContent } = await readFile('app/history/page.tsx');
    const yearMonth = snapshotDate.slice(0, 7).replace('-', '');

    // Check if import already exists
    if (histPageContent.includes(snapshotDate)) {
      return NextResponse.json({ error: `Snapshot for ${snapshotDate} already exists` }, { status: 400 });
    }

    // Add import line after the last history import
    const importLine = `import history${yearMonth} from '@/data/history/${snapshotDate}.json';`;
    const lastImportRegex = /(import history\d+ from '@\/data\/history\/[^']+';)\n/g;
    let lastMatch = null;
    let match;
    while ((match = lastImportRegex.exec(histPageContent)) !== null) {
      lastMatch = match;
    }

    let updatedHistPage = histPageContent;
    if (lastMatch) {
      const insertPos = lastMatch.index + lastMatch[0].length;
      updatedHistPage = histPageContent.slice(0, insertPos) + importLine + '\n' + histPageContent.slice(insertPos);
    }

    // Add to historicalSnapshots array
    const castLine = `  history${yearMonth} as HistoricalSnapshot,`;
    const arrayEndRegex = /(\s+)(history\d+ as HistoricalSnapshot,)\n(\s*\];)/;
    const arrayMatch = updatedHistPage.match(arrayEndRegex);
    if (arrayMatch) {
      updatedHistPage = updatedHistPage.replace(
        arrayEndRegex,
        `$1$2\n$1${castLine.trim()}\n$3`
      );
    }

    // 4. Commit all files atomically
    const files = [
      {
        path: `data/history/${snapshotDate}.json`,
        content: JSON.stringify(snapshot, null, 2) + '\n',
      },
      {
        path: 'data/historical-changes.json',
        content: JSON.stringify(histData, null, 2) + '\n',
      },
      {
        path: 'app/history/page.tsx',
        content: updatedHistPage,
      },
    ];

    await commitMultipleFiles(
      files,
      `Monthly snapshot: ${periodLabel} (${snapshotDate})`
    );

    return NextResponse.json({
      success: true,
      date: snapshotDate,
      filesCommitted: files.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
