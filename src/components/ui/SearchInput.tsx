'use client';

import { useLanguage } from '@/lib/i18n/LanguageContext';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

/** App-wide search field with a magnifier icon and a clear button. */
export function SearchInput({ value, onChange, placeholder, className = '' }: SearchInputProps) {
  const { t } = useLanguage();

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400" aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 11.454 11.454Z" />
        </svg>
      </span>
      <input
        type="text"
        inputMode="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('common.searchPlaceholder')}
        aria-label={placeholder ?? t('common.search')}
        className="nm-inset-sm w-full rounded-xl border border-neutral-300 bg-card py-2.5 pl-10 pr-9 text-sm text-ink placeholder:text-neutral-400 focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label={t('common.cancel')}
          className="absolute inset-y-0 right-2.5 flex items-center text-neutral-400 transition hover:text-ink"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
