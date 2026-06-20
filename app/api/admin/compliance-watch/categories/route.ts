import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { z } from 'zod';

const createCategorySchema = z.object({
  productId: z.string(),
  name: z.string().min(1),
  isActive: z.boolean(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const categories = await db.findCategoriesByProduct(productId);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json();
    const { productId, name, isActive } = createCategorySchema.parse(body);

    // Get the next sort order
    const categories = await db.findCategoriesByProduct(productId);
    const nextSort = categories.length;

    const category = await db.createCategory({
      id: `cat-${Date.now()}`,
      productId,
      name,
      isActive,
      sort: nextSort,
    });

    // Log the change
    await db.createAuditLog({
      actorUserId: session.user.id,
      action: 'category.created',
      metaJson: JSON.stringify({
        categoryId: category.id,
        name,
        isActive,
      }),
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Category creation error:', error);

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