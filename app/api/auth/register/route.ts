import { NextRequest, NextResponse } from 'next/server';
import * as db from '@/lib/db';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { sendRegistrationPendingNotification } from '@/lib/email/registration';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerSchema.parse(body);

    // Check if user exists
    const existing = await db.findUserByEmail(email);

    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user (pending approval — admin must approve before sign-in)
    const user = await db.createUser({
      email,
      password: hashedPassword,
      name,
      role: 'MEMBER',
      registrationStatus: 'pending',
    });

    // Notify the configured admin email(s) — fire-and-forget, never blocks signup
    try {
      const notifySetting = await db.getSetting('registration_notify_email');
      if (notifySetting?.value_json) {
        const notifyTo = JSON.parse(notifySetting.value_json);
        if (typeof notifyTo === 'string' && notifyTo.trim()) {
          await sendRegistrationPendingNotification(notifyTo, {
            name,
            email,
          });
        }
      }
    } catch (error) {
      console.error('Registration notification error:', error);
    }

    return NextResponse.json({
      message: 'Account created — awaiting admin approval',
      pending: true,
      userId: user.id,
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

