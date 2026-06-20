import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { CategoryManager } from './_components/CategoryManager';
import { AddCategoryButton } from './_components/AddCategoryButton';

export const metadata: Metadata = {
  title: 'Manage Categories | Admin',
  description: 'Organize source categories',
};

export default async function CategoriesPage() {
  await requireAdmin();

  const product = await db.findProductBySlug('compliance-watch');

  if (!product) {
    return <div>Product not found</div>;
  }

  const categories = await db.findCategoriesByProduct(product.id);

  return (
    <section className="bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28">
      <div className="container">
        <div className="mb-12">
          <Link
            href="/digital/admin/compliance-watch"
            className="mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display mb-4 text-2xl font-bold text-brand md:text-4xl">
                Manage Categories
              </h1>
              <p className="text-lg text-leaf-700">
                Organize and reorder source categories
              </p>
            </div>
            <AddCategoryButton productId={product.id} />
          </div>
        </div>

        <CategoryManager categories={categories} />
      </div>
    </section>
  );
}

