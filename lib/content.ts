export interface CoreValue {
  title: string;
  description: string;
}

export interface Service {
  title: string;
  description: string;
  features: string[];
  href: string;
}

export interface TrainingModule {
  title: string;
  description: string;
}

export interface TrainingTier {
  title: string;
  description: string;
  modules: string[];
}

export const siteContent = {
  tagline: 'Trusted, high-impact advisory for complex regulatory environments.',

  about: {
    condensed:
      'Fermidas Consultancy offers trusted and high-impact advisory services to help organisations and agencies thrive in complex regulatory environments. We specialise in compliance, governance, and strategic risk management across profit and non-profit regulated sectors. Our approach blends technical expertise with ethical leadership to deliver sustainable impact.',
    expanded:
      "Effective compliance isn't just meeting rules—it's building resilient systems, enhancing technical capacity, cultivating ethical cultures, and setting the right tone for long-term success. We help clients navigate regulatory landscapes with clarity, confidence, and precision.",
  },

  vision:
    'To be a premier consultancy recognised for advancing institutional excellence, ethical leadership, and sustainable sectoral growth. We envision a future where organisations thrive in complex regulatory environments through innovative compliance solutions, collaborative partnerships, and unwavering commitment to ethical standards. Our goal is to become the trusted advisor of choice for financial institutions, Credit Unions, and non-profit organisations seeking excellence in governance, risk management, and regulatory compliance.',

  mission:
    'Empower financial institutions and regulated entities with strategic compliance solutions that uphold integrity, foster resilience, and ensure regulatory excellence. We deliver expert guidance, tailored assessments, and transformative training that enable confident navigation of complex regulations. Through precision, collaboration, and continuous improvement, we build robust governance frameworks that promote ethical conduct, enhance resilience, and support sustainable long-term growth.',

  coreValues: [
    {
      title: 'Integrity',
      description:
        'We act with honesty and consistent transparency making decisions that build trust and honour commitments without compromise.',
    },
    {
      title: 'Excellence',
      description:
        'Delivering exceptional quality and precision in every service we provide.',
    },
    {
      title: 'Accountability',
      description:
        'Taking responsibility for our actions and ensuring transparency in all engagements.',
    },
    {
      title: 'Innovation',
      description:
        'Embracing new approaches and technologies to solve regulatory challenges fostering a culture of long term institutional resilience.',
    },
    {
      title: 'Collaboration',
      description:
        'Working closely with clients to improve stakeholder synergies and achieve shared success.',
    },
    {
      title: 'Ethical Leadership',
      description:
        'We champion principled decision making guided by our long term commitment for moral clarity and responsible conduct in every relationship and strategic undertaking.',
    },
  ] as CoreValue[],

  strategicObjectives: [
    'Strengthen compliance/governance frameworks',
    'Promote ethical culture and proactive risk',
    'Deliver tailored solutions aligned to evolving regulations',
    'Enhance client capacity via training, governance, leadership',
    'Expand regional/international presence via innovation and collaboration',
  ],

  sectors: [
    'Financial institutions & regulated entities',
    'Co-operative banks & Credit Unions',
    'Non-profit organisations',
  ],

  services: {
    trainingSolutions: {
      title: 'Training Solutions',
      description:
        'Comprehensive training programs designed to enhance compliance knowledge and skills across your organization.',
      features: [
        'Interactive Learning Modules',
        'Progress Tracking & Analytics',
        'Certification Programs',
        'Expert-Led Sessions',
        'Customizable Content',
        'Multi-Format Delivery',
      ],
    },

    complianceWatch: {
      title: 'Compliance Watch',
      description:
        'Daily real-time reports on adverse findings and media exposure to strengthen your risk-based assessment programme.',
      features: [
        'Daily Real-time Reports',
        'Adverse Findings Monitoring',
        'Media Exposure Tracking',
        'Risk-based Assessment Support',
        'Dynamic Database Building',
        'Proactive Risk Intelligence',
      ],
      countries: ['Seychelles', 'Mauritius'],
    },

    adverseScreeningReport: {
      title: 'Adverse Screening Report',
      description:
        'Bespoke adverse screening reports for designated individuals and entities with comprehensive risk domain analysis.',
      riskDomains: [
        'Legal & Regulatory Exposure',
        'Financial Integrity & Compliance',
        'Reputational & Media Monitoring',
        'Political Affiliations & Governance',
        'Human Rights & ESG Considerations',
      ],
    },

    financialInstitutions: {
      title: 'Financial Institutions & Regulated Entities',
      description:
        'Comprehensive compliance and risk management solutions for financial institutions operating in complex regulatory environments.',
      features: [
        'Compliance Consulting',
        'Risk-Based Assessment Programme',
        'AML/CFT & Proliferation Training',
        'Quality Assurance & Control Audits',
        'Fraud & Financial Crime Prevention',
        'FATCA & CRS Tax Compliance',
        'Sanction Screening Programme',
        'Trade Finance Monitoring Programme',
        'Consumer Protection & GDPR/Data Privacy',
        'Regulatory Compliance & Remedial Liaison',
        'Legal Research & Policy Review',
        'Anti-Bribery & Corruption Programme',
        'Peer Review & Assessment',
      ],
    },

    creditUnions: {
      title: 'Co-operative Banks & Credit Unions',
      description:
        'Specialized compliance and audit services aligned with international standards and WOCCU guidelines.',
      features: [
        'Compliance & Internal Audit Consulting',
        'Risk-Based Assessment Programme tailored for Credit Unions/co-ops',
        'AML/CFT & Proliferation Training',
        'Alignment with international standards and WOCCU guidelines',
        'Quality Assurance & Control Audits including model law standards for Credit Unions and PEARLS pre-certification audits',
        'Fraud & Financial Crime Prevention',
      ],
    },

    nonProfits: {
      title: 'Non-profit Organisations',
      description:
        'Compliance frameworks and risk assessments tailored for NGO/NPO contexts and regulatory requirements.',
      features: [
        'Compliance frameworks for NGO/NPO context',
        'Risk assessments',
        'AML/CFT training',
        'Policy & governance development',
        'GDPR/data protection',
        'Liaison with regulators',
        'Anti-bribery programmes',
      ],
    },
  },

  fermidasPro: {
    description:
      'Our comprehensive training platform featuring tiered learning levels, interactive modules, and progress tracking for compliance professionals.',
    tiers: [
      {
        title: 'Introductory',
        description: 'Training for new recruits and compliance professionals',
        modules: ['AML/CFT Basics', 'Regulatory Framework Overview'],
      },
      {
        title: 'Intermediate',
        description: 'Advanced concepts and practical applications',
        modules: [
          'Risk-Based Due Diligence',
          'Customer Due Diligence',
          'Screening Procedures',
        ],
      },
      {
        title: 'Professional',
        description: 'Expert-level training for senior compliance officers',
        modules: ['UBO Analysis', 'FATCA & OECD CRS', 'Trade-Based Compliance'],
      },
      {
        title: 'Human Resources/KYE',
        description: 'Specialized training for HR and KYE functions',
        modules: ['Employee Screening', 'KYE Procedures', 'HR Compliance'],
      },
      {
        title: 'Management',
        description: 'Leadership and strategic compliance management',
        modules: [
          'Compliance Strategy',
          'Risk Management',
          'Regulatory Liaison',
        ],
      },
    ] as TrainingTier[],

    modules: [
      {
        title: 'AML/CFT',
        description: 'Anti-Money Laundering and Counter-Financing of Terrorism',
      },
      {
        title: 'Proliferation Prevention',
        description: 'Preventing proliferation financing',
      },
      {
        title: 'Risk-Based Due Diligence',
        description: 'Comprehensive due diligence procedures',
      },
      {
        title: 'Fraud & Financial Crime Prevention',
        description: 'Proactive fraud prevention strategies',
      },
      {
        title: 'Customer Due Diligence',
        description: 'Enhanced customer verification processes',
      },
      {
        title: 'Screening',
        description: 'Sanctions and PEP screening procedures',
      },
      {
        title: 'UBO',
        description: 'Ultimate Beneficial Ownership identification',
      },
      { title: 'FATCA', description: 'Foreign Account Tax Compliance Act' },
      {
        title: 'OECD CRS',
        description: 'Common Reporting Standard compliance',
      },
      {
        title: 'Trade-Based Compliance',
        description: 'Trade finance monitoring and compliance',
      },
      {
        title: 'DNFBP Compliance',
        description:
          'Designated Non-Financial Business and Profession compliance',
      },
    ] as TrainingModule[],
  },

  audits: {
    description:
      'Independent audits and control reviews aligned with international standards for long-term operational integrity.',
    services: [
      'Independent audits & control reviews',
      'Regulatory compliance assessments',
      'Pre-certification audits',
      'Gap analysis and readiness assessments',
      'Long-term operational integrity reviews',
    ],
  },

  ctas: {
    primary: 'Speak with an advisor',
    secondary: 'Request a capability deck',
    training: 'Book a training demo',
  },
};
