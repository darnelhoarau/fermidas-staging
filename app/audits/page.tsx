import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { siteContent } from '@/lib/content';
import {
  CheckmarkCircle01Icon,
  Target01Icon,
  Search01Icon,
  Clock01Icon,
  File01Icon,
} from 'hugeicons-react';
import { ImageSkeleton } from '@/components/ImageSkeleton';
import { pageConfigs, generateStructuredData } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: pageConfigs.audits.title,
  description: pageConfigs.audits.description,
  keywords: pageConfigs.audits.keywords,
  openGraph: {
    title: pageConfigs.audits.title,
    description: pageConfigs.audits.description,
    url: '/audits',
  },
  twitter: {
    title: pageConfigs.audits.title,
    description: pageConfigs.audits.description,
  },
  alternates: {
    canonical: '/audits',
  },
};

const auditProcess = [
  {
    step: '01',
    title: 'Initial Assessment',
    description:
      'Comprehensive review of current compliance posture and identification of audit scope.',
  },
  {
    step: '02',
    title: 'Gap Analysis',
    description:
      'Detailed analysis of gaps between current practices and required standards.',
  },
  {
    step: '03',
    title: 'Readiness Evaluation',
    description:
      'Assessment of organisational readiness for formal certification processes.',
  },
  {
    step: '04',
    title: 'Implementation Support',
    description:
      'Guidance and support for implementing required changes and improvements.',
  },
  {
    step: '05',
    title: 'Pre-certification Audit',
    description: 'Final audit to ensure readiness for regulatory conformity.',
  },
];

export default function AuditsPage() {
  const structuredData = generateStructuredData(
    pageConfigs.audits.structuredData
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
              Quality Assurance & Control Audits
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              {siteContent.audits.description}
            </p>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <Section
        title='Our Audit Approach'
        eyebrow='Methodology'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Independent & Comprehensive
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our audit approach combines independent assessment with
              comprehensive analysis to provide actionable insights for
              improving your compliance framework and operational integrity.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Independent third-party assessment
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Comprehensive gap analysis
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Actionable recommendations
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Ongoing support and guidance
                </span>
              </div>
            </div>
          </div>

          <div className='bg-mint rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Audit Benefits:
            </h4>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Enhanced operational efficiency
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Improved risk management
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Regulatory compliance assurance
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Stakeholder confidence
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Competitive advantage
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                <ImageSkeleton
                  src='/our-audit-approach.jpg'
                  alt='Audit Benefits Visualization'
                  className='w-full h-48 object-cover rounded-lg'
                />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Services */}
      <Section
        title='Our Audit Services'
        eyebrow='What We Offer'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {siteContent.audits.services.map((service, index) => (
            <Card key={index} className='p-6'>
              <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                {index === 0 && (
                  <CheckmarkCircle01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 1 && (
                  <Target01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 2 && (
                  <Search01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 3 && (
                  <Clock01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 4 && (
                  <File01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {service}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* Audit Process */}
      <Section
        title='Our Audit Process'
        eyebrow='Step-by-Step'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8'>
          {auditProcess.map((step, index) => (
            <div key={index} className='text-center'>
              <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='font-display text-xl font-bold text-leaf-600'>
                  {step.step}
                </span>
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {step.title}
              </h3>
              <p className='text-leaf-700 text-sm leading-relaxed'>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Readiness Assessments */}
      <Section
        title='Readiness Assessments'
        eyebrow='Pre-Certification'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='bg-white rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Assessment Components:
            </h4>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Documentation review
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Process evaluation
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Staff competency assessment
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>Risk assessment</span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Gap analysis report
                  </span>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                  <span className='text-sm text-leaf-700'>
                    Implementation roadmap
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                <ImageSkeleton
                  src='/readiness-assessments.jpg'
                  alt='Assessment Components Visualization'
                  className='w-full h-48 object-cover rounded-lg'
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Comprehensive Evaluation
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our readiness assessments provide a thorough evaluation of your
              organisation's preparedness for certification processes,
              identifying strengths, weaknesses, and specific areas for
              improvement.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Detailed gap analysis</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Actionable recommendations
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Implementation timeline</span>
              </div>
            </div>
            <div className='mt-8'>
              <Button href='/contact'>Schedule an assessment</Button>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className='py-16 bg-gradient-to-r from-leaf-600 to-brand'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-foreground mb-4'>
              Ready to strengthen your operational integrity?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss how our independent audits can help your
              organisation achieve regulatory compliance and long-term
              operational excellence.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' variant='secondary' size='lg'>
                Speak with an advisor
              </Button>
              <Button
                href='/contact'
                variant='ghost'
                size='lg'
                className='text-brand-foreground hover:bg-white hover:text-brand'
              >
                Schedule an assessment
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
