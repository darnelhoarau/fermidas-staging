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
  Award01Icon,
  Alert01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Co-operative Banks & Credit Unions',
  description:
    'Specialized compliance and audit services aligned with international standards and WOCCU guidelines for Credit Unions and co-operative banks.',
  openGraph: {
    title: 'Credit Unions Services',
    description:
      'Expert compliance solutions for co-operative banks and Credit Unions.',
  },
};

const howWeWork = [
  {
    step: '01',
    title: 'WOCCU Alignment Assessment',
    description:
      'We evaluate your current alignment with WOCCU guidelines and international standards.',
  },
  {
    step: '02',
    title: 'Custom Framework Development',
    description:
      'Develop tailored compliance frameworks specific to Credit Union operations and member needs.',
  },
  {
    step: '03',
    title: 'PEARLS Pre-certification',
    description:
      'Conduct PEARLS pre-certification audits to prepare for formal certification.',
  },
  {
    step: '04',
    title: 'Ongoing Support',
    description:
      'Provide continuous support and monitoring to maintain compliance excellence.',
  },
];

export default function CreditUnionsPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Co-operative Banks & Credit Unions
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              {siteContent.services.creditUnions.description}
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
          {siteContent.services.creditUnions.features.map((feature, index) => (
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
                  <Award01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 4 && (
                  <CheckmarkCircle01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 5 && (
                  <Alert01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {feature}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* WOCCU Alignment */}
      <Section
        title='WOCCU Guidelines Alignment'
        eyebrow='International Standards'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              World Council of Credit Unions Standards
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              We ensure your Credit Union operations align with WOCCU guidelines
              and international best practices for co-operative financial
              institutions.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Model Law Standards compliance
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  PEARLS pre-certification audits
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  International co-operative principles
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Member-focused compliance frameworks
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-8'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
              <div>
                <h4 className='font-display text-lg font-semibold text-brand mb-4'>
                  PEARLS Framework:
                </h4>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Protection (Asset Quality)
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Effective Financial Structure
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>Asset Quality</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Rates of Return & Costs
                    </span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>Liquidity</span>
                  </div>
                  <div className='flex items-center gap-3'>
                    <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                    <span className='text-sm text-leaf-700'>
                      Signs of Growth
                    </span>
                  </div>
                </div>
              </div>
              <div className='flex items-center justify-center'>
                {/* <ImageSkeleton
                  src='https://picsum.photos/400/300?random=standards'
                  alt='WOCCU Standards'
                  className='w-full h-48 object-cover rounded-xl'
                /> */}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Fermidas Pro for Credit Unions */}
      <Section
        title='Fermidas Pro Training'
        eyebrow='Specialized Training'
        className='bg-white'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div className='bg-mint rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Credit Union Training Modules:
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
              Tailored for Credit Unions
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our Fermidas Pro platform includes specialised training modules
              designed specifically for Credit Union operations and member
              service requirements.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Credit union-specific scenarios
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Member-focused compliance training
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Co-operative principles integration
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
              Ready to align with international standards?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss how we can help your Credit Union achieve WOCCU
              compliance and prepare for PEARLS certification.
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
