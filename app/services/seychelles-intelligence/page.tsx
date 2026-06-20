import { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Clock01Icon, GlobeIcon } from 'hugeicons-react';
import { pageConfigs, generateStructuredData } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: pageConfigs.seychellesIntelligence.title,
  description: pageConfigs.seychellesIntelligence.description,
  keywords: pageConfigs.seychellesIntelligence.keywords,
  openGraph: {
    title: pageConfigs.seychellesIntelligence.title,
    description: pageConfigs.seychellesIntelligence.description,
    url: '/services/seychelles-intelligence',
  },
  twitter: {
    title: pageConfigs.seychellesIntelligence.title,
    description: pageConfigs.seychellesIntelligence.description,
  },
  alternates: {
    canonical: '/services/seychelles-intelligence',
  },
};

export default function SeychellesIntelligencePage() {
  const structuredData = generateStructuredData(
    pageConfigs.seychellesIntelligence.structuredData
  );

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <Container>
          <div className='text-center max-w-4xl mx-auto'>
            <div className='w-20 h-20 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <GlobeIcon className='w-10 h-10 text-leaf-600' />
            </div>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-6 leading-tight'>
              Seychelles Intelligence
            </h1>
            <div className='inline-flex items-center gap-2 bg-leaf-100 text-leaf-700 px-4 py-2 rounded-full text-sm font-medium mb-6'>
              <Clock01Icon className='w-4 h-4' />
              Coming Soon
            </div>
            <p className='text-xl text-leaf-700 leading-relaxed mb-8'>
              Advanced intelligence and compliance monitoring services
              specifically designed for the Seychelles jurisdiction.
              Comprehensive surveillance, analysis, and reporting to support
              your regulatory compliance needs.
            </p>
            <Button href='/contact' size='lg'>
              Get Notified When Available
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
