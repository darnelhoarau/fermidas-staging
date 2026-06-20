import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { siteContent } from '@/lib/content';
import {
  Shield01Icon,
  Search01Icon,
  UserGroupIcon,
  File01Icon,
  LockIcon,
  Target01Icon,
  Award01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Government Agencies',
  description:
    'Compliance and governance advisory, targeted assessments, and remedial programmes to align with global standards and strengthen institutional integrity.',
  openGraph: {
    title: 'Government Agencies Services',
    description:
      'Expert compliance solutions for government agencies and public sector organisations.',
  },
};

const services = [
  'Regulatory compliance frameworks advisory',
  'Governance oversight and institutional performance evaluations',
  'Tailored Remediation programmes',
  'Independent control reviews and risk diagnostics',
  'Strategic guidance for National Assessments and Peer reviews',
  'International governance and compliance standard advisory',
  'AML/CFT training',
];

const howWeWork = [
  {
    step: '01',
    title: 'Institutional Assessment',
    description:
      'We evaluate your current governance posture and identify specific regulatory requirements for your agency.',
  },
  {
    step: '02',
    title: 'Framework Development',
    description:
      'Develop tailored compliance frameworks that align with national and international standards.',
  },
  {
    step: '03',
    title: 'Implementation & Training',
    description:
      'Provide hands-on support to implement frameworks and train your team on governance requirements.',
  },
  {
    step: '04',
    title: 'Ongoing Oversight',
    description:
      'Continuous monitoring and support to maintain compliance as regulations and standards evolve.',
  },
];

export default function GovernmentAgenciesPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Government Agencies
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Compliance and governance advisory, targeted assessments, and
              remedial programmes to align with global standards and strengthen
              institutional integrity.
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
          {services.map((service, index) => (
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
                  <File01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 4 && (
                  <Target01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 5 && (
                  <Award01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 6 && <LockIcon className='w-6 h-6 text-leaf-600' />}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {service}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* Government-Specific Compliance */}
      <Section
        title='Government-Specific Compliance'
        eyebrow='Tailored Solutions'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Institutional Excellence & Integrity
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              We understand that government agencies operate in complex
              regulatory environments that require alignment with national and
              international standards. Our approach ensures compliance while
              promoting transparency, conformity, and international credibility.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  National Assessment preparation
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Peer review positioning</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  International standards alignment
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Governance oversight frameworks
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div>
                <h4 className='font-display text-lg font-semibold text-brand mb-4'>
                  Key Focus Areas:
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Regulatory alignment
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Governance oversight
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Institutional performance
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Control reviews
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Risk diagnostics
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Transparency enhancement
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                {/* <ImageSkeleton
                  src='https://picsum.photos/400/300?random=government'
                  alt='Government Agency Compliance'
                  className='w-full h-48 object-cover rounded-xl'
                /> */}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Training for Government Agencies */}
      <Section
        title='Training for Government Agencies'
        eyebrow='Fermidas Pro'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='bg-mint rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Government Training Modules:
            </h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {siteContent.fermidasPro.modules
                .slice(0, 6)
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

          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Specialized Government Training
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our training modules are adapted for government contexts,
              including scenarios and examples relevant to public sector
              operations and regulatory challenges.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Government-specific scenarios
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Public sector staff training
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Leadership and oversight education
                </span>
              </div>
            </div>
            <div className='mt-8'>
              <Button href='/training/fermidas-pro'>
                Book a training demo
              </Button>
            </div>
          </div>
        </div>
      </Section>

      {/* How We Work */}
      <Section title='How We Work' eyebrow='Our Process' className='bg-mint'>
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

      {/* CTA */}
      <section className='py-16 bg-gradient-to-r from-leaf-600 to-brand'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand-foreground mb-4'>
              Ready to strengthen your governance framework?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss how we can help your government agency enhance
              compliance, align with international standards, and strengthen
              institutional integrity.
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
