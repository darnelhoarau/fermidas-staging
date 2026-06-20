import { Metadata } from 'next';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { generateStructuredData } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'Terms of Service - Fermidas Consultancy',
  description:
    'Terms and conditions governing the use of Fermidas Consultancy services, including compliance advisory, training, and audit services.',
  keywords: [
    'terms of service',
    'terms and conditions',
    'service agreement',
    'compliance services',
    'training terms',
    'audit services',
    'fermidas terms',
  ],
  openGraph: {
    title: 'Terms of Service - Fermidas Consultancy',
    description:
      'Terms and conditions for our compliance and governance services.',
    url: '/terms',
  },
  twitter: {
    title: 'Terms of Service - Fermidas Consultancy',
    description:
      'Terms and conditions for our compliance and governance services.',
  },
  alternates: {
    canonical: '/terms',
  },
};

const termsStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Terms of Service',
  description: 'Terms of Service for Fermidas Consultancy',
  url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/terms`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Fermidas Consultancy',
    url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com',
  },
};

export default function TermsPage() {
  const structuredData = generateStructuredData(termsStructuredData);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />

      {/* Hero */}
      <section className='py-24 md:py-32 bg-gradient-to-br from-mint to-white'>
        <Container>
          <div className='text-center max-w-4xl mx-auto'>
            <h1 className='font-display text-5xl md:text-6xl font-bold text-brand mb-8 leading-tight'>
              Terms of Service
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              Terms and conditions governing the use of our compliance and
              governance advisory services.
            </p>
            <p className='text-sm text-leaf-600 mt-4'>
              Last updated:{' '}
              {new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </Container>
      </section>

      {/* Terms of Service Content */}
      <Section className='bg-white'>
        <Container>
          <div className='max-w-4xl mx-auto prose prose-lg prose-leaf'>
            <div className='space-y-8'>
              {/* Introduction */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  1. Introduction
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  These Terms of Service ("Terms") govern your use of Fermidas
                  Consultancy's services, including our website, compliance
                  advisory services, training programs, and audit services. By
                  accessing or using our services, you agree to be bound by
                  these Terms.
                </p>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  Fermidas Consultancy ("we," "our," or "us") provides
                  compliance and governance advisory services to help
                  organisations navigate complex regulatory environments. These
                  Terms establish the legal framework for our professional
                  relationship.
                </p>
              </div>

              {/* Definitions */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  2. Definitions
                </h2>
                <div className='space-y-4'>
                  <div>
                    <p className='text-leaf-700 font-semibold'>"Services"</p>
                    <p className='text-leaf-700'>
                      Refers to all services provided by Fermidas Consultancy,
                      including but not limited to compliance advisory, training
                      programs, audit services, and Fermidas Pro platform.
                    </p>
                  </div>
                  <div>
                    <p className='text-leaf-700 font-semibold'>"Client"</p>
                    <p className='text-leaf-700'>
                      Refers to any individual or organisation that engages our
                      services or uses our platform.
                    </p>
                  </div>
                  <div>
                    <p className='text-leaf-700 font-semibold'>"Content"</p>
                    <p className='text-leaf-700'>
                      Refers to all materials, documents, training modules,
                      assessments, and information provided through our
                      services.
                    </p>
                  </div>
                  <div>
                    <p className='text-leaf-700 font-semibold'>"Platform"</p>
                    <p className='text-leaf-700'>
                      Refers to our website, Fermidas Pro training platform, and
                      any related digital services.
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Description */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  3. Service Description
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  Fermidas Consultancy provides the following services:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    <strong>Compliance Advisory:</strong> Expert guidance on
                    regulatory compliance and governance frameworks
                  </li>
                  <li>
                    <strong>Training Programs:</strong> Professional development
                    and compliance training through Fermidas Pro
                  </li>
                  <li>
                    <strong>Audit Services:</strong> Quality assurance and
                    control audits aligned with regulatory standards
                  </li>
                  <li>
                    <strong>Risk Assessment:</strong> Comprehensive risk-based
                    assessment programs
                  </li>
                  <li>
                    <strong>Policy Development:</strong> Custom compliance
                    policies and procedures
                  </li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  Our services are designed to help organisations meet
                  regulatory requirements and build sustainable compliance
                  frameworks.
                </p>
              </div>

              {/* Acceptance of Terms */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  4. Acceptance of Terms
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  By accessing our website, using our services, or engaging with
                  our platform, you acknowledge that you have read, understood,
                  and agree to be bound by these Terms. If you do not agree to
                  these Terms, you must not use our services.
                </p>
              </div>

              {/* Service Engagement */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  5. Service Engagement
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  When engaging our services, the following terms apply:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    Services are provided on a professional basis with
                    appropriate expertise and care
                  </li>
                  <li>
                    Specific service terms will be outlined in separate
                    engagement agreements
                  </li>
                  <li>
                    We reserve the right to decline service requests that
                    conflict with our ethical standards
                  </li>
                  <li>
                    Services are subject to availability and may require advance
                    scheduling
                  </li>
                  <li>
                    We maintain professional independence and objectivity in all
                    engagements
                  </li>
                </ul>
              </div>

              {/* User Responsibilities */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  6. User Responsibilities
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  As a user of our services, you agree to:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    Provide accurate and complete information when engaging our
                    services
                  </li>
                  <li>
                    Maintain the confidentiality of any login credentials or
                    access information
                  </li>
                  <li>
                    Use our services only for lawful purposes and in accordance
                    with these Terms
                  </li>
                  <li>
                    Not attempt to gain unauthorised access to our systems or
                    platforms
                  </li>
                  <li>
                    Respect intellectual property rights and not reproduce or
                    distribute our content without permission
                  </li>
                  <li>
                    Cooperate with our team and provide necessary information
                    for service delivery
                  </li>
                  <li>
                    Notify us immediately of any security concerns or
                    unauthorised access
                  </li>
                </ul>
              </div>

              {/* Intellectual Property */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  7. Intellectual Property Rights
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  All content, materials, and intellectual property provided
                  through our services remain the property of Fermidas
                  Consultancy or our licensors. This includes but is not limited
                  to:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>Training materials and course content</li>
                  <li>Assessment tools and methodologies</li>
                  <li>Compliance frameworks and templates</li>
                  <li>Audit procedures and checklists</li>
                  <li>Website content and design</li>
                  <li>Fermidas Pro platform and software</li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  You may use our content solely for the purpose for which it
                  was provided. Any unauthorised use, reproduction, or
                  distribution is strictly prohibited.
                </p>
              </div>

              {/* Confidentiality */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  8. Confidentiality and Data Protection
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We are committed to maintaining the confidentiality of all
                  client information and data. Our confidentiality obligations
                  include:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>Protecting all client information and trade secrets</li>
                  <li>Maintaining professional confidentiality standards</li>
                  <li>Complying with applicable data protection laws</li>
                  <li>Implementing appropriate security measures</li>
                  <li>
                    Limiting access to confidential information to authorised
                    personnel only
                  </li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  For detailed information about how we handle your data, please
                  refer to our Privacy Policy.
                </p>
              </div>

              {/* Payment Terms */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  9. Payment Terms
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  Payment terms for our services are as follows:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    Fees are specified in individual service agreements or
                    proposals
                  </li>
                  <li>
                    Payment is due according to the terms outlined in your
                    engagement agreement
                  </li>
                  <li>Late payments may result in suspension of services</li>
                  <li>All fees are exclusive of applicable taxes</li>
                  <li>
                    Refunds are subject to our refund policy as outlined in
                    service agreements
                  </li>
                </ul>
              </div>

              {/* Limitation of Liability */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  10. Limitation of Liability
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  To the maximum extent permitted by law, Fermidas Consultancy's
                  liability is limited as follows:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    We provide advisory services and cannot guarantee specific
                    regulatory outcomes
                  </li>
                  <li>
                    Our liability is limited to the amount paid for the specific
                    service in question
                  </li>
                  <li>
                    We are not liable for indirect, consequential, or punitive
                    damages
                  </li>
                  <li>
                    Clients remain responsible for their own compliance
                    decisions and actions
                  </li>
                  <li>
                    Our advice should be considered alongside other professional
                    guidance
                  </li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  These limitations do not apply to liability that cannot be
                  excluded by law.
                </p>
              </div>

              {/* Disclaimers */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  11. Disclaimers
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  Our services are provided "as is" and "as available" with the
                  following disclaimers:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    We do not guarantee that our services will meet all
                    regulatory requirements
                  </li>
                  <li>
                    Regulatory environments change, and advice may need to be
                    updated
                  </li>
                  <li>
                    Our training programs do not guarantee certification or
                    compliance
                  </li>
                  <li>
                    Website and platform availability may be subject to
                    maintenance or technical issues
                  </li>
                  <li>
                    We are not responsible for decisions made based on our
                    advice
                  </li>
                </ul>
              </div>

              {/* Termination */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  12. Termination
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  These Terms may be terminated under the following
                  circumstances:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    By either party with written notice as specified in service
                    agreements
                  </li>
                  <li>Immediately if you breach these Terms</li>
                  <li>
                    If we determine that continued service would violate our
                    ethical standards
                  </li>
                  <li>Upon completion of the agreed-upon services</li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  Upon termination, your right to use our services ceases
                  immediately, and you must return any confidential materials.
                </p>
              </div>

              {/* Governing Law */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  13. Governing Law and Dispute Resolution
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  These Terms are governed by the laws of the United Kingdom.
                  Any disputes arising from these Terms or our services will be
                  resolved through:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>Good faith negotiations between the parties</li>
                  <li>Mediation if direct negotiations are unsuccessful</li>
                  <li>
                    Legal proceedings in the courts of the United Kingdom if
                    necessary
                  </li>
                </ul>
              </div>

              {/* Changes to Terms */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  14. Changes to Terms
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  We may update these Terms from time to time to reflect changes
                  in our services or applicable laws. We will notify you of any
                  material changes by posting the updated Terms on our website
                  and updating the "Last updated" date. Your continued use of
                  our services after such changes constitutes acceptance of the
                  updated Terms.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  15. Contact Information
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <div className='bg-mint rounded-lg p-6'>
                  <p className='text-leaf-700 font-semibold mb-2'>
                    Fermidas Consultancy
                  </p>
                  <p className='text-leaf-700'>Email: contact@fermidas.comm</p>
                  <p className='text-leaf-700'>
                    Address: [Your Business Address]
                  </p>
                  <p className='text-leaf-700 mt-4'>
                    For urgent legal matters, please contact us directly through
                    our main contact channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
