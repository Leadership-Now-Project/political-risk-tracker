import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';
import scenariosData from '@/data/scenarios.json';

// GET: Return current scenarios
export async function GET() {
  return NextResponse.json(scenariosData);
}

// PUT: Save updated scenarios
export async function PUT(request: Request) {
  try {
    const { events } = await request.json();

    if (!Array.isArray(events)) {
      return NextResponse.json({ error: 'Invalid scenarios data' }, { status: 400 });
    }

    const updated = {
      events,
      likelihoodDescriptions: scenariosData.likelihoodDescriptions,
    };

    const content = JSON.stringify(updated, null, 2) + '\n';
    await writeFile(
      'data/scenarios.json',
      content,
      `Update scenarios via admin panel (${new Date().toISOString().split('T')[0]})`
    );

    return NextResponse.json({ success: true, count: events.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
