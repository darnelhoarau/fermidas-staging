'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [killSwitch, setKillSwitch] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [reportTime, setReportTime] = useState('06:00');
  const [languages, setLanguages] = useState<string[]>(['en']);
  const [defaultLanguage, setDefaultLanguage] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newLanguageCode, setNewLanguageCode] = useState('');

  useEffect(() => {
    // Load current settings
    fetch('/api/admin/compliance-watch/settings')
      .then((res) => res.json())
      .then((data) => {
        setKillSwitch(data.killSwitch || false);
        setFrequency(data.frequency || 'daily');
        setReportTime(data.reportTime || '06:00');
        setLanguages(data.allowedLanguages || ['en']);
        setDefaultLanguage(data.defaultLanguage || 'en');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/compliance-watch/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        killSwitch,
        frequency,
        reportTime,
        allowedLanguages: languages,
        defaultLanguage,
      }),
    });
    setSaving(false);
    alert('Settings saved successfully');
  };

  const addLanguage = () => {
    const code = newLanguageCode.trim().toLowerCase();
    if (code && !languages.includes(code)) {
      setLanguages([...languages, code]);
      setNewLanguageCode('');
    }
  };

  const removeLanguage = (lang: string) => {
    if (lang === defaultLanguage) {
      alert(
        'Cannot remove the default language. Please set another language as default first.'
      );
      return;
    }
    if (languages.length > 1) {
      setLanguages(languages.filter((l) => l !== lang));
    } else {
      alert('At least one language must be enabled');
    }
  };

  const setAsDefault = (lang: string) => {
    setDefaultLanguage(lang);
  };

  const languageNames: Record<string, string> = {
    en: 'English',
    fr: 'French',
    de: 'German',
    es: 'Spanish',
    pt: 'Portuguese',
    it: 'Italian',
    zh: 'Chinese',
    ja: 'Japanese',
    ar: 'Arabic',
    ru: 'Russian',
    sc: 'Seychelles Creole',
  };

  if (loading) {
    return (
      <div className='bg-gradient-to-br from-mint to-white py-24 md:pb-28 text-center text-leaf-900'>
        Loading...
      </div>
    );
  }

  return (
    <section className='bg-gradient-to-br from-mint to-white pt-12 pb-24 md:pb-28'>
      <div className='container'>
        <div className='mb-12'>
          <Link
            href='/digital/admin/compliance-watch'
            className='mb-6 inline-block text-sm text-leaf-700 hover:text-leaf-900'
          >
            ← Back to Dashboard
          </Link>
          <h1 className='font-display mb-4 text-2xl font-bold text-brand md:text-4xl'>
            Settings
          </h1>
          <p className='text-lg text-leaf-700'>
            Configure Compliance Watch behavior
          </p>
        </div>

        <div className='mx-auto max-w-2xl space-y-6'>
          {/* Kill Switch */}
          <div className='card p-6'>
            <div className='mb-4'>
              <h2 className='mb-2 text-xl font-bold text-brand'>
                Emergency Kill Switch
              </h2>
              <p className='text-sm text-leaf-700'>
                Instantly stop all report generation and email delivery.
              </p>
            </div>

            <div className='flex items-center justify-between rounded-lg bg-leaf-50 p-4'>
              <div>
                <div className='font-semibold text-brand'>
                  {killSwitch ? '⚠️ Kill Switch is ON' : '✓ System is Running'}
                </div>
                <div className='text-sm text-leaf-600'>
                  {killSwitch
                    ? 'No reports will be generated'
                    : 'Reports generate normally'}
                </div>
              </div>
              <button
                onClick={() => setKillSwitch(!killSwitch)}
                className={`rounded-lg px-6 py-2 font-semibold ${
                  killSwitch ? 'bg-success text-white' : 'bg-error text-white'
                }`}
              >
                {killSwitch ? 'Start Reports' : 'Stop Reports'}
              </button>
            </div>
          </div>

          {/* Frequency */}
          <div className='card p-6'>
            <div className='mb-4'>
              <h2 className='mb-2 text-xl font-bold text-brand'>
                Report Frequency
              </h2>
              <p className='text-sm text-leaf-700'>
                How often reports should be generated.
              </p>
            </div>

            <div className='space-y-2'>
              <label className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='frequency'
                  value='daily'
                  checked={frequency === 'daily'}
                  onChange={(e) => setFrequency(e.target.value)}
                  className='h-4 w-4'
                />
                <div>
                  <div className='font-medium text-brand'>Daily</div>
                  <div className='text-sm text-leaf-600'>
                    Generate reports every day
                  </div>
                </div>
              </label>
              <label className='flex items-center gap-3'>
                <input
                  type='radio'
                  name='frequency'
                  value='weekly'
                  checked={frequency === 'weekly'}
                  onChange={(e) => setFrequency(e.target.value)}
                  className='h-4 w-4'
                />
                <div>
                  <div className='font-medium text-brand'>Weekly</div>
                  <div className='text-sm text-leaf-600'>
                    Generate reports every Monday
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Report Time */}
          <div className='card p-6'>
            <div className='mb-4'>
              <h2 className='mb-2 text-xl font-bold text-brand'>
                Report Generation Time
              </h2>
              <p className='text-sm text-leaf-700'>
                Time of day when reports should be generated (UTC).
              </p>
            </div>

            <div className='flex items-center gap-4'>
              <input
                title='Report Generation Time'
                placeholder='Report Generation Time'
                type='time'
                value={reportTime}
                onChange={(e) => setReportTime(e.target.value)}
                className='rounded-lg border border-leaf-300 px-4 py-2 text-brand focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
              />
              <span className='text-sm text-leaf-600'>UTC</span>
            </div>
          </div>

          {/* Languages */}
          <div className='card p-6'>
            <div className='mb-4'>
              <h2 className='mb-2 text-xl font-bold text-brand'>
                Allowed Languages
              </h2>
              <p className='text-sm text-leaf-700'>
                Add or remove languages for report generation. At least one
                language is required.
              </p>
            </div>

            {/* Current Languages */}
            <div className='mb-6 space-y-2'>
              {languages.map((lang) => (
                <div
                  key={lang}
                  className='flex items-center justify-between rounded-lg border border-leaf-200 bg-leaf-50 px-4 py-3'
                >
                  <div className='flex items-center gap-3'>
                    <span className='rounded bg-leaf-200 px-2 py-1 font-mono text-xs font-semibold uppercase text-brand'>
                      {lang}
                    </span>
                    <span className='font-medium text-brand'>
                      {languageNames[lang] || 'Custom Language'}
                    </span>
                    {lang === defaultLanguage ? (
                      <span className='text-xs text-leaf-600'>(Default)</span>
                    ) : (
                      <button
                        onClick={() => setAsDefault(lang)}
                        className='text-xs text-leaf-600 hover:text-leaf-800 hover:underline'
                      >
                        Set as default
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => removeLanguage(lang)}
                    disabled={lang === defaultLanguage}
                    className='text-error hover:underline disabled:opacity-50 disabled:cursor-not-allowed'
                    title={
                      lang === defaultLanguage
                        ? 'Cannot remove default language'
                        : 'Remove language'
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Language */}
            <div className='border-t border-leaf-200 pt-6'>
              <h3 className='mb-3 font-semibold text-brand'>
                Add New Language
              </h3>
              <div className='flex gap-3'>
                <div className='flex-1'>
                  <input
                    type='text'
                    placeholder='Language Code (e.g. en, fr, de)'
                    value={newLanguageCode}
                    onChange={(e) => setNewLanguageCode(e.target.value)}
                    className='w-full rounded-lg border border-leaf-300 px-4 py-2 text-brand placeholder:text-leaf-400 focus:border-leaf-600 focus:outline-none focus:ring-2 focus:ring-leaf-600/20'
                  />
                </div>
                <button
                  onClick={addLanguage}
                  disabled={!newLanguageCode.trim()}
                  className='btn btn-primary whitespace-nowrap disabled:opacity-50'
                >
                  Add Language
                </button>
              </div>
              <p className='mt-2 text-xs text-leaf-600'>
                Use standard ISO 639-1 language codes (e.g. en, fr, de, es, pt,
                it, zh, ja, ar, ru, sc)
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className='flex justify-end gap-4'>
            <Link
              href='/digital/admin/compliance-watch'
              className='btn btn-ghost'
            >
              Cancel
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className='btn btn-primary'
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
