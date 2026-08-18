import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { sendRegistrationPendingNotification } from '@/lib/email/registration';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => ({}));
    const to = typeof body.to === 'string' ? body.to.trim() : '';

    if (!to) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    try {
      await sendRegistrationPendingNotification(to, {
        name: 'Test User',
        email: 'test@example.com',
      });
      return NextResponse.json({ ok: true });
    } catch (error) {
      console.error('Test notification email error:', error);
      return NextResponse.json(
        {
          ok: false,
          error:
            error instanceof Error ? error.message : 'Email send failed',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 },
    );
  }
}