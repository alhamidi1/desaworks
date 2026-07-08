'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { type Locale, DEFAULT_LOCALE, createT, localeNames } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  localeNames: Record<Locale, string>;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'desaworks_locale';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      // Check cookie first (important for server side hydration alignment)
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(c => c.trim().startsWith('desaworks_locale='));
      let saved = localeCookie ? localeCookie.split('=')[1].trim() as Locale : null;

      if (!saved) {
        saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
      }

      if (saved === 'id' || saved === 'en') {
        setLocaleState(saved);
        // Ensure cookie is set
        document.cookie = `desaworks_locale=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Storage/document unavailable during SSR
    }
    setMounted(true);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem(STORAGE_KEY, newLocale);
      document.cookie = `desaworks_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // localStorage unavailable
    }
    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale;
    }
    // Trigger Server Components refresh
    router.refresh();
  }, [router]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return createT(locale)(key, params);
    },
    [locale]
  );

  // Prevent flash of wrong locale
  if (!mounted) {
    const defaultT = createT(DEFAULT_LOCALE);
    return (
      <LanguageContext.Provider
        value={{ locale: DEFAULT_LOCALE, setLocale, t: defaultT, localeNames }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, localeNames }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
