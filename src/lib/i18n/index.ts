// DesaWorks — i18n Utilities
// Simple bilingual system: Indonesian (default) + English

import id from './id';
import en from './en';
import type { TranslationDict } from './id';

export type Locale = 'id' | 'en';

export const dictionaries: Record<Locale, TranslationDict> = { id, en };

export const localeNames: Record<Locale, string> = {
  id: 'Bahasa Indonesia',
  en: 'English',
};

export const DEFAULT_LOCALE: Locale = 'id';

/**
 * Get nested value from a dictionary using dot-notation path.
 * e.g. getNestedValue(dict, 'nav.dashboard') → 'Beranda'
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return path; // fallback to the key itself
    }
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === 'string' ? current : path;
}

/**
 * Create a translation function for the given locale.
 * Supports interpolation: t('dashboard.welcomeBack', { name: 'Siti' })
 */
export function createT(locale: Locale) {
  const dict = dictionaries[locale] ?? dictionaries[DEFAULT_LOCALE];

  return function t(key: string, params?: Record<string, string | number>): string {
    let value = getNestedValue(dict as unknown as Record<string, unknown>, key);
    if (params) {
      for (const [param, replacement] of Object.entries(params)) {
        value = value.replace(`{${param}}`, String(replacement));
      }
    }
    return value;
  };
}

/**
 * Format a date for the given locale.
 */
export function formatDate(dateStr: string | null, locale: Locale): string {
  if (!dateStr) return locale === 'id' ? 'Belum ditentukan' : 'Not set';
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a short date for compact displays.
 */
export function formatDateShort(dateStr: string | null, locale: Locale): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format currency in Indonesian Rupiah.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export { id, en };
export type { TranslationDict };
