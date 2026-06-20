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

const createSourceSchema = z.object({
  productId: z.string(),
  categoryId: z.string(),
  name: z.string().min(1),
  urls: z.array(sourceUrlSchema).min(1).optional(), // New format
  url: z.string().url().optional(), // Legacy
  type: z.enum(['RSS', 'HTML', 'JSON']).optional(), // Legacy
  isActive: z.boolean(),
  selector: z.string().nullable().optional(), // Legacy
});

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validatedData = createSourceSchema.parse(body);

    const source = await db.createSource({
      id: db.generateId(),
      productId: validatedData.productId,
      categoryId: validatedData.categoryId,
      name: validatedData.name,
      urls: validatedData.urls, // New format
      url: validatedData.url, // Legacy
      type: validatedData.type, // Legacy
      isActive: validatedData.isActive,
      selector: validatedData.selector || null, // Legacy
      sort: 0, // Will be set based on existing sources
    });

    return NextResponse.json({ success: true, source });
  } catch (error) {
    console.error('Error creating source:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
