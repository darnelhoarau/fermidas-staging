import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  SecurityCheckIcon,
  Alert01Icon,
  GlobeIcon,
  LaptopIcon,
  Database01Icon,
  Shield01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Compliance Watch',
  description:
    'Daily real-time reports on adverse findings and media exposure to strengthen your risk-based assessment programme.',
  openGraph: {
    title: 'Compliance Watch',
    description:
      'Real-time adverse findings and media monitoring for enhanced risk management.',
  },
};

const watchFeatures = [
  'Daily Real-time Reports',
  'Adverse Findings Monitoring',
  'Media Exposure Tracking',
  'Risk-based Assessment Support',
  'Dynamic Database Building',
  'Proactive Risk Intelligence',
];

const reportCapabilities = [
  {
    title: 'Real-time Monitoring',
    description:
      'Continuous surveillance of adverse findings and media exposure',
    icon: 'monitor',
  },
  {
    title: 'Comprehensive Coverage',
    description: 'Multi-source intelligence gathering across various platforms',
    icon: 'coverage',
  },
  {
    title: 'Risk Categorization',
    description: 'Structured risk assessment and categorization of findings',
    icon: 'risk',
  },
  {
    title: 'Alert System',
    description: 'Immediate notifications for critical adverse findings',
    icon: 'alert',
  },
];

const availableCountries = [
  {
    country: 'Seychelles',
    flag: '🇸🇨',
    description:
      'Comprehensive compliance watch coverage for Seychelles jurisdiction',
  },
  {
    country: 'Mauritius',
    flag: '🇲🇺',
    description:
      'Detailed monitoring and reporting for Mauritius regulatory environment',
  },
];

const howWeWork = [
  {
    step: '01',
    title: 'Setup & Configuration',
    description:
      'Configure monitoring parameters based on your specific risk profile and regulatory requirements.',
  },
  {
    step: '02',
    title: 'Continuous Monitoring',
    description:
      'Our systems continuously monitor multiple sources for adverse findings and media exposure.',
  },
  {
    step: '03',
    title: 'Daily Reporting',
    description:
      'Receive comprehensive daily reports with detailed analysis and risk categorization.',
  },
  {
    step: '04',
    title: 'Database Integration',
    description:
      'Build and maintain a dynamic database of emerging risks for ongoing risk management.',
  },
];

export default function ComplianceWatchPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Compliance Watch
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Fermidas Pro delivers daily, real-time reports on adverse findings
              and media exposure through our dedicated Compliance Watch
              platform. Designed to strengthen your risk-based assessment
              programme, these insights focus on individuals and entities with
              direct impact on your organisation.
            </p>
          </div>
        </div>
      </section>

      {/* Watch Features */}
      <Section
        title='Platform Features'
        eyebrow='What We Monitor'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {watchFeatures.map((feature, index) => (
            <Card key={index} className='p-6'>
              <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                {index === 0 && (
                  <LaptopIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 1 && (
                  <Alert01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 2 && <GlobeIcon className='w-6 h-6 text-leaf-600' />}
                {index === 3 && (
                  <SecurityCheckIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 4 && (
                  <Database01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 5 && (
                  <Shield01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {feature}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* Report Capabilities */}
      <Section
        title='Report Capabilities'
        eyebrow='Intelligence Features'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {reportCapabilities.map((capability, index) => (
            <Card key={index} className='p-6 text-center'>
              <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4'>
                {capability.icon === 'monitor' && (
                  <LaptopIcon className='w-6 h-6 text-leaf-600' />
                )}
                {capability.icon === 'coverage' && (
                  <GlobeIcon className='w-6 h-6 text-leaf-600' />
                )}
                {capability.icon === 'risk' && (
                  <SecurityCheckIcon className='w-6 h-6 text-leaf-600' />
                )}
                {capability.icon === 'alert' && (
                  <Alert01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {capability.title}
              </h3>
              <p className='text-leaf-700 text-sm'>{capability.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Available Countries */}
      <Section
        title='Available Coverage'
        eyebrow='Geographic Reach'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {availableCountries.map((location, index) => (
            <Card key={index} className='p-8 hover:shadow-lg transition-shadow'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center text-2xl'>
                  {location.flag}
                </div>
                <h3 className='font-display text-xl font-semibold text-brand'>
                  {location.country}
                </h3>
              </div>
              <p className='text-leaf-700 leading-relaxed'>
                {location.description}
              </p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How We Work */}
      <Section
        title='Our Monitoring Process'
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
        title='Strategic Value'
        eyebrow='Why Compliance Watch'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Proactive Risk Management
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Each report offers a comprehensive snapshot of reputational and
              regulatory adversity—helping you stay informed, responsive, and
              prepared. Build a dynamic database of emerging risks and ensure
              your compliance strategy remains proactive and resilient.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Enhanced risk visibility</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Proactive compliance strategy
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Dynamic risk database</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Regulatory preparedness</span>
              </div>
            </div>
          </div>

          <div className='bg-mint rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Report Benefits:
            </h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Real-time adverse finding alerts
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Comprehensive media monitoring
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Risk-based assessment enhancement
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Regulatory compliance support
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
              Ready to enhance your risk intelligence?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Contact us today for further report details and discover how
              Compliance Watch can strengthen your organization's risk
              management capabilities.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' variant='secondary' size='lg'>
                Get report details
              </Button>
              <Button
                href='/contact'
                variant='ghost'
                size='lg'
                className='text-brand-foreground hover:bg-white hover:text-brand'
              >
                Schedule a demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
