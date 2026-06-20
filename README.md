# Fermidas Consultancy Website

A production-grade marketing website for Fermidas Consultancy, built with Next.js 15.5.2, TypeScript, and TailwindCSS.

## Features

- **Modern Design**: Clean, professional design with Fermidas brand colors
- **Responsive**: Mobile-first responsive design
- **SEO Optimised**: Built-in SEO with metadata, sitemap, and robots.txt
- **Accessible**: WCAG compliant with proper semantic HTML
- **Performance**: Optimised with Next.js App Router and Server Components
- **Contact Form**: Functional contact form with validation
- **Training Platform**: Dedicated Fermidas Pro training page

## Tech Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Fonts**: Inter (body) and Manrope (headings) via Google Fonts
- **Validation**: Zod for form validation
- **Utilities**: clsx and tailwind-merge for class management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd fermidas
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file (optional):

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

## Project Structure

```
app/
├── (marketing)/           # Marketing pages
│   ├── page.tsx          # Home page
│   ├── about/            # About page
│   ├── services/         # Services pages
│   ├── training/         # Training pages
│   ├── audits/           # Audits page
│   └── contact/          # Contact page
├── api/                  # API routes
│   └── contact/          # Contact form handler
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── sitemap.ts            # SEO sitemap
└── robots.txt            # SEO robots file

components/               # Reusable components
├── Button.tsx
├── Card.tsx
├── Container.tsx
├── ContactForm.tsx
├── FeatureList.tsx
├── Footer.tsx
├── Header.tsx
├── Kicker.tsx
├── Logo.tsx
├── Section.tsx
├── Split.tsx
├── Stat.tsx
└── ValuePill.tsx

lib/                     # Utility functions
├── cn.ts               # Class name utility
├── content.ts          # Site content
└── seo.ts              # SEO helpers

public/
└── fermidas-logo.svg  # Brand logo
```

## Brand Colors

The website uses a custom color palette defined in `app/globals.css`:

- **Brand**: `#141A1B` (dark teal)
- **Leaf**: `#749694` (teal) with 50-900 scale
- **Gold**: `#C9A227` (accent)
- **Sand**: `#ECE8E1` (light)
- **Mint**: `#E8F2F1` (very light teal)

## Components

### Core Components

- **Logo**: Fermidas logo with optional text
- **Header**: Responsive navigation with mobile menu
- **Footer**: Site footer with links and contact info
- **Button**: Primary, secondary, and ghost variants
- **Card**: Consistent card styling
- **Section**: Page sections with title and eyebrow support
- **ContactForm**: Functional contact form with validation

### Layout Components

- **Container**: Max-width container with responsive padding
- **Split**: Two-column layout for content and media
- **FeatureList**: Grid layout for features
- **ValuePill**: Core values display

## Pages

### Home (`/`)

- Hero section with tagline and CTAs
- Core values display
- Services overview
- Fermidas Pro highlight
- Regulatory standards showcase

### About (`/about`)

- Mission and vision
- Core values grid
- Strategic objectives
- Leadership placeholder

### Services (`/services`)

- Service categories overview
- Training modules
- Delivery formats

### Service Detail Pages

- **Financial Institutions** (`/services/financial-institutions`)
- **Credit Unions** (`/services/credit-unions`)
- **Non-profits** (`/services/non-profits`)

### Training (`/training/fermidas-pro`)

- Training tiers
- Module catalog
- Delivery formats
- Certificates and analytics

### Audits (`/audits`)

- Regulatory standards
- Audit approach
- Services offered
- Process steps

### Contact (`/contact`)

- Contact form
- Contact information
- Quick actions
- FAQ section

## API Routes

### Contact Form (`/api/contact`)

- POST endpoint for contact form submissions
- Zod validation for form data
- Returns JSON response

## SEO Features

- **Metadata**: Each page has proper title, description, and Open Graph tags
- **Sitemap**: Automatic sitemap generation
- **Robots.txt**: Search engine crawling instructions
- **Structured Data**: Ready for schema markup
- **Performance**: Optimised images and fonts

## Accessibility

- **Semantic HTML**: Proper heading hierarchy and landmarks
- **ARIA Labels**: Screen reader support
- **Focus Management**: Visible focus indicators
- **Color Contrast**: WCAG AA compliant
- **Skip Links**: Keyboard navigation support

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Set environment variables if needed
3. Deploy automatically on push

### Other Platforms

The site can be deployed to any platform that supports Next.js:

```bash
npm run build
npm run start
```

## Environment Variables

Optional environment variables:

```env
NEXT_PUBLIC_WEBSITE_URL=https://www.fermidas.com
```

## Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Ensure accessibility standards are met
4. Test on multiple devices and browsers
5. Update documentation as needed

## License

This project is proprietary to Fermidas Consultancy.

## Support

For questions or support, contact the development team or refer to the Next.js documentation.
