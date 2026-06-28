'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  UserIcon,
  Logout01Icon,
  Settings01Icon,
  Shield01Icon,
  ArrowDown01Icon,
} from 'hugeicons-react';

interface UserMenuProps {
  isMobile?: boolean;
  onMobileMenuToggle?: () => void;
}

export function UserMenu({ isMobile = false }: UserMenuProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is admin using the role from session
    if (session?.user) {
      setIsAdmin(session.user.role === 'ADMIN');
    }
  }, [session]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener(
        'touchstart',
        handleClickOutside as EventListener,
      );
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener(
        'touchstart',
        handleClickOutside as EventListener,
      );
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    // Use current origin to ensure correct port (3001) is used
    const callbackUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/` : '/';
    await signOut({ callbackUrl });
  };

  if (status === 'loading') {
    return (
      <div className='flex items-center gap-2'>
        <div className='h-8 w-8 rounded-full bg-leaf-200 animate-pulse' />
        <div className='h-4 w-16 bg-leaf-200 rounded animate-pulse' />
      </div>
    );
  }

  if (!session) {
    return (
      <Link href='/api/auth/signin'>
        <button className='btn btn-primary'>Sign In</button>
      </Link>
    );
  }

  const userMenuItems = [
    {
      label: 'My Account',
      href: '/digital/account',
      icon: UserIcon,
      description: 'View your account details',
    },
    {
      label: 'Compliance Reports',
      href: '/digital/compliance-watch/reports',
      icon: Settings01Icon,
      description: 'View your compliance reports',
    },
    {
      label: 'Training Courses',
      href: '/digital/training',
      icon: Settings01Icon,
      description: 'Browse and continue training',
    },
  ];

  const adminMenuItems = [
    {
      label: 'System Admin',
      href: '/digital/admin/system',
      icon: Shield01Icon,
      description: 'Manage users and roles',
    },
    {
      label: 'Admin Dashboard',
      href: '/digital/admin/compliance-watch',
      icon: Shield01Icon,
      description: 'Manage Compliance Watch',
    },
    {
      label: 'Training Admin',
      href: '/digital/admin/training',
      icon: Shield01Icon,
      description: 'Manage training courses',
    },
    {
      label: 'Manage Sources',
      href: '/digital/admin/compliance-watch/sources',
      icon: Settings01Icon,
      description: 'Configure data sources',
    },
    {
      label: 'Manage Categories',
      href: '/digital/admin/compliance-watch/categories',
      icon: Settings01Icon,
      description: 'Organize source categories',
    },
    {
      label: 'Settings',
      href: '/digital/admin/compliance-watch/settings',
      icon: Settings01Icon,
      description: 'System configuration',
    },
  ];

  const allMenuItems = [...userMenuItems, ...(isAdmin ? adminMenuItems : [])];

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Desktop User Menu */}
      {!isMobile && (
        <div className='flex items-center gap-4'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='flex items-center gap-2 px-3 py-2 rounded-lg border border-leaf-200 bg-white hover:bg-leaf-50 transition-colors'
          >
            <div className='h-8 w-8 rounded-full bg-brand flex items-center justify-center'>
              <UserIcon size={16} className='text-white' />
            </div>
            <span className='text-sm font-medium text-brand'>
              {session.user.name || session.user.email}
            </span>
            <ArrowDown01Icon
              size={16}
              className={`text-leaf-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}

      {/* Mobile User Menu */}
      {isMobile && (
        <div className='w-full'>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className='flex items-center gap-2 px-3 py-2 rounded-lg border border-leaf-200 bg-white hover:bg-leaf-50 transition-colors w-full'
          >
            <div className='h-8 w-8 rounded-full bg-brand flex items-center justify-center'>
              <UserIcon size={16} className='text-white' />
            </div>
            <span className='text-sm font-medium text-brand'>
              {session.user.name || session.user.email}
            </span>
            <ArrowDown01Icon
              size={16}
              className={`text-leaf-600 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`${isMobile ? 'relative mt-2 w-full' : 'absolute right-0 top-full mt-2 w-64'} bg-white rounded-lg shadow-lg border border-leaf-200 z-50`}
        >
          <div className='p-4 border-b border-leaf-100'>
            <div className='flex items-center gap-3'>
              {/* <div className='h-10 w-10 rounded-full bg-brand flex items-center justify-center'>
                <UserIcon size={20} className='text-white' />
              </div> */}
              <div>
                <p className='font-medium text-brand'>
                  {session.user.name || 'User'}
                </p>
                <p className='text-sm text-leaf-600'>{session.user.email}</p>
                {isAdmin && (
                  <span className='inline-block mt-1 px-2 py-1 text-xs font-semibold text-brand bg-brand/10 rounded-full'>
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='py-2'>
            {allMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className='flex items-center gap-3 px-4 py-3 text-sm text-leaf-700 hover:bg-leaf-50 hover:text-brand transition-colors'
                onClick={() => setIsOpen(false)}
              >
                <item.icon size={18} className='text-leaf-500' />
                <div>
                  <p className='font-medium'>{item.label}</p>
                  <p className='text-xs text-leaf-500'>{item.description}</p>
                </div>
              </Link>
            ))}

            <div className='border-t border-leaf-100 my-2' />

            <button
              onClick={handleSignOut}
              className='flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-error/10 w-full text-left transition-colors'
            >
              <Logout01Icon size={18} />
              <div>
                <p className='font-medium'>Sign Out</p>
                <p className='text-xs text-leaf-500'>End your session</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Backdrop for mobile */}
      {isOpen && isMobile && (
        <div
          className='fixed inset-0 bg-black/20 z-40'
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
