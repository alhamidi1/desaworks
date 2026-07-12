'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { listJoinRequests, approveJoinRequest, rejectJoinRequest } from '@/lib/actions/residents';

type Req = { id: string; full_name: string; phone: string | null; email: string | null; created_at: string };

export default function JoinRequestsList() {
  const { t } = useLanguage();
  const [reqs, setReqs] = useState<Req[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [creds, setCreds] = useState<Record<string, { loginEmail: string; tempPassword: string }>>({});

  useEffect(() => {
    listJoinRequests().then((res) => setReqs(res.ok ? (res.data as unknown as Req[]) : []));
  }, []);

  async function approve(id: string) {
    setBusy(id);
    const res = await approveJoinRequest(id);
    setBusy(null);
    if (res.ok) {
      setCreds((c) => ({ ...c, [id]: res.data }));
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
      {Object.entries(creds).map(([id, c]) => (
        <div key={id} className="nm-inset space-y-1 rounded-xl p-3">
          <p className="text-sm font-semibold text-success">{t('invite.accountCreated')}</p>
          <p className="font-mono text-xs text-ink">{c.loginEmail}</p>
          <p className="font-mono text-xs text-ink">{c.tempPassword}</p>
        </div>
      ))}

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
    </div>
  );
}
