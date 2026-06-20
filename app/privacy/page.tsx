import { Metadata } from 'next';
import { Container } from '@/components/Container';
import { Section } from '@/components/Section';
import { generateStructuredData } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'Privacy Policy - Fermidas Consultancy',
  description:
    'Learn how Fermidas Consultancy collects, uses, and protects your personal information in accordance with data protection regulations.',
  keywords: [
    'privacy policy',
    'data protection',
    'GDPR compliance',
    'personal information',
    'data security',
    'confidentiality',
    'fermidas privacy',
  ],
  openGraph: {
    title: 'Privacy Policy - Fermidas Consultancy',
    description:
      'How we protect your personal information and maintain confidentiality.',
    url: '/privacy',
  },
  twitter: {
    title: 'Privacy Policy - Fermidas Consultancy',
    description:
      'How we protect your personal information and maintain confidentiality.',
  },
  alternates: {
    canonical: '/privacy',
  },
};

const privacyStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Privacy Policy',
  description: 'Privacy Policy for Fermidas Consultancy',
  url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/privacy`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Fermidas Consultancy',
    url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com',
  },
};

export default function PrivacyPage() {
  const structuredData = generateStructuredData(privacyStructuredData);

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
              Privacy Policy
            </h1>
            <p className='text-xl text-leaf-700 leading-relaxed'>
              How we collect, use, and protect your personal information in
              accordance with data protection regulations.
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

      {/* Privacy Policy Content */}
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
                  Fermidas Consultancy ("we," "our," or "us") is committed to
                  protecting your privacy and ensuring the security of your
                  personal information. This Privacy Policy explains how we
                  collect, use, disclose, and safeguard your information when
                  you visit our website, use our services, or interact with us.
                </p>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  As a compliance and governance advisory firm, we understand
                  the importance of data protection and confidentiality. We are
                  committed to maintaining the highest standards of privacy and
                  security in accordance with applicable data protection laws,
                  including the General Data Protection Regulation (GDPR) and
                  other relevant regulations.
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  2. Information We Collect
                </h2>

                <h3 className='font-display text-xl font-semibold text-brand mb-3'>
                  2.1 Personal Information
                </h3>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We may collect the following types of personal information:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    Contact information (name, email address, phone number,
                    company name)
                  </li>
                  <li>
                    Professional information (job title, department,
                    organisation)
                  </li>
                  <li>Communication preferences and history</li>
                  <li>
                    Information provided through our contact forms and
                    consultations
                  </li>
                  <li>
                    Training and certification records (for Fermidas Pro users)
                  </li>
                  <li>Compliance assessment data and audit information</li>
                </ul>

                <h3 className='font-display text-xl font-semibold text-brand mb-3 mt-6'>
                  2.2 Technical Information
                </h3>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We automatically collect certain technical information when
                  you visit our website:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on our website</li>
                  <li>Referring website information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>

              {/* How We Use Information */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  3. How We Use Your Information
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We use your personal information for the following purposes:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>Providing compliance and governance advisory services</li>
                  <li>Delivering training programs and educational content</li>
                  <li>Conducting audits and assessments</li>
                  <li>Communicating with you about our services</li>
                  <li>Processing and responding to your inquiries</li>
                  <li>Improving our website and services</li>
                  <li>Complying with legal and regulatory obligations</li>
                  <li>Maintaining the security and integrity of our systems</li>
                </ul>
              </div>

              {/* Legal Basis */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  4. Legal Basis for Processing
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We process your personal information based on the following
                  legal grounds:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    <strong>Contract:</strong> To fulfill our contractual
                    obligations when providing services
                  </li>
                  <li>
                    <strong>Legitimate Interest:</strong> To improve our
                    services and communicate with clients
                  </li>
                  <li>
                    <strong>Consent:</strong> When you explicitly agree to
                    specific processing activities
                  </li>
                  <li>
                    <strong>Legal Obligation:</strong> To comply with applicable
                    laws and regulations
                  </li>
                </ul>
              </div>

              {/* Information Sharing */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  5. Information Sharing and Disclosure
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties except in the following
                  circumstances:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    <strong>Service Providers:</strong> Trusted third-party
                    service providers who assist us in operating our business
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights and safety
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with a
                    merger, acquisition, or sale of assets
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> When you explicitly
                    authorise us to share your information
                  </li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  All third-party service providers are contractually obligated
                  to maintain the confidentiality and security of your
                  information.
                </p>
              </div>

              {/* Data Security */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  6. Data Security
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We implement appropriate technical and organisational measures
                  to protect your personal information against unauthorised
                  access, alteration, disclosure, or destruction. These measures
                  include:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication procedures</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
              </div>

              {/* Data Retention */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  7. Data Retention
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  We retain your personal information only for as long as
                  necessary to fulfill the purposes outlined in this Privacy
                  Policy, unless a longer retention period is required or
                  permitted by law. Specific retention periods vary depending on
                  the type of information and the purpose for which it was
                  collected.
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  8. Your Rights
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  Under applicable data protection laws, you have the following
                  rights regarding your personal information:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>
                    <strong>Access:</strong> Request access to your personal
                    information
                  </li>
                  <li>
                    <strong>Rectification:</strong> Request correction of
                    inaccurate information
                  </li>
                  <li>
                    <strong>Erasure:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Request transfer of your data
                    to another service provider
                  </li>
                  <li>
                    <strong>Restriction:</strong> Request limitation of
                    processing
                  </li>
                  <li>
                    <strong>Objection:</strong> Object to processing based on
                    legitimate interests
                  </li>
                  <li>
                    <strong>Withdraw Consent:</strong> Withdraw consent where
                    processing is based on consent
                  </li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  To exercise these rights, please contact us using the
                  information provided below.
                </p>
              </div>

              {/* Cookies */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  9. Cookies and Tracking Technologies
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  We use cookies and similar tracking technologies to enhance
                  your experience on our website. These technologies help us:
                </p>
                <ul className='list-disc pl-6 text-leaf-700 space-y-2'>
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Improve website functionality and performance</li>
                  <li>Provide personalised content and recommendations</li>
                </ul>
                <p className='text-leaf-700 leading-relaxed mt-4'>
                  You can control cookie settings through your browser
                  preferences. However, disabling certain cookies may affect
                  website functionality.
                </p>
              </div>

              {/* International Transfers */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  10. International Data Transfers
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  Your personal information may be transferred to and processed
                  in countries other than your country of residence. We ensure
                  that such transfers comply with applicable data protection
                  laws and implement appropriate safeguards to protect your
                  information.
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  11. Children's Privacy
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  Our services are not intended for individuals under the age of
                  18. We do not knowingly collect personal information from
                  children. If you believe we have collected information from a
                  child, please contact us immediately.
                </p>
              </div>

              {/* Changes to Policy */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  12. Changes to This Privacy Policy
                </h2>
                <p className='text-leaf-700 leading-relaxed'>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices or applicable laws. We will notify
                  you of any material changes by posting the updated policy on
                  our website and updating the "Last updated" date.
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className='font-display text-2xl font-bold text-brand mb-4'>
                  13. Contact Us
                </h2>
                <p className='text-leaf-700 leading-relaxed mb-4'>
                  If you have any questions about this Privacy Policy or our
                  data practices, please contact us:
                </p>
                <div className='bg-mint rounded-lg p-6'>
                  <p className='text-leaf-700 font-semibold mb-2'>
                    Fermidas Consultancy
                  </p>
                  <p className='text-leaf-700'>Email: contact@fermidas.com</p>
                  <p className='text-leaf-700'>
                    Address: [Your Business Address]
                  </p>
                  <p className='text-leaf-700 mt-4'>
                    For data protection inquiries, you may also contact the
                    Information Commissioner's Office (ICO) in the UK.
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
