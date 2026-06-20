import { Metadata } from 'next';
import { Section } from '@/components/Section';
import { Card } from '@/components/Card';
import { ContactForm } from '@/components/ContactForm';
import { Button } from '@/components/Button';
import { Book01Icon, BulbIcon, Clock01Icon } from 'hugeicons-react';
import { pageConfigs, generateStructuredData } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: pageConfigs.contact.title,
  description: pageConfigs.contact.description,
  keywords: pageConfigs.contact.keywords,
  openGraph: {
    title: pageConfigs.contact.title,
    description: pageConfigs.contact.description,
    url: '/contact',
  },
  twitter: {
    title: pageConfigs.contact.title,
    description: pageConfigs.contact.description,
  },
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  const structuredData = generateStructuredData(
    pageConfigs.contact.structuredData
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
              Contact Us
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Ready to strengthen your compliance framework? Let's discuss how
              Fermidas can help your organisation navigate complex regulatory
              environments with confidence and precision.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <Section title='Get in Touch' className='bg-white'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
          {/* Contact Form */}
          <div>
            <h3 className='font-display text-2xl font-bold text-brand mb-6'>
              Send us a message
            </h3>
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className='space-y-8'>
            <div>
              <h3 className='font-display text-2xl font-bold text-brand mb-6'>
                Contact Information
              </h3>
              <Card className='p-8'>
                <div className='space-y-6'>
                  <div>
                    <h4 className='font-display text-lg font-semibold text-brand mb-2'>
                      Fermidas Consultancy
                    </h4>
                    <p className='text-leaf-700'>
                      From compliance to resilience.
                    </p>
                  </div>

                  <div>
                    <h4 className='font-display text-lg font-semibold text-brand mb-2'>
                      Email
                    </h4>
                    <p className='text-leaf-700'>contact@fermidas.com</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className='font-display text-xl font-semibold text-brand mb-4'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <Button
                  href='/contact'
                  variant='ghost'
                  className='w-full p-4 bg-mint rounded-xl hover:bg-leaf-100 transition-colors'
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div className='w-10 h-10 bg-leaf-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Book01Icon className='w-5 h-5 text-leaf-600' />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-semibold text-brand'>
                        Request Capability Deck
                      </h4>
                      <p className='text-sm text-leaf-600'>
                        Get detailed information about our services
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  href='/training/fermidas-pro'
                  variant='ghost'
                  className='w-full p-4 bg-mint rounded-xl hover:bg-leaf-100 transition-colors'
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div className='w-10 h-10 bg-leaf-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <BulbIcon className='w-5 h-5 text-leaf-600' />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-semibold text-brand'>
                        Book Training Demo
                      </h4>
                      <p className='text-sm text-leaf-600'>
                        See Fermidas Pro in action
                      </p>
                    </div>
                  </div>
                </Button>

                <Button
                  href='/contact'
                  variant='ghost'
                  className='w-full p-4 bg-mint rounded-xl hover:bg-leaf-100 transition-colors'
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div className='w-10 h-10 bg-leaf-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Clock01Icon className='w-5 h-5 text-leaf-600' />
                    </div>
                    <div className='text-left'>
                      <h4 className='font-semibold text-brand'>
                        Schedule Consultation
                      </h4>
                      <p className='text-sm text-leaf-600'>
                        Discuss your specific needs
                      </p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ Placeholder */}
      <Section
        title='Frequently Asked Questions'
        eyebrow='Common Questions'
        className='bg-mint'
      >
        <div className='max-w-4xl mx-auto'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <Card className='p-6'>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                What services do you offer?
              </h3>
              <p className='text-leaf-700 text-sm'>
                We provide comprehensive compliance consulting, training, and
                audit services for financial institutions, Credit Unions, and
                non-profit organisations.
              </p>
            </Card>

            <Card className='p-6'>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                How does Fermidas Pro work?
              </h3>
              <p className='text-leaf-700 text-sm'>
                Our training platform offers tiered learning levels with
                interactive modules, assessments, and certificates for
                compliance professionals.
              </p>
            </Card>

            <Card className='p-6'>
              <h3 className='font-display text-lg font-semibold text-brand mb-2'>
                What makes Fermidas different?
              </h3>
              <p className='text-leaf-700 text-sm'>
                We combine technical expertise with ethical leadership, offering
                tailored solutions that align with your organisation's specific
                needs and mission.
              </p>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
