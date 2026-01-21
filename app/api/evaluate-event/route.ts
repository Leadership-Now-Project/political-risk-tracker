import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const SYSTEM_PROMPT = `You are an expert political risk analyst. Your task is to evaluate how a hypothetical political event would impact risk scores across 10 categories in a US political risk assessment framework.

The 10 categories are:
1. elections - Electoral process integrity, voter access, constitutional compliance
2. rule-of-law - Judicial independence, constitutional adherence, equal application of law
3. national-security - Independence and professionalism of security/intelligence institutions
4. regulatory-stability - Predictability of regulatory environment, policy consistency
5. trade-policy - Trade agreements, tariff stability, economic nationalism
6. government-contracts - Fair contracting, political favoritism, procurement integrity
7. fiscal-policy - Federal Reserve independence, debt sustainability, fiscal responsibility
8. media-freedom - Press freedom, journalist safety, information environment
9. civil-discourse - Public discourse quality, social trust, political violence levels
10. institutional-integrity - Civil service independence, inspector general function, oversight

Scores range from 1 (low risk) to 10 (severe risk). Current US scores are in the 6-9 range for most categories.

For each event, analyze which categories would be affected and estimate the score CHANGE (delta), not absolute scores:
- Positive delta (+1, +2) means risk INCREASES (bad)
- Negative delta (-1, -2) means risk DECREASES (good)
- Most events affect 1-4 categories
- Deltas are typically -2 to +2; use larger values only for transformative events

Respond ONLY with valid JSON in this exact format:
{
  "impacts": [
    {"category": "category-id", "delta": <number>, "reason": "brief explanation"}
  ],
  "summary": "One sentence summary of the event's overall effect on political risk"
}`;

export async function POST(request: NextRequest) {
  try {
    const { eventDescription } = await request.json();

    if (!eventDescription || typeof eventDescription !== 'string') {
      return NextResponse.json(
        { error: 'Event description is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY not configured' },
        { status: 500 }
      );
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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Evaluate this hypothetical political event and its impact on US political risk scores:\n\n"${eventDescription}"`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to evaluate event' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }

    // Sanitize JSON: remove + signs before numbers (e.g., +3 -> 3)
    const sanitizedJson = jsonMatch[0].replace(/:\s*\+(\d)/g, ': $1');
    const evaluation = JSON.parse(sanitizedJson);

    // Validate the response structure
    if (!evaluation.impacts || !Array.isArray(evaluation.impacts)) {
      return NextResponse.json(
        { error: 'Invalid evaluation structure' },
        { status: 500 }
      );
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error evaluating event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
