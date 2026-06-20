import { Metadata } from 'next';
import React from 'react';
import * as db from '@/lib/db';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  SecurityCheckIcon,
  GraduateMaleIcon,
  Search01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Digital Products | Fermidas',
  description:
    'Subscription-based compliance and training solutions designed for Seychelles financial professionals.',
};

export const dynamic = 'force-dynamic';

const iconMap: Record<string, React.ReactElement> = {
  'compliance-watch': <SecurityCheckIcon className='w-6 h-6 text-leaf-600' />,
  training: <GraduateMaleIcon className='w-6 h-6 text-leaf-600' />,
  'training-solutions': <GraduateMaleIcon className='w-6 h-6 text-leaf-600' />,
  'adverse-screening': <Search01Icon className='w-6 h-6 text-leaf-600' />,
};

export default async function DigitalProductsPage() {
  const products = await db.findAllActiveProducts();

  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <p className='text-sm font-medium uppercase tracking-wide text-leaf-700 mb-4'>
              FERMIDAS
            </p>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Digital Products
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Subscription-based compliance and training solutions designed for
              Seychelles financial professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <Section className='bg-white'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {products.map((product) => (
            <Card
              key={product.id}
              className='p-8 hover:shadow-lg transition-shadow flex flex-col'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center'>
                  {iconMap[product.slug] || (
                    <SecurityCheckIcon className='w-6 h-6 text-leaf-600' />
                  )}
                </div>
                <h3 className='font-display text-xl font-semibold text-brand'>
                  {product.name}
                </h3>
              </div>
              <p className='text-leaf-700 mb-6 leading-relaxed flex-grow'>
                {product.description}
              </p>
              <Button
                href={`/digital/${product.slug}`}
                variant='ghost'
                className='mt-auto self-start'
              >
                Learn More →
              </Button>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
