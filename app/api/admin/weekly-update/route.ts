import { NextResponse } from 'next/server';
import currentData from '@/data/current.json';
import categoriesData from '@/data/categories.json';
import { CurrentAssessment, CategoriesData } from '@/lib/types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const current = currentData as CurrentAssessment;
const categories = (categoriesData as CategoriesData).categories;

function buildResearchPrompt(): string {
  const scoresSummary = categories.map((cat) => {
    const s = current.scores[cat.id];
    return `- ${cat.name} (${cat.id}): score=${s?.score || '?'}, trend=${s?.trend || '?'}, findings: ${(s?.keyFindings || []).join(' | ')}`;
  }).join('\n');

  return `You are a senior political risk analyst conducting a weekly assessment of US political risk.

Current date: ${new Date().toISOString().split('T')[0]}
Assessment period: trailing 12 months

Current scores and findings:
${scoresSummary}

SCORING SCALE: 1-10 where 1=low risk, 10=severe risk
RISK LEVELS: Low (1-2), Moderate (3-4), Elevated (5-6), High (7-8), Severe (9-10)

For EACH of the 10 categories, research recent developments and:
1. Propose whether the score should change, stay the same, or shift
2. Provide 3 key findings with source attribution
3. Note the trend direction
4. Provide a brief justification

Respond ONLY with valid JSON in this exact format:
{
  "proposals": [
    {
      "categoryId": "elections",
      "proposedScore": 8,
      "trend": "increasing",
      "keyFindings": [
        "Finding 1 with attribution (Source Name)",
        "Finding 2 with attribution (Source Name)",
        "Finding 3 with attribution (Source Name)"
      ],
      "sources": [
        "https://example.com/source1",
        "https://example.com/source2"
      ],
      "justification": "2-3 sentence explanation of score and any changes"
    }
  ]
}

Include ALL 10 categories. Be specific about recent events. Use concrete dates and facts.`;
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    if (action !== 'research') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: 'You are a senior political risk analyst. Respond only with valid JSON.',
        messages: [
          {
            role: 'user',
            content: buildResearchPrompt(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      return NextResponse.json({ error: 'AI research failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Invalid response format from AI' }, { status: 500 });
    }

    const sanitizedJson = jsonMatch[0].replace(/:\s*\+(\d)/g, ': $1');
    const result = JSON.parse(sanitizedJson);

    // Enrich proposals with current scores
    const proposals = (result.proposals || []).map((p: { categoryId: string; proposedScore: number; trend: string; keyFindings: string[]; sources: string[]; justification: string }) => ({
      ...p,
      currentScore: current.scores[p.categoryId]?.score || 0,
    }));

    return NextResponse.json({ proposals });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Weekly update error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
