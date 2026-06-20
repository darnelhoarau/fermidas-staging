'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Container } from '@/components/Container';

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/digital/account';
  const plan = searchParams.get('plan'); // 'monthly' or 'oneoff'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'signup') {
      // Register new user
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }
    }

    // Sign in
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password');
      setLoading(false);
    } else if (result?.ok) {
      // Redirect based on plan selection using Next.js router
      if (plan) {
        router.push(`/digital/checkout?plan=${plan}`);
        router.refresh(); // Refresh to update auth state
      } else {
        router.push(callbackUrl);
        router.refresh(); // Refresh to update auth state
      }
    }
  };

  if (magicLinkSent) {
    return (
      <section className='section bg-gradient-to-br from-mint to-white'>
        <Container>
          <div className='mx-auto flex min-h-[60vh] max-w-md items-center justify-center'>
            <div className='card w-full p-8 text-center'>
              <div className='mb-6 text-center'>
                <div className='mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100'>
                  <svg
                    className='h-8 w-8 text-leaf-600'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
                <h1 className='font-display text-2xl font-bold text-brand'>
                  Check Your Email
                </h1>
              </div>
              <p className='mb-6 text-leaf-700'>
                We've sent a magic link to{' '}
                <strong className='text-brand'>{email}</strong>. Click the link
                to sign in.
              </p>
              <button
                onClick={() => setMagicLinkSent(false)}
                className='text-sm text-leaf-700 hover:text-brand'
              >
                ← Back to sign in
              </button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className='section no-top bg-gradient-to-br from-mint to-white'>
      <Container>
        <div className='mx-auto flex min-h-[80vh] max-w-md items-center justify-center py-12'>
          <div className='card w-full p-8'>
            <div className='mb-8 text-center'>
              <h1 className='font-display mb-2 text-3xl font-bold text-brand'>
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h1>
              <p className='text-sm text-leaf-700'>
                {plan === 'monthly' && 'Subscribe to Compliance Watch'}
                {plan === 'oneoff' && "Purchase Today's Report"}
                {!plan && 'Access your digital products'}
              </p>
            </div>

            {error && (
              <div className='mb-6 rounded-xl bg-error/10 p-4 text-sm text-error'>
                {error}
              </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleCredentialsAuth} className='mb-6'>
              {mode === 'signup' && (
                <div className='mb-4'>
                  <label
                    htmlFor='name'
                    className='mb-2 block text-sm font-semibold text-brand'
                  >
                    Full Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={mode === 'signup'}
                    className='w-full rounded-xl border border-leaf-300 bg-white px-4 py-3 text-brand focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200'
                    placeholder='Enter your full name'
                  />
                </div>
              )}

              <div className='mb-4'>
                <label
                  htmlFor='email'
                  className='mb-2 block text-sm font-semibold text-brand'
                >
                  Email
                </label>
                <input
                  type='email'
                  id='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className='w-full rounded-xl border border-leaf-300 bg-white px-4 py-3 text-brand focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200'
                  placeholder='you@example.com'
                />
              </div>

              <div className='mb-6'>
                <label
                  htmlFor='password'
                  className='mb-2 block text-sm font-semibold text-brand'
                >
                  Password
                </label>
                <input
                  type='password'
                  id='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className='w-full rounded-xl border border-leaf-300 bg-white px-4 py-3 text-brand focus:border-leaf-500 focus:outline-none focus:ring-2 focus:ring-leaf-200'
                  placeholder='••••••••'
                />
                {mode === 'signup' && (
                  <p className='mt-2 text-xs text-leaf-600'>
                    At least 8 characters
                  </p>
                )}
              </div>

              <button
                type='submit'
                disabled={loading}
                className='btn btn-primary w-full disabled:opacity-50'
              >
                {loading
                  ? 'Loading...'
                  : mode === 'signin'
                    ? 'Sign In'
                    : 'Create Account'}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className='mb-6 text-center text-sm text-leaf-700'>
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className='font-semibold text-leaf-700 hover:text-brand'
                  >
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('signin')}
                    className='font-semibold text-leaf-700 hover:text-brand'
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

            {/* Magic Link - Temporarily disabled (requires email adapter setup) */}
            {/* 
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-leaf-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-leaf-600">OR</span>
              </div>
            </div>

            <form onSubmit={handleMagicLink}>
              <button
                type="submit"
                disabled={loading || !email}
                className="btn btn-ghost w-full disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
            */}

            <p className='mt-8 text-center text-xs text-leaf-600'>
              By signing in, you agree to our{' '}
              <Link href='/terms' className='underline hover:text-brand'>
                Terms
              </Link>{' '}
              and{' '}
              <Link href='/privacy' className='underline hover:text-brand'>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <section className='section no-top bg-gradient-to-br from-mint to-white'>
          <Container>
            <div className='mx-auto flex min-h-[80vh] max-w-md items-center justify-center py-12'>
              <div className='card w-full p-8 text-center'>
                <div className='mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-leaf-200 border-t-leaf-600' />
                <p className='text-leaf-700'>Loading...</p>
              </div>
            </div>
          </Container>
        </section>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
