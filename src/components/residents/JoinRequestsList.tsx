'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { listJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/lib/actions/residents';
import { formatDateShort } from '@/lib/i18n';
import { waLink } from '@/lib/utils/whatsapp';

type Req = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  message: string | null;
  agreed_to_tos: boolean;
  agreed_to_privacy: boolean;
  created_at: string;
};

export default function JoinRequestsList() {
  const { t, locale } = useLanguage();
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [creds, setCreds] = useState<
    Record<string, { loginEmail: string; tempPassword: string; full_name: string; phone: string | null }>
  >({});
  const [selectedReq, setSelectedReq] = useState<Req | null>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    listJoinRequests().then((res) => setReqs(res.ok ? (res.data as unknown as Req[]) : []));
  }, []);

  async function approve(id: string) {
    const reqItem = reqs?.find((x) => x.id === id);
    if (!reqItem) return;
    setBusy(id);
    const res = await approveJoinRequest(id);
    setBusy(null);
    if (res.ok) {
      setCreds((c) => ({
        ...c,
        [id]: {
          ...res.data,
          full_name: reqItem.full_name,
          phone: reqItem.phone,
        },
      }));
      setReqs((r) => r?.filter((x) => x.id !== id) ?? null);
    }
  }

  async function reject(id: string) {
    setBusy(id);
    await rejectJoinRequest(id);
    setBusy(null);
    setReqs((r) => r?.filter((x) => x.id !== id) ?? null);
  }

  if (reqs === null) return <p className="py-6 text-center text-sm text-ink-soft">{t('requests.loading')}</p>;

  return (
    <div className="space-y-3">
      {Object.entries(creds).map(([id, c]) => {
        const shareLink = `${origin}/login`;
        const waMessage = t('invite.waGuideMessage', {
          name: c.full_name,
          link: shareLink,
          email: c.loginEmail,
          password: c.tempPassword,
        });
        const whatsappUrl = waLink(c.phone, waMessage);

        return (
          <div key={id} className="nm-inset space-y-3 rounded-xl p-4 bg-emerald-50/50 border border-emerald-200">
            <div>
              <p className="text-sm font-semibold text-emerald-700">{t('invite.accountCreated')}</p>
              <p className="text-xs text-neutral-500 mt-0.5">Nama: <span className="font-semibold text-ink">{c.full_name}</span></p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-neutral-100 font-mono text-xs">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">{t('invite.loginEmail')}</span>
                <span className="text-ink break-all select-all font-semibold">{c.loginEmail}</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">{t('invite.tempPassword')}</span>
                <span className="text-ink break-all select-all font-semibold">{c.tempPassword}</span>
              </div>
            </div>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] text-white px-4 py-2.5 text-xs font-bold hover:bg-[#20ba59] transition-all duration-150"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.858.002-2.634-1.013-5.11-2.861-6.958C16.63 1.94 14.153.927 11.517.927c-5.448 0-9.873 4.424-9.877 9.864-.001 1.77.461 3.5 1.34 5.03l-.988 3.61 3.702-.977zM16.596 13.6c-.247-.125-1.47-.726-1.696-.81-.228-.08-.393-.125-.558.125-.165.25-.64.81-.783.975-.143.165-.286.183-.532.06-.247-.125-1.042-.385-1.986-1.227-.734-.654-1.23-1.462-1.374-1.711-.144-.247-.015-.38.109-.503.111-.11.247-.287.371-.43.124-.145.165-.247.247-.412.08-.165.04-.31-.02-.435-.06-.125-.558-1.347-.763-1.84-.2-.488-.399-.422-.558-.43h-.474c-.165 0-.435.06-.662.307-.228.247-.87.85-.87 2.074 0 1.224.89 2.406 1.012 2.57.125.166 1.75 2.673 4.24 3.743.593.253 1.056.405 1.417.52.595.19 1.137.163 1.565.101.477-.07 1.47-.6 1.674-1.18.204-.58.204-1.077.143-1.18-.06-.105-.228-.168-.475-.293z"/>
                </svg>
                {t('invite.shareWa')}
              </a>
            )}
          </div>
        );
      })}

      {reqs.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-soft">{t('requests.none')}</p>
      ) : (
        reqs.map((r) => (
          <div key={r.id} className="nm-raised flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{r.full_name}</p>
              <p className="text-xs text-ink-soft">{r.phone || r.email || '—'}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => setSelectedReq(r)}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-ink-soft hover:text-ink hover:bg-neutral-50 transition"
              >
                {t('requests.viewDetails')}
              </button>
              <button
                type="button"
                onClick={() => approve(r.id)}
                disabled={busy === r.id}
                className="nm-pressable rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60"
              >
                {busy === r.id ? t('requests.approving') : t('requests.approve')}
              </button>
              <button
                type="button"
                onClick={() => reject(r.id)}
                disabled={busy === r.id}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-xs font-semibold text-ink-soft hover:text-ink disabled:opacity-60"
              >
                {t('requests.reject')}
              </button>
            </div>
          </div>
        ))
      )}

      {/* View Details Modal */}
      {selectedReq && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 animate-fade-in"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl space-y-5 animate-scale-up overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-ink">{t('requests.detailsTitle')}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded-lg p-1 text-ink-soft hover:bg-neutral-100 hover:text-ink transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">{t('register.fullName')}</span>
                  <span className="text-ink font-semibold mt-1 block">{selectedReq.full_name}</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">{t('requests.createdAt')}</span>
                  <span className="text-ink mt-1 block">{formatDateShort(selectedReq.created_at, locale)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">{t('register.email')}</span>
                  <span className="text-ink mt-1 block break-all">{selectedReq.email || '—'}</span>
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">{t('register.phone')}</span>
                  <span className="text-ink mt-1 block">{selectedReq.phone || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">{t('requests.message')}</span>
                <p className="mt-1.5 p-3 rounded-xl bg-neutral-50 text-ink whitespace-pre-wrap border border-neutral-100 text-xs leading-relaxed">
                  {selectedReq.message || t('requests.noMessage')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-100 space-y-2 text-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">{t('requests.consent')}</span>
                <label className="flex items-center gap-2.5 text-neutral-600">
                  <input type="checkbox" checked={selectedReq.agreed_to_tos} readOnly className="h-4 w-4 accent-primary-500 rounded" />
                  {t('consent.managerTos')}
                </label>
                <label className="flex items-center gap-2.5 text-neutral-600">
                  <input type="checkbox" checked={selectedReq.agreed_to_privacy} readOnly className="h-4 w-4 accent-primary-500 rounded" />
                  {t('consent.managerPrivacy')}
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-semibold text-ink-soft hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                {t('requests.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
