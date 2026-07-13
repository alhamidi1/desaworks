'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { loginAction } from './actions';

export default function LoginPage() {
  const { t, locale, setLocale } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
    }

    setIsPending(false);
  }

  const showTestCredentials = process.env.NEXT_PUBLIC_HIDE_TEST_CREDENTIALS !== 'true';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 relative bg-surface">
      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
          className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-ink-soft hover:text-primary-700 transition-colors touch-target"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          {locale === 'id' ? 'EN' : 'ID'}
        </button>
      </div>

      <div className="relative w-full max-w-md space-y-4 animate-fade-in">
        {/* Main card */}
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-10 shadow-[var(--shadow-lg)]">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white ring-1 ring-border">
              <Image src="/icon.png" alt="DesaWorks" width={48} height={48} className="h-12 w-12 object-contain" priority />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink">
                {t('login.title')}
              </h1>
              <p className="text-sm text-ink-soft mt-1">
                {t('login.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t('login.emailPlaceholder')}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-ink placeholder-neutral-400 transition-all touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-ink-soft uppercase tracking-wider block">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={t('login.passwordPlaceholder')}
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-sm text-ink placeholder-neutral-400 transition-all touch-target"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-danger/20 bg-danger-soft p-4 text-xs space-y-1 animate-fade-in">
                <p className="font-bold text-danger">{t('login.authFailed')}</p>
                <p className="text-danger/80 leading-normal">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-primary-600 hover:bg-primary-700 py-3.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 touch-target"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {t('login.signingIn')}
                </span>
              ) : (
                <span>{t('login.signIn')}</span>
              )}
            </button>
          </form>
        </div>

        {/* Test credentials — only in development */}
        {showTestCredentials && (
          <div className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-slide-up">
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider text-center">
              {t('login.testCredentials')}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              <div className="p-3 bg-primary-50 rounded-xl border border-primary-100 space-y-1">
                <span className="font-semibold text-primary-700 block">{t('login.managerRole')}</span>
                <p className="text-ink-soft leading-tight">
                  <strong>Email:</strong> manager@desaworks.test<br />
                  <strong>Pass:</strong> Password123!
                </p>
              </div>
              <div className="p-3 bg-info-soft rounded-xl border border-info/20 space-y-1">
                <span className="font-semibold text-info block">{t('login.residentRole')}</span>
                <p className="text-ink-soft leading-tight">
                  <strong>Email:</strong> siti.rahma@desaworks.test<br />
                  <strong>Pass:</strong> Password123!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
