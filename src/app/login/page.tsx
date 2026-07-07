'use client';

import { useState } from 'react';
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
    <main className="flex min-h-screen flex-col items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-[#f0fdfa] via-[#f7f8fa] to-[#eff6ff]">
      {/* Animated background blobs */}
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[#05c8ae]/8 blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[#3b82f6]/8 blur-[80px] translate-x-1/2 translate-y-1/2 animate-pulse" />
      <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] rounded-full bg-[#f59e0b]/5 blur-[80px] -translate-x-1/2 -translate-y-1/2" />

      {/* Language toggle — top right */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
          className="flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-[#495057] hover:text-[#05c8ae] transition-colors shadow-sm touch-target"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          {locale === 'id' ? 'EN' : 'ID'}
        </button>
      </div>

      <div className="relative w-full max-w-md space-y-5 animate-fade-in">
        {/* Main card */}
        <div className="rounded-3xl glass p-8 sm:p-10 shadow-xl">
          {/* Logo & Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#05c8ae] to-[#058074] text-white shadow-lg shadow-[#05c8ae]/25">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1a1d23]">
                {t('login.title')}
              </h1>
              <p className="text-sm text-[#868e96] mt-1">
                {t('login.subtitle')}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#495057] uppercase tracking-wider block">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t('login.emailPlaceholder')}
                className="w-full rounded-xl border border-[#dee2e6] bg-white px-4 py-3.5 text-sm text-[#1a1d23] placeholder-[#adb5bd] transition-all focus:border-[#05c8ae] focus:ring-2 focus:ring-[#05c8ae]/15 touch-target"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-[#495057] uppercase tracking-wider block">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={t('login.passwordPlaceholder')}
                className="w-full rounded-xl border border-[#dee2e6] bg-white px-4 py-3.5 text-sm text-[#1a1d23] placeholder-[#adb5bd] transition-all focus:border-[#05c8ae] focus:ring-2 focus:ring-[#05c8ae]/15 touch-target"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50/80 p-4 text-xs space-y-1 animate-fade-in">
                <p className="font-bold text-red-700">{t('login.authFailed')}</p>
                <p className="text-red-500 leading-normal">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-gradient-to-r from-[#05c8ae] to-[#058074] hover:from-[#00a18f] hover:to-[#0d534d] py-3.5 text-sm font-semibold text-white transition-all shadow-lg shadow-[#05c8ae]/20 disabled:cursor-not-allowed disabled:opacity-50 touch-target"
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
          <div className="rounded-2xl glass p-5 shadow-md space-y-3 animate-slide-up">
            <p className="text-xs font-bold text-[#495057] uppercase tracking-wider text-center">
              {t('login.testCredentials')}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
              <div className="p-3 bg-[#effefb] rounded-xl border border-[#c7fff4] space-y-1">
                <span className="font-semibold text-[#058074] block">{t('login.managerRole')}</span>
                <p className="text-[#495057] leading-tight">
                  <strong>Email:</strong> manager@desaworks.test<br />
                  <strong>Pass:</strong> Password123!
                </p>
              </div>
              <div className="p-3 bg-[#eff6ff] rounded-xl border border-[#bfdbfe] space-y-1">
                <span className="font-semibold text-[#1d4ed8] block">{t('login.residentRole')}</span>
                <p className="text-[#495057] leading-tight">
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
