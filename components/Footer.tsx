import Link from 'next/link';
import Image from 'next/image';
import { Container } from './Container';

const quickLinks = [
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Training', href: '/training/fermidas-pro' },
  { name: 'Audits', href: '/audits' },
  { name: 'Contact', href: '/contact' },
];

const services = [
  { name: 'Financial Institutions', href: '/services/financial-institutions' },
  { name: 'Credit Unions', href: '/services/credit-unions' },
  { name: 'Non-profits', href: '/services/non-profits' },
  { name: 'Government Agencies', href: '/services/government-agencies' },
  { name: 'Seychelles Intelligence', href: '/services/seychelles-intelligence' },
];

export function Footer() {
  return (
    <footer className='bg-brand text-brand-foreground'>
      <Container>
        <div className='py-16'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {/* Brand */}
            <div className='md:col-span-2'>
              <div className='mb-6'>
                <Link href='/' className='inline-flex items-center gap-3'>
                  <Image
                    src='/fermidas-logo-alt.svg'
                    alt='Fermidas'
                    width={48}
                    height={48}
                    className='h-12 w-12'
                    priority
                  />
                  <span className='font-display text-xl font-bold text-brand-foreground'>
                    FERMIDAS
                  </span>
                </Link>
              </div>
              <p className='text-leaf-200 mb-6 max-w-md'>
                Trusted, high-impact advisory for complex regulatory
                environments. We help organisations thrive with technical
                expertise and ethical leadership.
              </p>
              <div className='space-y-2 text-sm text-leaf-300'>
                <p className='font-semibold'>Fermidas Consultancy</p>
                <p>From compliance to resilience.</p>
                <p>Email: contact@fermidas.com</p>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className='font-display text-lg font-semibold mb-4'>
                Quick Links
              </h3>
              <ul className='space-y-2'>
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className='text-leaf-200 hover:text-white transition-colors'
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className='font-display text-lg font-semibold mb-4'>
                Services
              </h3>
              <ul className='space-y-2'>
                {services.map((service) => (
                  <li key={service.name}>
                    <Link
                      href={service.href}
                      className='text-leaf-200 hover:text-white transition-colors'
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className='border-t border-leaf-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4'>
            <p className='text-sm text-leaf-300'>
              © {new Date().getFullYear()} Fermidas Consultancy. All rights
              reserved.
            </p>
            <div className='flex items-center gap-6 text-sm text-leaf-300'>
              <Link
                href='/privacy'
                className='hover:text-white transition-colors'
              >
                Privacy Policy
              </Link>
              <Link
                href='/terms'
                className='hover:text-white transition-colors'
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
