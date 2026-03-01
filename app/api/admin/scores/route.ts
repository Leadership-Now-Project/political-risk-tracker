import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';
import categoriesData from '@/data/categories.json';
import currentData from '@/data/current.json';
import { CategoriesData, CurrentAssessment, CategoryScore, DomainScores } from '@/lib/types';
import { getRiskLevel } from '@/lib/risk-levels';

// GET: Return current data for the editor
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');

  if (file === 'categories') {
    return NextResponse.json(categoriesData);
  }
  return NextResponse.json(currentData);
}

// PUT: Save updated scores
export async function PUT(request: Request) {
  try {
    const { scores } = await request.json() as { scores: Record<string, CategoryScore> };

    if (!scores || typeof scores !== 'object') {
      return NextResponse.json({ error: 'Invalid scores data' }, { status: 400 });
    }

    // Recalculate domain scores
    const categories = (categoriesData as CategoriesData).categories;
    const current = currentData as CurrentAssessment;

    const domainCategories: Record<string, string[]> = {
      'rule-of-law': [],
      'operating-economic': [],
      'societal-institutional': [],
    };
    categories.forEach((cat) => {
      if (domainCategories[cat.domain]) {
        domainCategories[cat.domain].push(cat.id);
      }
    });

    const domainScores: DomainScores = {
      'rule-of-law': 0,
      'operating-economic': 0,
      'societal-institutional': 0,
    };

    for (const [domainId, catIds] of Object.entries(domainCategories)) {
      const sum = catIds.reduce((acc, id) => acc + (scores[id]?.score || 0), 0);
      domainScores[domainId as keyof DomainScores] = Math.round((sum / catIds.length) * 100) / 100;
    }

    // Recalculate overall score
    const allScores = Object.values(scores).map((s) => s.score);
    const overallScore = Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10;

    // Build updated current.json
    const updated: CurrentAssessment = {
      ...current,
      scores,
      domainScores,
      overallScore,
      riskLevel: getRiskLevel(overallScore),
      assessmentDate: new Date().toISOString().split('T')[0],
    };

    // Commit to GitHub
    const content = JSON.stringify(updated, null, 2) + '\n';
    await writeFile(
      'data/current.json',
      content,
      `Update scores via admin panel (${new Date().toISOString().split('T')[0]})`
    );

    return NextResponse.json({ success: true, overallScore, domainScores });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
