'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DashboardHeader() {
  const { locale, setLocale } = useLanguage();

  return (
    <header className="hidden lg:flex h-16 items-center justify-end px-8 border-b border-[#e9ecef]/60 bg-white/70 backdrop-blur-md sticky top-0 z-10">
      <button
        onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
        className="flex items-center gap-2 rounded-xl border border-[#e9ecef] bg-white hover:bg-[#f8f9fa] px-3.5 py-2 text-xs font-bold text-[#495057] hover:text-[#1a1d23] shadow-sm transition-all duration-150 touch-target"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-[#05c8ae]">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
        </svg>
        {locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      </button>
    </header>
  );
}
