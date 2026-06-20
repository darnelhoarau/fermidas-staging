import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  Search01Icon,
  Shield01Icon,
  GlobeIcon,
  UserGroupIcon,
  Alert01Icon,
  CheckmarkCircle01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Adverse Screening Report',
  description:
    'Bespoke adverse screening reports for designated individuals and entities with comprehensive risk domain analysis.',
  openGraph: {
    title: 'Adverse Screening Report',
    description:
      'Comprehensive adverse screening reports for enhanced due diligence and risk assessment.',
  },
};

const riskDomains = [
  'Legal & Regulatory Exposure',
  'Financial Integrity & Compliance',
  'Reputational & Media Monitoring',
  'Political Affiliations & Governance',
  'Human Rights & ESG Considerations',
];

const reportFeatures = [
  {
    title: 'Comprehensive Analysis',
    description:
      'Detailed examination across multiple risk domains and data sources',
    icon: 'analysis',
  },
  {
    title: 'Bespoke Reports',
    description:
      'Tailored screening reports for specific individuals and entities',
    icon: 'bespoke',
  },
  {
    title: 'Multi-source Intelligence',
    description: 'Intelligence gathering from diverse and reliable sources',
    icon: 'intelligence',
  },
  {
    title: 'Risk Categorization',
    description:
      'Structured risk assessment with clear categorization and scoring',
    icon: 'categorization',
  },
];

const reportBenefits = [
  {
    title: 'Enhanced Due Diligence',
    description:
      'Strengthen your due diligence processes with comprehensive risk insights',
  },
  {
    title: 'Informed Decision Making',
    description: 'Support responsible engagement with detailed risk analysis',
  },
  {
    title: 'Regulatory Compliance',
    description:
      'Meet regulatory requirements with thorough screening documentation',
  },
  {
    title: 'Risk Mitigation',
    description:
      'Identify and assess potential risks before they impact your organization',
  },
];

const howWeWork = [
  {
    step: '01',
    title: 'Request Submission',
    description:
      'Submit screening request with designated individuals or entities for comprehensive analysis.',
  },
  {
    step: '02',
    title: 'Multi-domain Research',
    description:
      'Conduct thorough research across all key risk domains using multiple intelligence sources.',
  },
  {
    step: '03',
    title: 'Analysis & Assessment',
    description:
      'Analyze findings and provide structured risk assessment with clear categorization.',
  },
  {
    step: '04',
    title: 'Report Delivery',
    description:
      'Deliver comprehensive bespoke report with actionable insights and recommendations.',
  },
];

export default function AdverseScreeningReportPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Adverse Screening Report
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Fermidas Pro offers bespoke adverse screening reports for
              designated individuals and entities, delivering a comprehensive
              overview to support informed, responsible engagement. Each report
              is tailored and designed to strengthen your due diligence
              processes.
            </p>
          </div>
        </div>
      </section>

      {/* Risk Domains */}
      <Section
        title='Risk Analysis Domains'
        eyebrow='Comprehensive Coverage'
        className='bg-white'
      >
        <div className='mb-8'>
          <p className='text-center text-leaf-700 max-w-3xl mx-auto'>
            Our reports include detailed analysis across key risk domains to
            provide a complete risk profile:
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {riskDomains.map((domain, index) => (
            <Card key={index} className='p-6'>
              <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                {index === 0 && (
                  <Shield01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 1 && (
                  <CheckmarkCircle01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 2 && <GlobeIcon className='w-6 h-6 text-leaf-600' />}
                {index === 3 && (
                  <UserGroupIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 4 && (
                  <Alert01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {domain}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* Report Features */}
      <Section
        title='Report Features'
        eyebrow='What We Deliver'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {reportFeatures.map((feature, index) => (
            <Card key={index} className='p-6 text-center'>
              <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4'>
                {feature.icon === 'analysis' && (
                  <Search01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {feature.icon === 'bespoke' && (
                  <UserGroupIcon className='w-6 h-6 text-leaf-600' />
                )}
                {feature.icon === 'intelligence' && (
                  <GlobeIcon className='w-6 h-6 text-leaf-600' />
                )}
                {feature.icon === 'categorization' && (
                  <Shield01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {feature.title}
              </h3>
              <p className='text-leaf-700 text-sm'>{feature.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Report Benefits */}
      <Section
        title='Strategic Benefits'
        eyebrow='Why Choose Our Reports'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          {reportBenefits.map((benefit, index) => (
            <Card key={index} className='p-8 hover:shadow-lg transition-shadow'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center'>
                  {index === 0 && (
                    <CheckmarkCircle01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 1 && (
                    <Search01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 2 && (
                    <Shield01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 3 && (
                    <Alert01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                </div>
                <h3 className='font-display text-xl font-semibold text-brand'>
                  {benefit.title}
                </h3>
              </div>
              <p className='text-leaf-700 leading-relaxed'>
                {benefit.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How We Work */}
      <Section
        title='Our Screening Process'
        eyebrow='How We Work'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {howWeWork.map((step, index) => (
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

      {/* Value Proposition */}
      <Section
        title='Strategic Risk Intelligence'
        eyebrow='Multidimensional Insights'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Precision Risk Assessment
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              These multidimensional strategic risk insights empower your
              organisation to understand and assess risks with precision, uphold
              ethical standards, and navigate complex stakeholder landscapes
              with confidence.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Comprehensive risk profiling
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Enhanced due diligence processes
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Ethical engagement support
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Stakeholder confidence building
                </span>
              </div>
            </div>
          </div>

          <div className='bg-mint rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Report Outcomes:
            </h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Detailed risk domain analysis
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Actionable risk insights
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Regulatory compliance documentation
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Strategic risk intelligence framework
                </span>
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
              Ready to enhance your risk intelligence framework?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Connect with us to learn how Fermidas Pro can enhance your risk
              intelligence framework with comprehensive adverse screening
              reports.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' variant='secondary' size='lg'>
                Request a screening report
              </Button>
              <Button
                href='/contact'
                variant='ghost'
                size='lg'
                className='text-brand-foreground hover:bg-white hover:text-brand'
              >
                Learn more about our process
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
