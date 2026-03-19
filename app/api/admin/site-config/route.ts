import { NextResponse } from 'next/server';
import { writeFile } from '@/lib/github';
import siteConfig from '@/data/site-config.json';

// GET: Return current site config
export async function GET() {
  return NextResponse.json(siteConfig);
}

// PUT: Save updated site config
export async function PUT(request: Request) {
  try {
    const updates = await request.json();

    const newConfig = {
      ...siteConfig,
      pages: {
        ...siteConfig.pages,
        ...updates.pages,
      },
    };

    await writeFile(
      'data/site-config.json',
      JSON.stringify(newConfig, null, 2) + '\n',
      'Update site config (page visibility)'
    );

    return NextResponse.json({ success: true, config: newConfig });
  } catch (error) {
    console.error('Error saving site config:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save config' },
      { status: 500 }
    );
  }
}
