import { Metadata } from 'next';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { Kicker } from '@/components/Kicker';
import { ValuePill } from '@/components/ValuePill';
import { Split } from '@/components/Split';
import { siteContent } from '@/lib/content';
import { pageConfigs, generateStructuredData } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: pageConfigs.home.title,
  description: pageConfigs.home.description,
  keywords: pageConfigs.home.keywords,
  openGraph: {
    title: pageConfigs.home.title,
    description: pageConfigs.home.description,
    url: '/',
  },
  twitter: {
    title: pageConfigs.home.title,
    description: pageConfigs.home.description,
  },
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const structuredData = generateStructuredData(
    pageConfigs.home.structuredData
  );

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      {/* Hero Section */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <Container>
          <div className='text-center max-w-4xl mx-auto'>
            <Kicker className='mb-6'>From compliance to resilience.</Kicker>
            <h1 className='font-display text-5xl md:text-7xl font-bold text-brand mb-8 leading-tight'>
              Trusted, high-impact advisory for complex regulatory environments.
            </h1>
            <p className='text-xl text-leaf-700 mb-12 max-w-2xl mx-auto leading-relaxed'>
              We help organisations thrive in complex regulatory environments
              with technical expertise and ethical leadership.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' size='lg'>
                Speak with an advisor
              </Button>
              <Button href='/services' variant='secondary' size='lg'>
                Explore services
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Trust Section - Core Values */}
      <Section
        title='Built on Trust'
        eyebrow='Our Core Values'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {siteContent.coreValues.map((value, index) => (
            <ValuePill
              key={index}
              title={value.title}
              description={value.description}
            />
          ))}
        </div>
      </Section>

      {/* Why Fermidas */}
      <Section title='Why Fermidas' className='bg-mint'>
        <Split
          image={{
            src: '/why-fermidas.jpg',
            alt: 'Fermidas team working on compliance solutions',
            width: 600,
            height: 400,
          }}
        >
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Ethical Leadership + Technical Expertise
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our approach blends deep technical knowledge with unwavering
              ethical standards. We don't just help you meet regulations—we help
              you build resilient systems that enhance your organisation's
              capacity and cultivate a culture of compliance.
            </p>
            <p className='text-leaf-700 leading-relaxed'>
              With years of experience across regulated sectors, we understand
              the unique challenges you face and provide tailored solutions that
              drive sustainable impact.
            </p>
          </div>
        </Split>
      </Section>

      {/* Services Overview */}
      <Section
        title='Our Services'
        eyebrow='What We Offer'
        className='bg-white'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <Card className='p-8 hover:shadow-lg transition-shadow flex flex-col'>
            <h3 className='font-display text-xl font-semibold text-brand mb-4'>
              Financial Institutions & Regulated Entities
            </h3>
            <p className='text-leaf-700 mb-6 flex-grow'>
              Comprehensive compliance and risk management solutions for
              financial institutions operating in complex regulatory
              environments.
            </p>
            <Button
              href='/services/financial-institutions'
              variant='ghost'
              className='mt-auto self-start'
            >
              Learn More →
            </Button>
          </Card>

          <Card className='p-8 hover:shadow-lg transition-shadow flex flex-col'>
            <h3 className='font-display text-xl font-semibold text-brand mb-4'>
              Co-operative Banks & Credit Unions
            </h3>
            <p className='text-leaf-700 mb-6 flex-grow'>
              Specialized compliance and audit services aligned with
              international standards and WOCCU guidelines.
            </p>
            <Button
              href='/services/credit-unions'
              variant='ghost'
              className='mt-auto self-start'
            >
              Learn More →
            </Button>
          </Card>

          <Card className='p-8 hover:shadow-lg transition-shadow flex flex-col'>
            <h3 className='font-display text-xl font-semibold text-brand mb-4'>
              Non-profit Organisations
            </h3>
            <p className='text-leaf-700 mb-6 flex-grow'>
              Compliance frameworks and risk assessments tailored for NGO/NPO
              contexts and regulatory requirements.
            </p>
            <Button
              href='/services/non-profits'
              variant='ghost'
              className='mt-auto self-start'
            >
              Learn More →
            </Button>
          </Card>

          <Card className='p-8 hover:shadow-lg transition-shadow flex flex-col'>
            <h3 className='font-display text-xl font-semibold text-brand mb-4'>
              Government Agencies
            </h3>
            <p className='text-leaf-700 mb-6 flex-grow'>
              Compliance consultancy for government agencies with a focus on
              regulatory alignment and governance oversight.
            </p>
            <Button
              href='/services/government-agencies'
              variant='ghost'
              className='mt-auto self-start'
            >
              Learn More →
            </Button>
          </Card>
        </div>

        {/* Government Agencies Highlight Banner */}
        <div className='mt-12'>
          <div className='bg-gradient-to-r from-leaf-600 to-brand rounded-2xl p-8 text-center'>
            <div className='max-w-4xl mx-auto'>
              <h4 className='font-display text-lg font-semibold text-brand-foreground mb-4'>
                Government Agency Excellence
              </h4>
              <p className='text-leaf-100 leading-relaxed'>
                We promote the design and delivery of tailored remediation
                programmes and control reviews including strategic advisory for
                National Assessments and Peer positioning. We benchmark
                institutional performance against global standards to reinforce
                transparency, conformity, and international credibility.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Fermidas Pro Highlight */}
      <Section
        title='Fermidas Pro'
        eyebrow='Training Platform'
        className='bg-gradient-to-br from-leaf-50 to-mint'
      >
        <Split
          reverse
          image={{
            src: '/fermidas-pro.jpg',
            alt: 'Fermidas Pro training platform interface',
            width: 600,
            height: 400,
          }}
        >
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-4'>
              Comprehensive Training Platform
            </h3>
            <p className='text-leaf-700 mb-6 leading-relaxed'>
              Our tiered training platform delivers interactive modules and
              assessments with certificates, flexible desktop/mobile delivery,
              and progress tracking for compliance professionals.
            </p>
            <div className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='w-2 h-2 bg-leaf-500 rounded-full'></div>
                <span className='text-leaf-700'>Tiered training levels</span>
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
        </Split>
      </Section>

      {/* CTA Band */}
      <section className='py-16 bg-gradient-to-r from-gold to-gold/80'>
        <Container>
          <div className='text-center'>
            <h2 className='font-display text-3xl md:text-4xl font-bold text-brand mb-4'>
              Ready to strengthen your compliance framework?
            </h2>
            <p className='text-brand/80 mb-8 max-w-2xl mx-auto'>
              Let's discuss how Fermidas can help your organisation navigate
              complex regulatory environments with confidence and precision.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Button href='/contact' variant='secondary' size='lg'>
                Speak with an advisor
              </Button>
              <Button
                href='/services'
                variant='ghost'
                size='lg'
                className='text-brand hover:bg-brand hover:text-brand-foreground'
              >
                Request a capability deck
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
