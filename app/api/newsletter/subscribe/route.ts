import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const subscribeSchema = z.object({
  email: z.email('Please provide a valid email address.'),
  name: z.string().trim().optional(),
});

let cachedListUuid: string | null = null;

async function getTargetListUuid(listmonkUrl: string): Promise<string[]> {
  if (process.env.LISTMONK_LIST_UUID) {
    return [process.env.LISTMONK_LIST_UUID];
  }

  if (cachedListUuid) {
    return [cachedListUuid];
  }

  try {
    const listsRes = await fetch(new URL('/api/public/lists', listmonkUrl), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });

    if (listsRes.ok) {
      const lists = (await listsRes.json()) as Array<{ uuid: string; name: string }>;
      if (Array.isArray(lists) && lists.length > 0) {
        cachedListUuid = lists[0].uuid;
        return [lists[0].uuid];
      }
    }
  } catch {
    // ignore list fetch failure and proceed with empty or fallback
  }

  return [];
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = subscribeSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message ?? 'Please provide a valid email address.' },
        { status: 400 },
      );
    }

    const listmonkUrl = process.env.LISTMONK_URL ?? 'http://listmonk:9000';
    const { email, name } = parsed.data;

    const apiUser = process.env.LISTMONK_API_USER;
    const apiToken = process.env.LISTMONK_API_TOKEN ?? process.env.LISTMONK_API_KEY;

    if (apiUser && apiToken) {
      // Authenticated admin subscriber creation
      const adminRes = await fetch(new URL('/api/subscribers', listmonkUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${apiUser}:${apiToken}`).toString('base64')}`,
        },
        body: JSON.stringify({
          email,
          name: name ?? '',
          status: 'enabled',
          lists: [1],
          preconfirm_subscriptions: true,
        }),
      });

      if (adminRes.ok || adminRes.status === 409) {
        return NextResponse.json({ ok: true, message: 'Subscribed successfully.' });
      }
    }

    // Public subscription flow
    const listUuids = await getTargetListUuid(listmonkUrl);
    const publicRes = await fetch(new URL('/api/public/subscription', listmonkUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name ?? '',
        list_uuids: listUuids,
      }),
    });

    if (publicRes.ok || publicRes.status === 409) {
      return NextResponse.json({ ok: true, message: 'Subscribed successfully.' });
    }

    const errorData = await publicRes.json().catch(() => ({}));
    return NextResponse.json(
      { ok: false, error: errorData?.message ?? 'The subscription service is unavailable right now.' },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The subscription service is unavailable right now.' },
      { status: 500 },
    );
  }
}
