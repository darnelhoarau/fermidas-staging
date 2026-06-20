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
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Non-profit Organisations',
  description:
    'Compliance frameworks and risk assessments tailored for NGO/NPO contexts and regulatory requirements.',
  openGraph: {
    title: 'Non-profit Services',
    description:
      'Expert compliance solutions for non-profit organisations and NGOs.',
  },
};

const howWeWork = [
  {
    step: '01',
    title: 'NGO/NPO Assessment',
    description:
      'We evaluate your current compliance posture and identify specific regulatory requirements for your sector.',
  },
  {
    step: '02',
    title: 'Framework Development',
    description:
      'Develop tailored compliance frameworks that align with your mission and operational needs.',
  },
  {
    step: '03',
    title: 'Implementation & Training',
    description:
      'Provide hands-on support to implement frameworks and train your team on compliance requirements.',
  },
  {
    step: '04',
    title: 'Ongoing Compliance',
    description:
      'Continuous monitoring and support to maintain compliance as regulations evolve.',
  },
];

export default function NonProfitsPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Non-profit Organisations
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              {siteContent.services.nonProfits.description}
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
          {siteContent.services.nonProfits.features.map((feature, index) => (
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
                {index === 4 && <LockIcon className='w-6 h-6 text-leaf-600' />}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {feature}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* NGO/NPO Specific */}
      <Section
        title='NGO/NPO Specific Compliance'
        eyebrow='Tailored Solutions'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Mission-Aligned Compliance
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              We understand that non-profit organisations have unique compliance
              needs that must align with their mission and funding requirements.
              Our approach ensures compliance without compromising your ability
              to serve your community.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Donor and grant compliance
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Volunteer and staff training
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Fundraising compliance</span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Board governance frameworks
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
                      Anti-bribery & corruption
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Data protection & privacy
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Financial transparency
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Regulatory liaison
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Risk management
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Stakeholder communication
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                {/* <ImageSkeleton
                  src='https://picsum.photos/400/300?random=compliance'
                  alt='NGO/NPO Compliance'
                  className='w-full h-48 object-cover rounded-xl'
                /> */}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Training for Non-profits */}
      <Section
        title='Training for Non-profits'
        eyebrow='Fermidas Pro'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='bg-mint rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              NGO/NPO Training Modules:
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
              Contextualized Training
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our training modules are adapted for non-profit contexts,
              including scenarios and examples relevant to NGO/NPO operations
              and challenges.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Non-profit specific scenarios
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Volunteer and staff training
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Board member education</span>
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
              Ready to strengthen your compliance framework?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss how we can help your non-profit organisation
              maintain compliance while focusing on your mission and community
              impact.
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
