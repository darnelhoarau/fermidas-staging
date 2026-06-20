import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { z } from 'zod';

const sourceUrlSchema = z.object({
  url: z.string().url(),
  type: z.enum(['RSS', 'HTML', 'JSON']),
  css_list_selector: z.string().nullable().optional(),
  css_item_selector: z.string().nullable().optional(),
  css_content_selector: z.string().nullable().optional(),
  xpath_item: z.string().nullable().optional(),
  xpath_content: z.string().nullable().optional(),
});

const updateSourceSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1).optional(),
  urls: z.array(sourceUrlSchema).min(1).optional(), // New format
  url: z.string().url().optional(), // Legacy - for backward compatibility
  type: z.enum(['RSS', 'HTML', 'JSON']).optional(), // Legacy
  isActive: z.boolean().optional(),
  selector: z.string().nullable().optional(), // Legacy
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const validatedData = updateSourceSchema.parse(body);

    const source = await db.updateSource(id, validatedData);

    return NextResponse.json({ success: true, source });
  } catch (error) {
    console.error('Error updating source:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update source' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    await db.deleteSource(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting source:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
