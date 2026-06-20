'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface NavItem {
  id: string;
  label: string;
  count: number;
}

export function ReportSidebar() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const intersectingIds = useRef(new Set<string>());
  const categoryOrder = useRef<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const initObserver = useCallback(() => {
    observerRef.current?.disconnect();
    intersectingIds.current.clear();

    const els = Array.from(
      document.querySelectorAll<HTMLElement>('.report-content .category[id]'),
    );

    const navItems = els
      .map((el) => ({
        id: el.id,
        label: el.querySelector('.category-title')?.textContent?.trim() ?? '',
        count: el.querySelectorAll('.item').length,
      }))
      .filter((item) => item.id && item.label);

    setItems(navItems);
    categoryOrder.current = navItems.map((i) => i.id);

    const syncActive = () => {
      for (const id of categoryOrder.current) {
        if (intersectingIds.current.has(id)) {
          setActiveId(id);
          return;
        }
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) intersectingIds.current.add(e.target.id);
          else intersectingIds.current.delete(e.target.id);
        });
        syncActive();
      },
      { rootMargin: '-5% 0px -55% 0px', threshold: 0 },
    );

    els.forEach((el) => observer.observe(el));
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    initObserver();

    const onLanguageChange = () => initObserver();
    window.addEventListener('report-language-change', onLanguageChange);

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('report-language-change', onLanguageChange);
    };
  }, [initObserver]);

  const scrollTo = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveId(id);
    setIsOpen(false);
  }, []);

  if (items.length === 0) return null;

  const navLinks = (
    <ul className='space-y-0.5'>
      {items.map((item) => (
        <li key={item.id}>
          <button
            type='button'
            onClick={() => scrollTo(item.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors duration-150 ${
              activeId === item.id
                ? 'bg-[#edf3f3] font-semibold text-[#749694]'
                : 'text-[#354848] hover:bg-[#f5f9f9] hover:text-[#749694]'
            }`}
          >
            <span className='flex-1'>{item.label}</span>
            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                activeId === item.id
                  ? 'bg-[#749694] text-white'
                  : 'bg-[#dce7e6] text-[#354848]'
              }`}
            >
              {item.count}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Mobile FAB — hidden in print */}
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className='fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#749694] text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 print:hidden lg:hidden'
        aria-label='Open categories menu'
      >
        <svg
          width='20'
          height='20'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2.5'
          strokeLinecap='round'
        >
          <line x1='3' y1='6' x2='21' y2='6' />
          <line x1='3' y1='12' x2='17' y2='12' />
          <line x1='3' y1='18' x2='13' y2='18' />
        </svg>
      </button>

      {/* Mobile overlay — hidden in print */}
      <div
        className={`fixed inset-0 z-50 print:hidden lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className='flex items-center justify-between border-b border-[#dce7e6] px-5 py-4'>
            <span className='text-xs font-semibold uppercase tracking-widest text-[#749694]'>
              Categories
            </span>
            <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='rounded-lg p-1.5 text-[#5f7b7b] transition-colors hover:bg-[#f5f9f9] hover:text-[#354848]'
              aria-label='Close menu'
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
              >
                <line x1='18' y1='6' x2='6' y2='18' />
                <line x1='6' y1='6' x2='18' y2='18' />
              </svg>
            </button>
          </div>
          <div className='flex-1 overflow-y-auto p-4'>{navLinks}</div>
        </div>
      </div>

      {/* Desktop sticky sidebar — hidden in print */}
      <nav className='sticky top-24 hidden w-56 shrink-0 self-start print:hidden lg:block xl:w-64'>
        <div className='rounded-2xl bg-white p-5 shadow-md'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-widest text-[#749694]'>
            Categories
          </p>
          {navLinks}
        </div>
      </nav>
    </>
  );
}
