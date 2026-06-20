'use client';

import { useState } from 'react';

interface Language {
  code: string;
  html: string;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fr: 'Français',
  sc: 'Kreol',
};

interface Props {
  languages: Language[];
  defaultLanguage: string;
}

export function ReportLanguageSwitcher({ languages, defaultLanguage }: Props) {
  const initial =
    languages.find((l) => l.code === defaultLanguage) ?? languages[0];
  const [activeCode, setActiveCode] = useState(initial?.code ?? '');

  const activeHtml = languages.find((l) => l.code === activeCode)?.html ?? '';
  const showTabs = languages.length > 1;

  const handleSwitch = (code: string) => {
    setActiveCode(code);
    // Notify ReportSidebar to re-bind its IntersectionObserver to the new DOM nodes
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('report-language-change'));
    }, 60);
  };

  return (
    <>
      <div
        className='report-content'
        dangerouslySetInnerHTML={{ __html: activeHtml }}
      />

      {showTabs && (
        <div className='fixed bottom-6 left-1/2 z-30 -translate-x-1/2 print:hidden'>
          <div className='flex items-center gap-1 rounded-full bg-white px-2 py-1.5 shadow-lg ring-1 ring-black/10'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                type='button'
                onClick={() => handleSwitch(lang.code)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 sm:py-1.5 ${
                  activeCode === lang.code
                    ? 'bg-[#749694] text-white'
                    : 'text-[#354848] hover:bg-[#edf3f3] hover:text-[#749694]'
                }`}
              >
                {LANGUAGE_NAMES[lang.code] ?? lang.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
