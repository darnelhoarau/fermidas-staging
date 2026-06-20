'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Logo } from './Logo';
import { Button } from './Button';
import { Container } from './Container';
import { UserMenu } from './UserMenu';

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Training', href: '/training/fermidas-pro' },
  { name: 'Audits', href: '/audits' },
  { name: 'Contact', href: '/contact' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-leaf-100'>
      <Container>
        <nav className='flex items-center justify-between py-4'>
          <Logo />

          {/* Desktop navigation */}
          <div className='hidden md:flex items-center gap-8'>
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'text-brand'
                    : 'text-leaf-600 hover:text-brand'
                }`}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA / User Menu */}
          <div className='hidden md:block'>
            {session ? (
              <UserMenu />
            ) : (
              <Button href='/contact' size='sm'>
                Get Started
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type='button'
            className='md:hidden print:hidden p-2 text-leaf-600 hover:text-brand'
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label='Toggle mobile menu'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-leaf-100'>
            <div className='space-y-4'>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block text-base font-medium transition-colors ${
                    pathname === item.href
                      ? 'text-brand'
                      : 'text-leaf-600 hover:text-brand'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  {item.name}
                </Link>
              ))}
              <div className='pt-4'>
                {session ? (
                  <UserMenu
                    isMobile
                    onMobileMenuToggle={() => setMobileMenuOpen(false)}
                  />
                ) : (
                  <Button href='/contact' size='sm' className='w-full'>
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}
