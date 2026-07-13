'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatDateShort } from '@/lib/i18n';
import { SearchInput } from '@/components/ui/SearchInput';
import { Pagination } from '@/components/ui/Pagination';
import { usePaginatedSearch } from '@/lib/hooks/usePaginatedSearch';
import { waLink } from '@/lib/utils/whatsapp';
import SkillSelector from '@/components/residents/SkillSelector';
import { getResidentWithSkills, manageResident, type ResidentListItem } from '@/lib/actions/residents';

interface Props {
  residents: ResidentListItem[];
}

const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-card px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none nm-inset-sm';

export function ResidentsDirectory({ residents }: Props) {
  const { t, locale } = useLanguage();
  const router = useRouter();

  const [showModal, setShowModal] = useState(false);
  const [editingResidentId, setEditingResidentId] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<any[]>([]);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);

  useEffect(() => {
    if (showModal && availableSkills.length === 0) {
      fetch('/api/skills')
        .then((r) => r.json())
        .then((data) => setAvailableSkills(data || []));
    }
  }, [showModal, availableSkills]);

  const { query, setQuery, pageItems, page, setPage, totalPages, total, from, to } = usePaginatedSearch(residents, {
    pageSize: 10,
    searchFields: (r) => [r.full_name, r.phone, r.email, r.address],
  });

  async function startEdit(resident: ResidentListItem) {
    setEditingResidentId(resident.id);
    setShowModal(true);
    setModalLoading(true);
    setModalError(null);
    setPassword('');
    setFullName(resident.full_name);
    setEmail(resident.email ?? '');
    setPhone(resident.phone ?? '');
    setAddress(resident.address ?? '');
    setSelectedSkills([]);

    try {
      const profile = await getResidentWithSkills(resident.id);
      if (profile) {
        setFullName(profile.full_name);
        setEmail(profile.email ?? '');
        setPhone(profile.phone ?? '');
        setAddress(profile.address ?? '');
        setSelectedSkills(
          (profile.resident_skills || []).map((rs: any) => ({
            skill_id: rs.skill_id,
            name: rs.skill?.name ?? 'Unknown Skill',
            category: rs.skill?.category ?? '',
            experience_years: rs.experience_years,
            proficiency_level: rs.proficiency_level,
            notes: rs.notes,
          }))
        );
      }
    } catch (err: any) {
      setModalError(err.message || 'Gagal memuat profil warga');
    } finally {
      setModalLoading(false);
    }
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingResidentId) return;

    setSubmitting(true);
    setModalError(null);

    const payload = {
      full_name: fullName,
      email,
      phone: phone || null,
      address: address || null,
      password: password || null,
      skills: selectedSkills.map((s) => ({
        skill_id: s.skill_id,
        experience_years: s.experience_years,
        proficiency_level: s.proficiency_level,
        notes: s.notes,
      })),
    };

    try {
      const res = await manageResident(editingResidentId, payload);
      if (!res.ok) {
        setModalError(res.error);
      } else {
        setShowModal(false);
        router.refresh();
      }
    } catch (err: any) {
      setModalError(err.message || 'Gagal menyimpan perubahan');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-primary-600">{t('appName')}</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">{t('residents.title')}</h1>
          <p className="mt-1 text-sm text-ink-soft">{t('residents.subtitle')}</p>
        </div>
        <Link
          href="/dashboard/residents/register"
          className="nm-pressable inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('residents.addResident')}
        </Link>
      </div>

      {residents.length === 0 ? (
        <div className="nm-raised rounded-2xl px-6 py-14 text-center">
          <p className="font-bold text-ink">{t('residents.empty')}</p>
          <p className="mt-1 text-sm text-ink-soft">{t('residents.emptyDesc')}</p>
        </div>
      ) : (
        <div className="nm-raised rounded-2xl p-4 sm:p-5">
          {/* Search + count */}
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={query} onChange={setQuery} placeholder={t('residents.searchPlaceholder')} className="sm:max-w-xs sm:flex-1" />
            <span className="text-xs text-ink-soft">{t('residents.total', { count: residents.length })}</span>
          </div>

          {total === 0 ? (
            <p className="py-10 text-center text-sm text-ink-soft">{t('residents.noResults')}</p>
          ) : (
            <ul className="divide-y divide-neutral-200/70">
              {pageItems.map((r) => {
                const wa = waLink(r.phone);
                return (
                  <li key={r.id} className="flex items-center gap-3 py-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {r.full_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{r.full_name}</p>
                      <p className="truncate text-xs text-ink-soft">
                        {r.phone || r.email || t('residents.noContact')}
                        {r.created_at ? ` · ${t('residents.joined', { date: formatDateShort(r.created_at, locale) })}` : ''}
                      </p>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <span className="rounded-full bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink-soft">
                        {r.skillCount > 0 ? t('residents.skillsCount', { count: r.skillCount }) : t('residents.noSkills')}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${
                        r.availability === 'available'
                          ? 'bg-success-soft text-success'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${r.availability === 'available' ? 'bg-success' : 'bg-neutral-400'}`} aria-hidden />
                      <span className="hidden sm:inline">
                        {r.availability === 'available' ? t('availability.available') : t('availability.unavailable')}
                      </span>
                    </span>
                    {wa && (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t('residents.messageWa')}
                        title={t('residents.messageWa')}
                        className="nm-pressable grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white transition hover:bg-[#1ebe5d]"
                      >
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-white">
                          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.387.622 4.63 1.71 6.578L2 30l7.632-1.694A13.926 13.926 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5c-2.165 0-4.195-.583-5.937-1.6l-.424-.25-4.526 1.004 1.022-4.41-.278-.453A11.482 11.482 0 0 1 4.5 16C4.5 9.596 9.596 4.5 16 4.5S27.5 9.596 27.5 16 22.404 27.5 16 27.5zm6.302-8.638c-.344-.172-2.037-1.005-2.353-1.12-.317-.115-.547-.172-.778.172-.23.344-.893 1.12-1.094 1.35-.2.23-.403.26-.748.086-.344-.172-1.456-.537-2.773-1.71-1.025-.912-1.717-2.038-1.918-2.382-.2-.344-.021-.53.15-.7.154-.154.344-.403.516-.605.172-.2.23-.344.344-.573.115-.23.057-.43-.029-.605-.086-.172-.778-1.876-1.064-2.566-.28-.675-.566-.583-.778-.594l-.663-.013c-.23 0-.604.086-.92.43-.317.344-1.208 1.178-1.208 2.872s1.237 3.333 1.41 3.563c.172.23 2.434 3.718 5.9 5.214.824.356 1.468.568 1.97.728.826.264 1.579.226 2.174.137.663-.1 2.037-.832 2.324-1.636.287-.805.287-1.494.2-1.637-.086-.144-.316-.23-.66-.402z" />
                        </svg>
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      aria-label="Edit Profile"
                      title="Edit Profile"
                      className="nm-pressable grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card border border-border text-ink-soft hover:text-primary-600 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4.5 w-4.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.645-.869L9.594 3.94ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <Pagination page={page} totalPages={totalPages} total={total} from={from} to={to} onPage={setPage} />
        </div>
      )}

      {/* Edit Resident Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl space-y-5 animate-scale-up overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-ink">Kelola Profil Warga</h3>
                <p className="text-xs text-ink-soft">Sesuaikan kredensial, kontak, dan keahlian warga.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-ink-soft hover:bg-neutral-100 hover:text-ink transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {modalError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                <p className="text-sm text-red-700">{modalError}</p>
              </div>
            )}

            {/* Loading Spinner */}
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <svg className="h-8 w-8 animate-spin text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <p className="text-xs text-ink-soft">Memuat data warga...</p>
              </div>
            ) : (
              <form onSubmit={saveEdit} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">Nama Lengkap *</label>
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Contoh: Budi Santoso" className={inputCls} />
                </div>

                {/* Contact grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">Email *</label>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" className={inputCls} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">Nomor WhatsApp</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08123456789" className={inputCls} />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">Kata Sandi Baru</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Biarkan kosong jika tidak diubah" className={inputCls} />
                  <p className="text-[10px] text-ink-soft">Minimal 6 karakter jika ingin mengganti kata sandi login warga.</p>
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">Alamat Tinggal</label>
                  <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="RT 03 RW 04, Dusun Krajan" className={inputCls} />
                </div>

                {/* Skills */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">Keahlian & Pengalaman</label>
                  <SkillSelector availableSkills={availableSkills} value={selectedSkills} onChange={setSelectedSkills} />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-xs font-semibold text-ink-soft hover:bg-neutral-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="nm-pressable inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-700 disabled:bg-neutral-200 disabled:text-neutral-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <svg className="h-4.5 w-4.5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                        Menyimpan...
                      </>
                    ) : (
                      'Simpan Perubahan'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
