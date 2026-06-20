export const siteConfig = {
  name: 'Fermidas',
  description:
    'Trusted compliance and governance advisory services. We help organisations thrive in complex regulatory environments with technical expertise and ethical leadership.',
  url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com',
  ogImage: '/fermidas-share.png',
  links: {
    twitter: 'https://twitter.com/fermidas',
    linkedin: 'https://linkedin.com/company/fermidas',
  },
  keywords: [
    'compliance consultancy',
    'governance advisory',
    'risk management',
    'regulatory compliance',
    'financial institutions',
    'Credit Unions',
    'non-profit compliance',
    'regulatory standards',
    'audit services',
    'training programs',
    'professional development',
    'compliance training',
    'regulatory framework',
    'compliance solutions',
    'governance framework',
    'risk assessment',
    'compliance monitoring',
    'regulatory reporting',
    'compliance certification',
    'professional advisory',
  ],
  authors: [
    {
      name: 'Fermidas Consultancy',
      url: 'https://www.fermidas.com',
    },
  ],
  creator: 'Fermidas Consultancy',
  publisher: 'Fermidas Consultancy',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'
  ),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large' as const,
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com',
    siteName: 'Fermidas',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/fermidas-share.png`,
        width: 1200,
        height: 630,
        alt: 'Fermidas - Trusted Compliance & Governance Advisory',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@fermidas',
    creator: '@fermidas',
    images: [
      `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/fermidas-share.png`,
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png' }],
    shortcut: ['/favicon.ico'],
  },
  manifest: '/site.webmanifest',
  other: {
    'msapplication-TileColor': '#141A1B',
    'theme-color': '#141A1B',
  },
};

export const pageConfigs = {
  home: {
    title: 'Fermidas - Trusted Compliance & Governance Advisory',
    description:
      'Fermidas Consultancy delivers trusted, high-impact advisory across compliance, governance, and strategic risk. We help organisations thrive in complex regulatory environments with technical expertise and ethical leadership.',
    keywords: [
      'compliance consultancy',
      'governance advisory',
      'risk management',
      'regulatory compliance',
      'financial institutions',
      'regulatory standards',
      'audit services',
      'training programs',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Fermidas',
      url: process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com',
      logo: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/fermidas-logo.svg`,
      description: 'Trusted compliance and governance advisory services',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'UK',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/contact`,
      },
      sameAs: [
        'https://twitter.com/fermidas',
        'https://linkedin.com/company/fermidas',
      ],
      serviceArea: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Compliance Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Compliance Advisory',
              description:
                'Expert guidance on regulatory compliance and governance frameworks',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Audit Services',
              description:
                'Quality assurance and control audits aligned with regulatory standards',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Training Programs',
              description:
                'Professional development and compliance training solutions',
            },
          },
        ],
      },
    },
  },
  about: {
    title: 'About Fermidas - Our Mission & Values',
    description:
      "Learn about Fermidas Consultancy's mission to deliver trusted advisory services. Discover our core values, strategic objectives, and commitment to ethical leadership in compliance and governance.",
    keywords: [
      'about fermidas',
      'mission statement',
      'core values',
      'strategic objectives',
      'ethical leadership',
      'compliance expertise',
      'governance framework',
      'professional advisory',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Fermidas',
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/about`,
      description: 'Trusted compliance and governance advisory services.',
      foundingDate: '2020',
      mission:
        'To help organisations thrive in complex regulatory environments with technical expertise and ethical leadership',
      values: [
        'Trust and Integrity',
        'Technical Excellence',
        'Ethical Leadership',
        'Client Partnership',
      ],
    },
  },
  services: {
    title: 'Our Services - Compliance & Governance Solutions',
    description:
      'Comprehensive compliance and governance services for financial institutions, Credit Unions, and non-profit organisations. Expert advisory, training, and audit services tailored to your needs.',
    keywords: [
      'compliance services',
      'governance solutions',
      'financial institutions',
      'Credit Unions',
      'non-profit compliance',
      'training modules',
      'audit services',
      'regulatory advisory',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Compliance & Governance Services',
      provider: {
        '@type': 'Organization',
        name: 'Fermidas',
      },
      description:
        'Comprehensive compliance and governance solutions for financial institutions, Credit Unions, and non-profit organisations',
      serviceType: 'Professional Advisory',
      areaServed: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Service Categories',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Financial Institutions',
              description:
                'Specialized compliance services for banks and financial services companies',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Credit Unions',
              description:
                'Compliance and governance solutions for co-operative banks and Credit Unions',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Non-profit Organisations',
              description:
                'Regulatory compliance and governance advisory for non-profit sector',
            },
          },
        ],
      },
    },
  },
  training: {
    title: 'Fermidas Pro - Professional Compliance Training Platform',
    description:
      "Transform your organisation's compliance training with Fermidas Pro. Access professional certificates, track progress with analytics, and ensure regulatory compliance through our comprehensive training platform.",
    keywords: [
      'compliance training',
      'fermidas pro',
      'professional certificates',
      'training platform',
      'progress tracking',
      'analytics dashboard',
      'regulatory training',
      'professional development',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Fermidas Pro',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      description:
        'Professional compliance training platform with certificates and analytics',
      provider: {
        '@type': 'Organization',
        name: 'Fermidas',
      },
      offers: {
        '@type': 'Offer',
        category: 'Training Platform',
        description: 'Comprehensive compliance training solution',
      },
      featureList: [
        'Professional Certificates',
        'Progress Tracking',
        'Analytics Dashboard',
        'Compliance Monitoring',
        'Regulatory Reporting',
      ],
    },
  },
  audits: {
    title:
      'Quality Assurance & Control Audits - Regulatory Standards Alignment',
    description:
      'Expert audit services aligned with regulatory standards. Our comprehensive audit approach includes readiness assessments, compliance monitoring, and detailed reporting to ensure your organisation meets regulatory requirements.',
    keywords: [
      'audit services',
      'quality assurance',
      'control audits',
      'regulatory standards',
      'readiness assessments',
      'compliance monitoring',
      'regulatory reporting',
      'audit benefits',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Quality Assurance & Control Audits',
      provider: {
        '@type': 'Organization',
        name: 'Fermidas',
      },
      description:
        'Expert audit services aligned with regulatory standards for quality assurance and control',
      serviceType: 'Audit Services',
      areaServed: {
        '@type': 'Country',
        name: 'United Kingdom',
      },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Audit Services',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Regulatory Standards Alignment',
              description:
                'Audit services aligned with international regulatory standards',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Readiness Assessments',
              description:
                'Comprehensive readiness assessments for compliance requirements',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'Compliance Monitoring',
              description:
                'Ongoing compliance monitoring and reporting services',
            },
          },
        ],
      },
    },
  },
  contact: {
    title: 'Contact Fermidas - Get Expert Compliance Advisory',
    description:
      'Ready to enhance your compliance and governance? Contact Fermidas for expert advisory services, training solutions, and audit support. Get in touch today for a consultation.',
    keywords: [
      'contact fermidas',
      'compliance consultation',
      'expert advisory',
      'training demo',
      'audit support',
      'get started',
      'consultation request',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact Fermidas',
      description:
        'Contact page for Fermidas compliance and governance advisory services',
      mainEntity: {
        '@type': 'Organization',
        name: 'Fermidas',
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          url: `${process.env.NEXT_PUBLIC_WEBSITE_URL || 'https://www.fermidas.com'}/contact`,
          availableLanguage: 'English',
        },
      },
    },
  },
  seychellesIntelligence: {
    title: 'Seychelles Intelligence - Coming Soon | Fermidas',
    description:
      'Advanced intelligence and compliance monitoring services specifically designed for the Seychelles jurisdiction. Comprehensive surveillance, analysis, and reporting to support your regulatory compliance needs.',
    keywords: [
      'Seychelles intelligence',
      'Seychelles compliance',
      'Seychelles regulatory monitoring',
      'Seychelles jurisdiction',
      'intelligence services',
      'compliance monitoring',
      'regulatory surveillance',
      'Seychelles regulatory compliance',
      'jurisdiction-specific intelligence',
      'compliance intelligence',
      'regulatory analysis',
      'compliance reporting',
    ],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Seychelles Intelligence',
      description:
        'Advanced intelligence and compliance monitoring services specifically designed for the Seychelles jurisdiction',
      provider: {
        '@type': 'Organization',
        name: 'Fermidas',
      },
      serviceType: 'Intelligence Services',
      areaServed: {
        '@type': 'Country',
        name: 'Seychelles',
      },
      availability: 'Coming Soon',
      offers: {
        '@type': 'Offer',
        availability: 'https://schema.org/PreOrder',
        description:
          'Advanced intelligence services for Seychelles compliance monitoring',
      },
    },
  },
};

export function generateStructuredData(data: Record<string, unknown>) {
  return JSON.stringify(data);
}
