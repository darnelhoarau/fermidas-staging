import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import {
  GraduateMaleIcon,
  Book01Icon,
  Certificate01Icon,
  UserGroupIcon,
  LaptopIcon,
  Clock01Icon,
} from 'hugeicons-react';

export const metadata: Metadata = {
  title: 'Training Solutions',
  description:
    'Comprehensive training programs designed to enhance compliance knowledge and skills across your organization.',
  openGraph: {
    title: 'Training Solutions',
    description: 'Expert compliance training solutions for regulated entities.',
  },
};

const trainingFeatures = [
  'Interactive Learning Modules',
  'Progress Tracking & Analytics',
  'Certification Programs',
  'Expert-Led Sessions',
  'Customizable Content',
  'Multi-Format Delivery',
];

const deliveryMethods = [
  {
    title: 'Online Modules',
    description: 'Self-paced interactive learning with multimedia content',
    icon: 'online',
  },
  {
    title: 'Live Training',
    description: 'Expert-led sessions with real-time Q&A and discussion',
    icon: 'live',
  },
  {
    title: 'Blended Learning',
    description: 'Combination of online and in-person training approaches',
    icon: 'blended',
  },
  {
    title: 'Custom Programs',
    description:
      'Tailored training solutions for specific organizational needs',
    icon: 'custom',
  },
];

const howWeWork = [
  {
    step: '01',
    title: 'Needs Assessment',
    description:
      "We evaluate your organization's current training needs and compliance requirements.",
  },
  {
    step: '02',
    title: 'Program Design',
    description:
      'Develop customized training programs aligned with your specific objectives and regulatory requirements.',
  },
  {
    step: '03',
    title: 'Content Delivery',
    description:
      'Deliver training through your preferred format with expert facilitators and comprehensive materials.',
  },
  {
    step: '04',
    title: 'Progress Monitoring',
    description:
      'Track learning progress, assess comprehension, and provide ongoing support for continuous improvement.',
  },
];

export default function TrainingSolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <div className='mx-auto max-w-7xl px-6 md:px-8'>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Training Solutions
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Comprehensive training programs designed to enhance compliance
              knowledge and skills across your organization through interactive
              learning, expert guidance, and practical application.
            </p>
          </div>
        </div>
      </section>

      {/* Training Features */}
      <Section
        title='Training Features'
        eyebrow='What We Offer'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {trainingFeatures.map((feature, index) => (
            <Card key={index} className='p-6'>
              <div className='w-12 h-12 bg-leaf-100 rounded-xl flex items-center justify-center mb-4'>
                {index === 0 && (
                  <Book01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 1 && (
                  <LaptopIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 2 && (
                  <Certificate01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 3 && (
                  <UserGroupIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 4 && (
                  <GraduateMaleIcon className='w-6 h-6 text-leaf-600' />
                )}
                {index === 5 && (
                  <Clock01Icon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {feature}
              </h3>
            </Card>
          ))}
        </div>
      </Section>

      {/* Delivery Methods */}
      <Section
        title='Delivery Methods'
        eyebrow='How We Deliver'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {deliveryMethods.map((method, index) => (
            <Card key={index} className='p-6 text-center'>
              <div className='w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4'>
                {method.icon === 'online' && (
                  <LaptopIcon className='w-6 h-6 text-leaf-600' />
                )}
                {method.icon === 'live' && (
                  <UserGroupIcon className='w-6 h-6 text-leaf-600' />
                )}
                {method.icon === 'blended' && (
                  <Book01Icon className='w-6 h-6 text-leaf-600' />
                )}
                {method.icon === 'custom' && (
                  <GraduateMaleIcon className='w-6 h-6 text-leaf-600' />
                )}
              </div>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                {method.title}
              </h3>
              <p className='text-leaf-700 text-sm'>{method.description}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* How We Work */}
      <Section
        title='Our Training Process'
        eyebrow='How We Work'
        className='bg-white'
      >
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

      {/* Training Benefits */}
      <Section
        title='Training Benefits'
        eyebrow='Why Choose Our Training'
        className='bg-mint'
      >
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Enhanced Compliance Knowledge
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our training solutions provide comprehensive compliance knowledge
              that empowers your team to navigate complex regulatory
              environments with confidence and expertise.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Improved regulatory compliance
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Enhanced risk management capabilities
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Increased team confidence and competency
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>
                  Reduced compliance-related incidents
                </span>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-2xl p-8'>
            <h4 className='font-display text-lg font-semibold text-brand mb-4'>
              Training Outcomes:
            </h4>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Certified compliance professionals
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Measurable knowledge improvement
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Enhanced organizational compliance culture
                </span>
              </div>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-sm text-leaf-700'>
                  Ongoing support and resources
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
              Ready to enhance your team's compliance knowledge?
            </h2>
            <p className='text-leaf-100 mb-8 max-w-2xl mx-auto'>
              Let's discuss your training needs and develop a customized program
              that delivers measurable results for your organization.
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
                Explore Fermidas Pro
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
