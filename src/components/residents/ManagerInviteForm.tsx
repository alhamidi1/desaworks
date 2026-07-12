'use client';

import React, { useEffect, useState } from 'react';
import SkillSelector from './SkillSelector';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { inviteResident } from '@/lib/actions/residents';
import type { Skill } from '@/lib/types/database';

const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-card px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none nm-inset-sm';

export default function ManagerInviteForm() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selected, setSelected] = useState<any[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tos, setTos] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ loginEmail: string; tempPassword: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/skills').then((r) => r.json()).then((d) => setSkills((d || []) as Skill[])).catch(() => {});
  }, []);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!tos || !privacy) return setError(t('invite.consentRequired'));
    if (!email && !phone) return setError(t('invite.needIdentifier'));
    setLoading(true);
    const res = await inviteResident({
      full_name: fullName,
      email,
      phone,
      address,
      agreed_to_tos: tos,
      agreed_to_privacy: privacy,
      skills: selected.map((s) => ({
        skill_id: s.skill_id,
        experience_years: s.experience_years,
        proficiency_level: s.proficiency_level,
        notes: s.notes,
      })),
    });
    setLoading(false);
    if (!res.ok) return setError(res.error);
    setResult(res.data);
    setFullName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setSelected([]);
    setTos(false);
    setPrivacy(false);
  }

  if (result) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const wa = encodeURIComponent(
      `Halo! Akun DesaWorks Anda sudah dibuat.\nEmail: ${result.loginEmail}\nKata sandi sementara: ${result.tempPassword}\n\nMasuk di ${origin}/login lalu ganti kata sandi Anda.`
    );
    return (
      <div className="space-y-4 py-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-7 w-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-ink">{t('invite.accountCreated')}</h3>
          <p className="max-w-sm text-sm text-ink-soft">{t('invite.relayNote')}</p>
        </div>

        <div className="nm-inset space-y-3 rounded-xl p-4">
          {[
            { label: t('invite.loginEmail'), value: result.loginEmail, key: 'email' },
            { label: t('invite.tempPassword'), value: result.tempPassword, key: 'pass' },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-soft">{row.label}</p>
                <p className="truncate font-mono text-sm text-ink">{row.value}</p>
              </div>
              <button type="button" onClick={() => copy(row.value, row.key)} className="nm-raised-sm nm-pressable shrink-0 rounded-lg bg-card px-3 py-1.5 text-xs font-semibold text-primary-700">
                {copied === row.key ? t('invite.copied') : t('invite.copy')}
              </button>
            </div>
          ))}
        </div>

        <a href={`https://wa.me/?text=${wa}`} target="_blank" rel="noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#1ebe5d]">
          {t('invite.shareWa')}
        </a>
        <button type="button" onClick={() => setResult(null)} className="w-full rounded-xl border border-neutral-300 py-2.5 text-sm font-semibold text-ink-soft hover:text-ink">
          {t('invite.createAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {error ? (
        <div className="flex items-start gap-3 rounded-xl bg-danger-soft px-4 py-3">
          <p className="text-sm font-medium text-danger">{error}</p>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">{t('register.fullName')} <span className="text-danger">*</span></label>
        <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('register.fullNamePlaceholder')} className={inputCls} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">{t('register.email')}</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('register.emailPlaceholder')} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-ink">{t('register.phone')}</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t('register.phonePlaceholder')} className={inputCls} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">{t('register.address')}</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('register.addressPlaceholder')} className={inputCls} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-ink">{t('register.skills')}</label>
        <SkillSelector availableSkills={skills} value={selected} onChange={setSelected} />
      </div>

      <div className="space-y-2 rounded-xl bg-surface p-3">
        <label className="flex items-start gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={tos} onChange={(e) => setTos(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary-600" />
          {t('consent.managerTos')}
        </label>
        <label className="flex items-start gap-2.5 text-sm text-ink">
          <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary-600" />
          {t('consent.managerPrivacy')}
        </label>
      </div>

      <button type="submit" disabled={loading} className="nm-pressable w-full rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-700 disabled:opacity-60">
        {loading ? t('invite.creating') : t('invite.submit')}
      </button>
    </form>
  );
}
