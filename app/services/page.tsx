import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { pageConfigs, generateStructuredData } from '@/lib/seo-config';

import {
  BankIcon,
  Building01Icon,
  CharityIcon,
  SmartPhone01Icon,
  MeetingRoomIcon,
  Video01Icon,
  Book01Icon,
  GraduateMaleIcon,
  SecurityCheckIcon,
  Search01Icon,
  Legal01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: pageConfigs.services.title,
  description: pageConfigs.services.description,
  keywords: pageConfigs.services.keywords,
  openGraph: {
    title: pageConfigs.services.title,
    description: pageConfigs.services.description,
    url: '/services',
  },
  twitter: {
    title: pageConfigs.services.title,
    description: pageConfigs.services.description,
  },
  alternates: {
    canonical: '/services',
  },
};

const ourServices = [
  {
    title: 'Training Solutions',
    description:
      'Comprehensive training programs designed to enhance compliance knowledge and skills across your organization.',
    href: '/services/training-solutions',
    icon: 'training',
  },
  {
    title: 'Compliance Watch',
    description:
      'Daily real-time reports on adverse findings and media exposure to strengthen your risk-based assessment programme.',
    href: '/services/compliance-watch',
    icon: 'compliance',
  },
  {
    title: 'Adverse Screening Report',
    description:
      'Bespoke adverse screening reports for designated individuals and entities with comprehensive risk domain analysis.',
    href: '/services/adverse-screening-report',
    icon: 'screening',
  },
];

const serviceCategories = [
  {
    title: 'Financial Institutions & Regulated Entities',
    description:
      'Comprehensive compliance and risk management solutions for financial institutions operating in complex regulatory environments.',
    href: '/services/financial-institutions',
    features: [
      'Compliance Consulting',
      'Risk-Based Assessment Programme',
      'AML/CFT & Proliferation Training',
      'Quality Assurance & Control Audits',
      'FATCA & CRS Tax Compliance',
    ],
  },
  {
    title: 'Co-operative Banks & Credit Unions',
    description:
      'Specialized compliance and audit services aligned with international standards and WOCCU guidelines.',
    href: '/services/credit-unions',
    features: [
      'Compliance & Internal Audit Consulting',
      'Risk-Based Assessment Programme',
      'WOCCU Guidelines Alignment',
      'PEARLS Pre-certification Audits',
      'Model Law Standards',
    ],
  },
  {
    title: 'Non-profit Organisations',
    description:
      'Compliance frameworks and risk assessments tailored for NGO/NPO contexts and regulatory requirements.',
    href: '/services/non-profits',
    features: [
      'Compliance Frameworks',
      'Risk Assessments',
      'AML/CFT Training',
      'Policy & Governance Development',
      'GDPR/Data Protection',
    ],
  },
  {
    title: 'Government Agencies',
    description:
      'Compliance and governance advisory, targeted assessments, and remedial programmes to align with global standards and strengthen institutional integrity.',
    href: '/services/government-agencies',
    features: [
      'Regulatory compliance frameworks advisory',
      'Governance and risk management',
      'International governance and compliance standard advisory',
      'Remedial programmes',
      'Institutional integrity strengthening',
    ],
  },
];

const trainingModules = [
  {
    title: 'AML/CFT',
    description: 'Anti-Money Laundering and Counter-Financing of Terrorism',
  },
  {
    title: 'Risk-Based Due Diligence',
    description: 'Comprehensive due diligence procedures',
  },
  {
    title: 'Customer Due Diligence',
    description: 'Enhanced customer verification processes',
  },
  { title: 'Screening', description: 'Sanctions and PEP screening procedures' },
  { title: 'UBO', description: 'Ultimate Beneficial Ownership identification' },
  { title: 'FATCA', description: 'Foreign Account Tax Compliance Act' },
];

const deliveryFormats = [
  {
    title: 'Fermidas Pro App',
    description: 'Interactive online platform with progress tracking',
  },
  {
    title: 'In-class Workshops',
    description: 'Hands-on training sessions with expert facilitators',
  },
  {
    title: 'Live Sessions',
    description: 'Real-time virtual training with Q&A opportunities',
  },
  {
    title: 'Self-paced Learning',
    description: 'Flexible modules for individual study',
  },
];

export default function ServicesPage() {
  const structuredData = generateStructuredData(
    pageConfigs.services.structuredData
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
              Our Services
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Comprehensive compliance, governance, and risk management
              solutions tailored for regulated sectors across profit and
              non-profit organisations.
            </p>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <Section
        title='Our Products'
        eyebrow='What We Offer'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {ourServices.map((service, index) => (
            <Card
              key={index}
              className='p-8 hover:shadow-lg transition-shadow flex flex-col'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center'>
                  {service.icon === 'training' && (
                    <GraduateMaleIcon className='w-6 h-6 text-leaf-600' />
                  )}
                  {service.icon === 'compliance' && (
                    <SecurityCheckIcon className='w-6 h-6 text-leaf-600' />
                  )}
                  {service.icon === 'screening' && (
                    <Search01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                </div>
                <h3 className='font-display text-xl font-semibold text-brand'>
                  {service.title}
                </h3>
              </div>
              <p className='text-leaf-700 mb-6 leading-relaxed flex-grow'>
                {service.description}
              </p>
              <Button
                href={service.href}
                variant='ghost'
                className='mt-auto self-start'
              >
                Learn More →
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      {/* Service Categories */}
      <Section
        title='Service Categories'
        eyebrow='Industry Focus'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {serviceCategories.map((service, index) => (
            <Card
              key={index}
              className='p-8 hover:shadow-lg transition-shadow flex flex-col'
            >
              <div className='flex items-center gap-3 mb-4'>
                <div className='min-w-6 flex-shrink-0'>
                  {index === 0 && (
                    <BankIcon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 1 && (
                    <Building01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 2 && (
                    <Legal01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 3 && (
                    <CharityIcon className='w-6 h-6 text-leaf-600' />
                  )}
                </div>
                <h3 className='font-display text-xl font-semibold text-brand'>
                  {service.title}
                </h3>
              </div>
              <p className='text-leaf-700 mb-6 leading-relaxed flex-grow'>
                {service.description}
              </p>
              <div className='space-y-2 mb-6 flex-grow'>
                {service.features.slice(0, 3).map((feature, featureIndex) => (
                  <div key={featureIndex} className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-600'>{feature}</span>
                  </div>
                ))}
                {service.features.length > 3 && (
                  <p className='text-sm text-leaf-500'>
                    +{service.features.length - 3} more services
                  </p>
                )}
              </div>
              <Button
                href={service.href}
                variant='ghost'
                className='mt-auto self-start'
              >
                Learn More →
              </Button>
            </Card>
          ))}
        </div>
      </Section>

      {/* Training Modules */}
      <Section
        title='Training Modules'
        eyebrow='Fermidas Pro'
        className='bg-white'
      >
        <div className='mb-12'>
          <p className='text-center text-leaf-700 max-w-3xl mx-auto mb-8'>
            Our comprehensive training platform covers essential compliance
            topics with interactive modules, assessments, and certificates.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12'>
          {trainingModules.map((module, index) => (
            <Card key={index} className='p-6'>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {module.title}
              </h3>
              <p className='text-leaf-700 text-sm'>{module.description}</p>
            </Card>
          ))}
        </div>

        <div className='text-center'>
          <Button href='/training/fermidas-pro' size='lg'>
            Explore Training Platform
          </Button>
        </div>
      </Section>

      {/* Delivery Formats */}
      <Section
        title='Delivery Formats'
        eyebrow='How We Deliver'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {deliveryFormats.map((format, index) => (
            <Card key={index} className='p-6 text-center'>
              <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
                {index === 0 && (
                  <SmartPhone01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 1 && (
                  <MeetingRoomIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 2 && (
                  <Video01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 3 && (
                  <Book01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {format.title}
              </h3>
              <p className='text-leaf-700 text-sm'>{format.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className='py-16 bg-gradient-to-r from-leaf-600 to-brand'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-foreground mb-4'>
              Ready to get started?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss your specific compliance needs and how we can help
              your organisation achieve regulatory excellence.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' variant='secondary' size='lg'>
                Speak with an advisor
              </Button>
              <Button
                href='/training/fermidas-pro'
                variant='ghost'
                size='lg'
                className='text-brand-foreground hover:bg-white hover:text-brand'
              >
                Book a training demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
