import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';
import actionsData from '@/data/actions-pushback.json';

// GET: Return current actions data
export async function GET() {
  return NextResponse.json(actionsData);
}

// PUT: Save updated actions and pushback
export async function PUT(request: Request) {
  try {
    const { actions, pushback } = await request.json();

    if (!Array.isArray(actions) || !Array.isArray(pushback)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Recalculate summary
    const totalActions = actions.length;
    const totalLegalChallenges = pushback.length;
    const blockedOrReversed = actions.filter(
      (a: { status: string }) => a.status === 'blocked' || a.status === 'reversed'
    ).length;
    const implemented = actions.filter(
      (a: { status: string }) => a.status === 'implemented'
    ).length;
    const implementationRate = totalActions > 0 ? Math.round((implemented / totalActions) * 100) / 100 : 0;

    // Build category summaries
    const categoryMap: Record<string, { total: number; blocked: number; implemented: number; pending: number; legal: number }> = {};
    actions.forEach((a: { category: string; status: string }) => {
      if (!categoryMap[a.category]) {
        categoryMap[a.category] = { total: 0, blocked: 0, implemented: 0, pending: 0, legal: 0 };
      }
      categoryMap[a.category].total++;
      if (a.status === 'blocked' || a.status === 'reversed') categoryMap[a.category].blocked++;
      if (a.status === 'implemented') categoryMap[a.category].implemented++;
      if (a.status === 'pending-litigation') categoryMap[a.category].pending++;
    });
    const categorySummaries = Object.entries(categoryMap).map(([category, data]) => ({
      category,
      totalActions: data.total,
      blocked: data.blocked,
      implemented: data.implemented,
      pendingLitigation: data.pending,
      legalChallenges: pushback.filter((p: { actionIds?: string[] }) =>
        p.actionIds?.some((id: string) =>
          actions.some((a: { id: string; category: string }) => a.id === id && a.category === category)
        )
      ).length,
    }));

    const updated = {
      lastUpdated: new Date().toISOString().split('T')[0],
      summary: {
        totalActions,
        totalLegalChallenges,
        blockedOrReversed,
        implementationRate,
        categorySummaries,
      },
      actions,
      pushback,
    };

    const content = JSON.stringify(updated, null, 2) + '\n';
    await writeFile(
      'data/actions-pushback.json',
      content,
      `Update actions & pushback via admin panel (${new Date().toISOString().split('T')[0]})`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
