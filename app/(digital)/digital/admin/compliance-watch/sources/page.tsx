import { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { AddSourceButton } from './_components/AddSourceButton';
import { TestSourceButton } from './_components/TestSourceButton';
import { EditSourceButton } from './_components/EditSourceButton';

export const metadata: Metadata = {
  title: 'Manage Sources | Admin',
  description: 'Configure Compliance Watch sources',
};

export default async function SourcesPage() {
  await requireAdmin();

  const product = await db.findProductBySlug('compliance-watch');

  if (!product) {
    return <div>Product not found</div>;
  }

  const categories = await db.findCategoriesWithSources(product.id);

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <Link
            href='/digital/admin/compliance-watch'
            className='mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back to Dashboard
          </Link>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
                Manage Sources
              </h1>
              <p className='text-lg text-leaf-700'>
                Configure URLs, selectors, and active status
              </p>
            </div>
            <AddSourceButton productId={product.id} />
          </div>
        </div>

        <div className='space-y-8'>
          {categories.map(
            (category: {
              id: string;
              name: string;
              sources: Array<{
                id: string;
                name: string;
                url: string;
                type: string;
                urls?: Array<{ url: string; type: string }>;
                is_active: boolean;
                last_checked_at: Date | null;
                selector?: string | null;
              }>;
            }) => (
              <div key={category.id}>
                <h2 className='mb-4 text-xl font-bold text-brand'>
                  {category.name}
                </h2>
                <div className='card divide-y divide-leaf-100'>
                  {category.sources.length === 0 ? (
                    <div className='p-6 text-center text-leaf-600'>
                      No sources in this category
                    </div>
                  ) : (
                    category.sources.map(
                      (source: {
                        id: string;
                        name: string;
                        url: string;
                        type: string;
                        urls?: Array<{ url: string; type: string }>;
                        is_active: boolean;
                        last_checked_at: Date | null;
                        selector?: string | null;
                      }) => (
                        <div key={source.id} className='p-4'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                              <div className='mb-1 flex items-center gap-3'>
                                <h3 className='font-semibold text-brand'>
                                  {source.name}
                                </h3>
                                <span
                                  className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                                    source.is_active
                                      ? 'bg-success/10 text-success'
                                      : 'bg-leaf-100 text-leaf-700'
                                  }`}
                                >
                                  {source.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className='rounded-lg bg-leaf-100 px-2 py-0.5 text-xs font-semibold text-leaf-800'>
                                  {source.type}
                                </span>
                                {source.urls &&
                                  Array.isArray(source.urls) &&
                                  source.urls.length > 1 && (
                                    <span className='rounded-lg bg-leaf-200 px-2 py-0.5 text-xs font-semibold text-leaf-800'>
                                      {source.urls.length} URLs
                                    </span>
                                  )}
                              </div>
                              {/* Display all URLs */}
                              <div className='mb-2 space-y-1'>
                                {source.urls &&
                                Array.isArray(source.urls) &&
                                source.urls.length > 0 ? (
                                  source.urls.map(
                                    (
                                      urlObj: { url: string; type: string },
                                      idx: number
                                    ) => (
                                      <a
                                        key={idx}
                                        href={urlObj.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        className='block text-sm text-leaf-700 hover:underline'
                                      >
                                        {urlObj.url}
                                      </a>
                                    )
                                  )
                                ) : (
                                  <a
                                    href={source.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='block text-sm text-leaf-700 hover:underline'
                                  >
                                    {source.url}
                                  </a>
                                )}
                              </div>
                              {source.last_checked_at && (
                                <div className='text-xs text-leaf-600'>
                                  Last checked:{' '}
                                  {new Date(
                                    source.last_checked_at
                                  ).toLocaleString()}
                                </div>
                              )}
                            </div>
                            <div className='flex gap-2'>
                              <TestSourceButton
                                sourceId={source.id}
                                sourceName={source.name}
                              />
                              <EditSourceButton
                                source={{
                                  id: source.id,
                                  name: source.name,
                                  url: source.url,
                                  type: source.type,
                                  urls: source.urls?.map((u) => ({
                                    url: u.url,
                                    type:
                                      u.type === 'RSS' ||
                                      u.type === 'HTML' ||
                                      u.type === 'JSON'
                                        ? u.type
                                        : ('HTML' as 'RSS' | 'HTML' | 'JSON'),
                                    css_list_selector: null,
                                    css_item_selector: null,
                                    css_content_selector: null,
                                    xpath_item: null,
                                    xpath_content: null,
                                  })),
                                  selector: source.selector,
                                  isActive: source.is_active,
                                  categoryId: category.id,
                                }}
                                productId={product.id}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
