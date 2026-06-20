import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { siteContent } from '@/lib/content';
import {
  Shield01Icon,
  Search01Icon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  File01Icon,
  FilterIcon,
  ShoppingCart01Icon,
  LockIcon,
  Resize01Icon,
  Book01Icon,
  Award01Icon,
  EyeIcon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Financial Institutions & Regulated Entities',
  description:
    'Comprehensive compliance and risk management solutions for financial institutions operating in complex regulatory environments.',
  openGraph: {
    title: 'Financial Institutions Services',
    description:
      'Expert compliance solutions for financial institutions and regulated entities.',
  },
};

const howWeWork = [
  {
    step: '01',
    title: 'Assessment & Analysis',
    description:
      'We conduct comprehensive risk assessments and gap analysis to understand your current compliance posture.',
  },
  {
    step: '02',
    title: 'Strategy Development',
    description:
      'Based on findings, we develop tailored compliance strategies aligned with your business objectives.',
  },
  {
    step: '03',
    title: 'Implementation Support',
    description:
      'We provide hands-on support to implement compliance frameworks and training programs.',
  },
  {
    step: '04',
    title: 'Ongoing Monitoring',
    description:
      'Continuous monitoring and support to ensure sustained compliance and regulatory excellence.',
  },
];

export default function FinancialInstitutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Financial Institutions & Regulated Entities
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              {siteContent.services.financialInstitutions.description}
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section
        title='Our Services'
        eyebrow='What We Offer'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {siteContent.services.financialInstitutions.features.map(
            (feature, index) => (
              <Card key={index} className='p-6'>
                <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                  {index === 0 && (
                    <Shield01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 1 && (
                    <Search01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 2 && (
                    <UserGroupIcon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 3 && (
                    <CheckmarkCircle01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 4 && (
                    <Alert01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 5 && (
                    <File01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 6 && (
                    <FilterIcon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 7 && (
                    <ShoppingCart01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 8 && (
                    <LockIcon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 9 && (
                    <Resize01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 10 && (
                    <Book01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 11 && (
                    <Award01Icon className='w-6 h-6 text-leaf-600' />
                  )}
                  {index === 12 && (
                    <EyeIcon className='w-6 h-6 text-leaf-600' />
                  )}
                </div>
                <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                  {feature}
                </h3>
              </Card>
            )
          )}
        </div>
      </Section>

      {/* Fermidas Pro */}
      <Section
        title='Fermidas Pro Training'
        eyebrow='Comprehensive Training'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Interactive Training Platform
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our Fermidas Pro platform delivers tiered training with
              interactive modules, assessments, and certificates. Features
              include:
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Tiered training levels (Introductory to Management)
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Interactive modules & assessments
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Flexible desktop/mobile delivery
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Progress tracking & certificates
                </span>
              </div>
            </div>
            <div className='mt-8'>
              <Button href='/training/fermidas-pro'>
                Book a training demo
              </Button>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Training Modules Include:
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {siteContent.fermidasPro.modules
                .slice(0, 8)
                .map((module, index) => (
                  <div key={index} className='flex items-center gap-2'>
                    <div className='w-1.5 h-1.5 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      {module.title}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </Section>

      {/* How We Work */}
      <Section title='How We Work' eyebrow='Our Process' className='bg-white'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {howWeWork.map((step, index) => (
            <div key={index} className='text-center'>
              <div className='w-16 h-16 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-4'>
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

      {/* CTA */}
      <section className='py-16 bg-gradient-to-r from-leaf-600 to-brand'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-foreground mb-4'>
              Ready to strengthen your compliance framework?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss how we can help your financial institution navigate
              complex regulatory environments with confidence and precision.
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
