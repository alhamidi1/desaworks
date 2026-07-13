'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createSkill, updateSkill, deleteSkill } from '@/lib/actions/skills';
import type { Skill } from '@/lib/types/database';

const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-card px-4 py-3 text-sm text-ink placeholder:text-neutral-400 focus:outline-none nm-inset-sm';

export default function SkillsManagement() {
  const { t } = useLanguage();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadSkills();
  }, []);

  function loadSkills() {
    setLoading(true);
    fetch('/api/skills')
      .then((r) => r.json())
      .then((data) => {
        setSkills(data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || t('skillsManagement.loadError'));
        setLoading(false);
      });
  }

  function startCreate() {
    setEditingSkill(null);
    setName('');
    setCategory('');
    setDescription('');
    setModalError(null);
    setShowModal(true);
  }

  function startEdit(skill: Skill) {
    setEditingSkill(skill);
    setName(skill.name);
    setCategory(skill.category);
    setDescription(skill.description || '');
    setModalError(null);
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    const payload = {
      name: name.trim(),
      category: category.trim(),
      description: description.trim() || null,
    };

    try {
      let res;
      if (editingSkill) {
        res = await updateSkill(editingSkill.id, payload);
      } else {
        res = await createSkill(payload);
      }

      if (!res.ok) {
        setModalError(res.error);
      } else {
        setShowModal(false);
        loadSkills();
      }
    } catch (err: any) {
      setModalError(err.message || t('skillsManagement.saveError'));
    } finally {
      setModalLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteSkill(id);
      if (!res.ok) {
        setError(res.error);
      } else {
        setConfirmDeleteId(null);
        loadSkills();
      }
    } catch (err: any) {
      setError(err.message || t('skillsManagement.deleteError'));
    } finally {
      setDeleting(false);
    }
  }

  // Group skills by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    const cat = s.category || t('skillsManagement.noCategory');
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header action */}
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-ink">{t('skillsManagement.title')}</h2>
          <p className="text-xs text-ink-soft">{t('skillsManagement.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="nm-pressable inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-700"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t('skillsManagement.addBtn')}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <svg className="h-8 w-8 animate-spin text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          <p className="text-xs text-ink-soft">{t('residents.loading')}</p>
        </div>
      ) : skills.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-soft">{t('skillsManagement.emptyDb')}</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([categoryName, items]) => (
            <div key={categoryName} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-lg inline-block">{categoryName}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((s) => (
                  <div key={s.id} className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-4 flex items-start justify-between gap-3 shadow-sm hover:border-neutral-200 transition-all duration-150">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{s.name}</p>
                      {s.description && (
                        <p className="mt-1 text-xs text-ink-soft line-clamp-2 leading-relaxed">{s.description}</p>
                      )}
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(s)}
                        className="rounded-lg p-1.5 text-ink-soft hover:bg-neutral-100 hover:text-ink transition-colors"
                        title={t('skillsManagement.editTitle')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(s.id)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title={t('skillsManagement.deleteTitle')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 animate-fade-in"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <div className="relative w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-base font-bold text-ink">
                {editingSkill ? t('skillsManagement.editTitle') : t('skillsManagement.addTitle')}
              </h3>
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

            {modalError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">{t('skillsManagement.nameLabel')}</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={t('skillsManagement.namePlaceholder')} className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">{t('skillsManagement.categoryLabel')}</label>
                <input required value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t('skillsManagement.categoryPlaceholder')} className={inputCls} />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft">{t('skillsManagement.descLabel')}</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={t('skillsManagement.descPlaceholder')} className={inputCls + ' resize-none'} />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-ink-soft hover:bg-neutral-50 transition"
                >
                  {t('skillsManagement.cancelBtn')}
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="nm-pressable inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-primary-700 disabled:bg-neutral-200"
                >
                  {modalLoading ? t('skillsManagement.savingBtn') : t('skillsManagement.saveBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 animate-fade-in"
          style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
        >
          <div className="relative w-full max-w-sm rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl space-y-4 animate-scale-up text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">{t('skillsManagement.deleteTitle')}</h3>
              <p className="mt-2 text-xs text-ink-soft">{t('skillsManagement.deleteConfirm')}</p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-xs font-semibold text-ink-soft hover:bg-neutral-50 transition"
              >
                {t('skillsManagement.cancelBtn')}
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDelete(confirmDeleteId)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition"
              >
                {deleting ? t('skillsManagement.deleting') : t('skillsManagement.yesDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
