// Temporarily disabled - @react-email/components not installed
// import * as React from 'react';
// import {
//   Html,
//   Head,
//   Body,
//   Container,
//   Section,
//   Heading,
//   Text,
//   Button,
//   Hr,
// } from '@react-email/components';

interface ComplianceReportEmailProps {
  reportDate: string;
  reportUrl: string;
  totalItems: number;
  userName?: string;
  language?: string;
}

export default function ComplianceReportEmail(
  _props: ComplianceReportEmailProps
) {
  // Temporarily disabled - @react-email/components not installed; props used when template is uncommented
  return null;
  /* 
  const translations = getTranslations(language);

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={logo}>Fermidas</Heading>
            <Text style={tagline}>{translations.tagline}</Text>
          </Section>

          <Section style={content}>
            <Heading style={title}>
              {translations.greeting.replace('{name}', userName)}
            </Heading>

            <Text style={paragraph}>{translations.intro}</Text>

            <Section style={statsBox}>
              <Text style={statsText}>
                <strong style={statsNumber}>{totalItems}</strong>{' '}
                {translations.newUpdates}
              </Text>
              <Text style={statsDate}>{reportDate}</Text>
            </Section>

            <Button style={button} href={reportUrl}>
              {translations.viewReport}
            </Button>

            <Text style={paragraph}>{translations.highlights}</Text>

            <ul style={list}>
              <li style={listItem}>{translations.highlight1}</li>
              <li style={listItem}>{translations.highlight2}</li>
              <li style={listItem}>{translations.highlight3}</li>
            </ul>

            <Hr style={divider} />

            <Text style={footerText}>{translations.footer}</Text>

            <Text style={footerLinks}>
              <a href="https://www.fermidas.com/digital/account" style={link}>
                {translations.manageSubscription}
              </a>{' '}
              |{' '}
              <a href="https://www.fermidas.com/contact" style={link}>
                {translations.contact}
              </a>
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerCopyright}>
              © 2025 Fermidas. {translations.rights}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
  */
}

/* Used when email template below is uncommented. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getTranslations(_language: string) {
  const translations: Record<string, Record<string, string>> = {
    en: {
      tagline: 'Compliance Watch',
      greeting: 'Hello {name},',
      intro:
        "Your daily Compliance Watch report is ready. We've monitored Seychelles regulatory and legal sources and found important updates.",
      newUpdates: 'new updates',
      viewReport: 'View Full Report',
      highlights: "Today's report includes:",
      highlight1: 'Regulatory updates from key Seychelles authorities',
      highlight2: 'Legal changes and gazette notifications',
      highlight3: 'Financial institution announcements',
      footer:
        'This report is generated daily from public sources. For questions or support, contact us.',
      manageSubscription: 'Manage Subscription',
      contact: 'Contact Us',
      rights: 'All rights reserved.',
    },
    fr: {
      tagline: 'Surveillance de la Conformité',
      greeting: 'Bonjour {name},',
      intro:
        'Votre rapport quotidien de Surveillance de la Conformité est prêt. Nous avons surveillé les sources réglementaires et légales seychelloises et trouvé des mises à jour importantes.',
      newUpdates: 'nouvelles mises à jour',
      viewReport: 'Voir le Rapport Complet',
      highlights: "Le rapport d'aujourd'hui comprend :",
      highlight1:
        'Mises à jour réglementaires des autorités seychelloises clés',
      highlight2: 'Changements légaux et notifications de la gazette',
      highlight3: 'Annonces des institutions financières',
      footer:
        'Ce rapport est généré quotidiennement à partir de sources publiques. Pour des questions ou un support, contactez-nous.',
      manageSubscription: "Gérer l'abonnement",
      contact: 'Nous Contacter',
      rights: 'Tous droits réservés.',
    },
  };

  return translations[_language] || translations.en;
}

// Styles (used when email template above is uncommented)
/* eslint-disable @typescript-eslint/no-unused-vars */
const main = {
  backgroundColor: '#f7faf9',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '600px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#141a1b',
  margin: '0 0 8px',
};

const tagline = {
  fontSize: '14px',
  color: '#5f7b7b',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '40px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
};

const title = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#141a1b',
  margin: '0 0 24px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#111213',
  margin: '0 0 24px',
};

const statsBox = {
  backgroundColor: '#edf3f3',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const statsText = {
  fontSize: '16px',
  color: '#354848',
  margin: '0 0 8px',
};

const statsNumber = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#749694',
};

const statsDate = {
  fontSize: '14px',
  color: '#5f7b7b',
  margin: '0',
};

const button = {
  backgroundColor: '#749694',
  color: '#f7faf9',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '16px 32px',
  borderRadius: '8px',
  margin: '24px 0',
};

const list = {
  padding: '0 0 0 20px',
  margin: '0 0 24px',
};

const listItem = {
  fontSize: '16px',
  lineHeight: '1.6',
  color: '#111213',
  marginBottom: '8px',
};

const divider = {
  borderColor: '#dce7e6',
  margin: '32px 0',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.6',
  color: '#5f7b7b',
  margin: '0 0 16px',
};

const footerLinks = {
  fontSize: '14px',
  color: '#5f7b7b',
  textAlign: 'center' as const,
  margin: '0 0 24px',
};

const link = {
  color: '#749694',
  textDecoration: 'underline',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const footerCopyright = {
  fontSize: '12px',
  color: '#9fb8b8',
  margin: '0',
};
