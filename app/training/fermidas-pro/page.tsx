import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ImageSkeleton } from '@/components/ImageSkeleton';
import { pageConfigs, generateStructuredData } from '@/lib/seo-config';

import { siteContent } from '@/lib/content';

export const metadata: Metadata = {
  title: pageConfigs.training.title,
  description: pageConfigs.training.description,
  keywords: pageConfigs.training.keywords,
  openGraph: {
    title: pageConfigs.training.title,
    description: pageConfigs.training.description,
    url: '/training/fermidas-pro',
  },
  twitter: {
    title: pageConfigs.training.title,
    description: pageConfigs.training.description,
  },
  alternates: {
    canonical: '/training/fermidas-pro',
  },
};

const deliveryFormats = [
  {
    title: 'Fermidas Pro App',
    description:
      'Interactive online platform with progress tracking and certificates',
    features: [
      'Self-paced learning',
      'Progress tracking',
      'Interactive assessments',
      'Mobile responsive',
    ],
  },
  {
    title: 'In-class Workshops',
    description: 'Hands-on training sessions with expert facilitators',
    features: [
      'Expert-led sessions',
      'Group discussions',
      'Practical exercises',
      'Q&A opportunities',
    ],
  },
  {
    title: 'Live Sessions',
    description: 'Real-time virtual training with interactive elements',
    features: [
      'Live instruction',
      'Real-time Q&A',
      'Virtual breakout rooms',
      'Recorded sessions',
    ],
  },
  {
    title: 'Self-paced Learning',
    description: 'Flexible modules for individual study and review',
    features: [
      '24/7 access',
      'Flexible scheduling',
      'Review capabilities',
      'Certificate upon completion',
    ],
  },
];

export default function FermidasProPage() {
  const structuredData = generateStructuredData(
    pageConfigs.training.structuredData
  );

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Fermidas Pro Training Platform
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              {siteContent.fermidasPro.description}
            </p>
          </div>
        </div>
      </section>

      {/* Tiered Levels */}
      <Section
        title='Training Tiers'
        eyebrow='Progressive Learning'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {siteContent.fermidasPro.tiers.map((tier, index) => (
            <Card key={index} className='p-8 hover:shadow-lg transition-shadow'>
              <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                <span className='font-display text-lg font-bold text-leaf-600'>
                  {index + 1}
                </span>
              </div>
              <h3 className='font-display text-xl font-semibold text-brand mb-2'>
                {tier.title}
              </h3>
              <p className='text-leaf-700 mb-4 leading-relaxed'>
                {tier.description}
              </p>
              <div className='space-y-2'>
                {tier.modules.map((module, moduleIndex) => (
                  <div key={moduleIndex} className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-600'>{module}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Training Modules */}
      <Section
        title='Training Modules'
        eyebrow='Comprehensive Coverage'
        className='bg-mint'
      >
        <div className='mb-12'>
          <p className='text-center text-leaf-700 max-w-3xl mx-auto mb-8'>
            Our comprehensive training modules cover essential compliance topics
            with interactive content, assessments, and practical applications.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
          {siteContent.fermidasPro.modules.map((module, index) => (
            <Card key={index} className='p-6'>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {module.title}
              </h3>
              <p className='text-leaf-700 text-sm'>{module.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Delivery Formats */}
      <Section
        title='Delivery Formats'
        eyebrow='How We Deliver'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {deliveryFormats.map((format, index) => (
            <Card key={index} className='p-8'>
              <h3 className='font-display text-xl font-semibold text-brand mb-2'>
                {format.title}
              </h3>
              <p className='text-leaf-700 mb-4'>{format.description}</p>
              <div className='space-y-2'>
                {format.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-600'>{feature}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Certificates & Analytics */}
      <Section
        title='Certificates & Analytics'
        eyebrow='Track Progress'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Professional Certificates
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Upon successful completion of training modules, participants
              receive professional certificates that demonstrate their
              compliance knowledge and commitment to ongoing professional
              development.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Industry-recognised certificates
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Continuing education credits
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Digital and printable formats
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Analytics & Visibility:
            </h4>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Individual progress tracking
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Team completion reports
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Compliance dashboard
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Management oversight
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Regulatory reporting
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                <ImageSkeleton
                  src='/certificates-and-analytics.jpg'
                  alt='Analytics Dashboard Preview'
                  className='w-full h-48 object-cover rounded-lg'
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className='py-16 bg-gradient-to-r from-leaf-600 to-brand'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-foreground mb-4'>
              Ready to enhance your compliance training?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Book a demo to see how Fermidas Pro can transform your
              organisation's compliance training and professional development.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' variant='secondary' size='lg'>
                Book a training demo
              </Button>
              <Button
                href='/contact'
                variant='ghost'
                size='lg'
                className='text-brand-foreground hover:bg-white hover:text-brand'
              >
                Request pricing
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
