import type { Metadata, Viewport } from 'next';
import { Inter, Manrope } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Analytics } from '@vercel/analytics/react';
import { siteConfig } from '@/lib/seo-config';
import { SessionProvider } from '@/components/SessionProvider';

// -------------------------------------------------------------
// Fonts (wired to CSS vars used by globals.css @theme tokens)
// -------------------------------------------------------------
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

// Prefer configuring this via NEXT_PUBLIC_WEBSITE_URL in env; falls back to prod URL stub.
const SITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.replace(/\/$/, '') ||
  'https://www.fermidas.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  applicationName: 'Fermidas',
  authors: siteConfig.authors,
  category: 'Professional Services',
  creator: siteConfig.creator,
  publisher: siteConfig.publisher,
  alternates: siteConfig.alternates,
  formatDetection: siteConfig.formatDetection,
  verification: siteConfig.verification,
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Fermidas',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: `${SITE_URL}/fermidas-share.png`,
        width: 1200,
        height: 630,
        alt: 'Fermidas – Trusted Compliance & Governance Advisory',
      },
    ],
  },
  twitter: {
    ...siteConfig.twitter,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: siteConfig.robots,
  icons: siteConfig.icons,
  manifest: siteConfig.manifest,
  other: {
    ...siteConfig.other,
    'theme-name': 'Fermidas',
  },
};

// Viewport + theme color hints (Next supports exporting this separately)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#141A1B' }, // brand
    { media: '(prefers-color-scheme: dark)', color: '#141A1B' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        className={`${inter.variable} ${manrope.variable} min-h-dvh bg-background text-foreground font-sans antialiased`}
      >
        <SessionProvider>
          {/* Skip link for a11y */}
          <a
            href='#main'
            className='sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded-md focus:bg-leaf-600 focus:px-3 focus:py-2 focus:text-brand-foreground'
          >
            Skip to content
          </a>

          <Header />

          <main id='main'>{children}</main>

          <Footer />

          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
