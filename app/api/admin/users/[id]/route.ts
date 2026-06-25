import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();
    const body = await request.json();
    const { role } = body;

    if (role && !['ADMIN', 'MEMBER'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const user = await db.updateUser(id, body);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'admin.user.updated',
      metaJson: JSON.stringify({ targetUserId: id, changes: body }),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await requireAdmin();

    const user = await db.findUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.deleteUserWithData(id);

    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'admin.user.deleted',
      metaJson: JSON.stringify({ targetUserId: id, email: user.email }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
