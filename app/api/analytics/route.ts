import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const websiteId = process.env.UMAMI_WEBSITE_ID ?? 'default';
  const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_URL ?? 'http://localhost:3000/script.js';

  return NextResponse.json({
    ok: true,
    scriptUrl,
    websiteId,
    message: 'Umami analytics is configured for the site.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    return NextResponse.json({
      ok: true,
      event: payload?.event ?? 'custom_event',
      payload,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid analytics payload.' }, { status: 400 });
  }
}
