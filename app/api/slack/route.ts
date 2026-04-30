import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && !origin.includes(host.split(':')[0])) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Slack webhook not configured' }, { status: 500 });
  }

  const { text, imageUrl } = await req.json();

  if (!text || typeof text !== 'string') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const blocks = [
    {
      type: 'section',
      text: { type: 'mrkdwn', text },
    },
    ...(imageUrl
      ? [
          {
            type: 'image',
            image_url: imageUrl,
            alt_text: 'Birthday card',
          },
        ]
      : []),
  ];

  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ blocks }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('[slack]', res.status, body);
    return NextResponse.json({ error: 'Slack delivery failed' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
