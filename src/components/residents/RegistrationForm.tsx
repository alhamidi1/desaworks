"use client";

import React, { useEffect, useState } from 'react';
import SkillSelector from './SkillSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { Skill } from '@/lib/types/database';

interface RegistrationFormProps {
  residentId?: string | null;
  // When true, shows a simpler version suitable for the public self-registration page
  isPublic?: boolean;
}

export default function RegistrationForm({ residentId, isPublic = false }: RegistrationFormProps) {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  useEffect(() => {
    fetch('/api/skills')
      .then((r) => r.json())
      .then((data) => setSkills((data || []) as Skill[]));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!residentId && (!tos || !privacy)) {
      setError(t('invite.consentRequired'));
      return;
    }
    setLoading(true);

    try {
      const payload = {
        full_name: fullName,
        email,
        phone,
        address,
        agreed_to_tos: residentId ? true : tos,
        agreed_to_privacy: residentId ? true : privacy,
        skills: selected.map((s) => ({
          skill_id: s.skill_id,
          experience_years: s.experience_years,
          proficiency_level: s.proficiency_level,
          notes: s.notes,
        })),
      };

      const url = residentId ? `/api/residents/${residentId}/update` : '/api/residents/register';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: t('register.formError') }));
        throw new Error(body?.error || t('register.formError'));
      }

      setSuccess(true);
      if (!residentId) {
        // Reset form for new registrations
        setFullName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setSelected([]);
      }
    } catch (err: any) {
      setError(err.message || t('register.formError'));
    } finally {
      setLoading(false);
    }
  }

  const isSubmitDisabled = loading || (!residentId && (!tos || !privacy));

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-primary-600 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-ink">
            {isPublic ? t('register.successTitle') : t('register.saveSuccessTitle')}
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            {isPublic
              ? t('register.publicSuccessDesc')
              : t('register.managerSuccessDesc')}
          </p>
        </div>
        {!isPublic && (
          <button
            onClick={() => setSuccess(false)}
            className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-primary-500 hover:text-primary-500 transition-colors"
          >
            {t('register.registerAnother')}
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Full name */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">
          {t('register.fullName')} <span className="text-red-500">*</span>
        </label>
        <input
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t('register.fullNamePlaceholder')}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
        />
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">
          {t('register.email')} <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('register.emailPlaceholder')}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
        />
      </div>

      {/* Phone + Address */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">{t('register.phone')}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('register.phonePlaceholder')}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">{t('register.address')}</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t('register.addressPlaceholder')}
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-colors"
          />
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">{t('register.skills')}</label>
        <p className="text-xs text-ink-soft">{t('register.skillsDesc')}</p>
        <SkillSelector availableSkills={skills} value={selected} onChange={setSelected} />
      </div>

      {/* Consent (required for new registrations) */}
      {!residentId && (
        <div className="space-y-2 rounded-xl bg-neutral-50 p-3">
          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary-500" />
            {t('consent.tos')}
          </label>
          <label className="flex items-start gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary-500" />
            {t('consent.privacy')}
          </label>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            {t('register.saving')}
          </span>
        ) : (
          residentId ? t('register.saveChanges') : t('register.submit')
        )}
      </button>
    </form>
  );
}
