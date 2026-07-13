'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function AvailabilityToggle({ residentId, initial }: { residentId: string; initial: 'available' | 'unavailable' }) {
  const { t } = useLanguage();
  const [availability, setAvailability] = useState(initial);
  const [loading, setLoading] = useState(false);
  const isAvailable = availability === 'available';

  async function toggle() {
    const next = isAvailable ? 'unavailable' : 'available';
    setLoading(true);
    try {
      const res = await fetch(`/api/residents/${residentId}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ availability: next }),
      });
      if (res.ok) setAvailability(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={isAvailable}
      className="nm-pressable inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 disabled:opacity-60"
    >
      <span className={`h-2.5 w-2.5 rounded-full ${isAvailable ? 'bg-primary-300' : 'bg-neutral-400'}`} aria-hidden />
      {loading ? t('availability.saving') : isAvailable ? t('availability.available') : t('availability.unavailable')}
    </button>
  );
}
