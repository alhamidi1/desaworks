'use client';

import { useState } from 'react';
import { loginAction } from './actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    // loginAction redirects on success so we only get here on failure
    if (result?.error) {
      setError(result.error);
    }

    setIsPending(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Card Container */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-8 sm:p-10 shadow-[0_16px_48px_rgba(15,23,42,0.08)]">
          {/* Logo & Header */}
          <div className="text-center space-y-2.5">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,0.25)]">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sign in to DesaWorks</h1>
            <p className="text-sm text-slate-500">
              Community Resource Management System
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider block"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue="manager@desaworks.test"
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-slate-700 uppercase tracking-wider block"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs text-red-700 space-y-1">
                <p className="font-bold">Authentication failed</p>
                <p className="text-red-500 leading-normal">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-xl bg-teal-600 hover:bg-teal-700 py-3 text-sm font-semibold text-white transition-all shadow-[0_4px_12px_rgba(13,148,136,0.15)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        {/* Credentials Helper Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.03)] space-y-3">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider text-center">Test Account Credentials</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-semibold text-teal-700 block">Manager Role</span>
              <p className="text-slate-500 leading-tight">
                <strong>Email:</strong> manager@desaworks.test<br />
                <strong>Pass:</strong> Password123!
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="font-semibold text-blue-700 block">Resident Role</span>
              <p className="text-slate-500 leading-tight">
                <strong>Email:</strong> siti.rahma@desaworks.test<br />
                <strong>Pass:</strong> Password123!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
